import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { unstable_rethrow } from "next/navigation";
import { createClient } from "@libsql/client";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { drizzle as drizzleProxy, type SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";
import { isDeployed } from "@/lib/runtime";
import { d1Raw, getD1Config } from "./d1.mjs";
import { createLocalTables, createRemoteTables } from "./sync-core.mjs";

export type Db = SqliteRemoteDatabase<typeof schema>;

// ---------------------------------------------------------------------------
// Local SQLite: the committed portfolio.db file. Always available, used as the
// fallback whenever D1 is not configured or not reachable.
// ---------------------------------------------------------------------------
function resolveLocalDbUrl() {
  if (process.env.LOCAL_DB_URL) return process.env.LOCAL_DB_URL;
  const committed = path.join(process.cwd(), "portfolio.db");

  // Serverless deployments have a read-only filesystem: work on a copy in /tmp.
  if (process.env.VERCEL) {
    const tmp = path.join(os.tmpdir(), "portfolio.db");
    try {
      if (!fs.existsSync(tmp) && fs.existsSync(committed)) fs.copyFileSync(committed, tmp);
    } catch (err) {
      console.error("[db] Could not copy portfolio.db to tmp:", err);
    }
    return `file:${tmp}`;
  }
  return `file:${committed}`;
}

export const localClient = createClient({ url: resolveLocalDbUrl() });
export const localDb = drizzleLibsql(localClient, { schema }) as unknown as Db;

// ---------------------------------------------------------------------------
// Cloudflare D1 over HTTP: the primary database when configured.
// ---------------------------------------------------------------------------
export const d1Config = getD1Config();
const remoteDb: Db | null = d1Config
  ? drizzleProxy(
      async (query, params, method) => {
        const { rows } = await d1Raw(d1Config, query, params);
        // "get" expects a single row, the rest expect an array of rows.
        return { rows: method === "get" ? (rows[0] as any) : rows };
      },
      { schema }
    )
  : null;

// After a D1 failure, skip D1 for a while so pages don't wait on timeouts every request.
const RETRY_D1_AFTER_MS = 30_000;
let d1DownUntil = 0;

export function d1Available() {
  return remoteDb !== null && Date.now() >= d1DownUntil;
}

export function markD1Down(err: unknown) {
  // Next.js signals (dynamic rendering, redirects, notFound) are thrown as errors: they aren't D1 failures.
  unstable_rethrow(err);
  d1DownUntil = Date.now() + RETRY_D1_AFTER_MS;
  console.error(`[db] D1 failed, using local SQLite for the next ${RETRY_D1_AFTER_MS / 1000}s:`, err);
}

export function currentEngine(): "d1" | "local" {
  return d1Available() ? "d1" : "local";
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------
let localInit: Promise<void> | null = null;
let remoteInit: Promise<void> | null = null;

function once(get: () => Promise<void> | null, set: (p: Promise<void> | null) => void, fn: () => Promise<void>) {
  let p = get();
  if (!p) {
    p = fn().catch((err) => {
      set(null);
      throw err;
    });
    set(p);
  }
  return p;
}

const ensureLocal = () =>
  once(() => localInit, (p) => (localInit = p), () => createLocalTables(localClient));

const ensureRemote = () =>
  once(() => remoteInit, (p) => (remoteInit = p), () => createRemoteTables(d1Config!));

/** Creates the tables (locally always, on D1 when reachable). Runs once per server process. */
export async function ensureDbInitialized() {
  await ensureLocal();
  if (d1Available()) {
    try {
      await ensureRemote();
    } catch (err) {
      markD1Down(err);
    }
  }
}

// ---------------------------------------------------------------------------
// Read / write helpers used by every query and server action
// ---------------------------------------------------------------------------

/** Reads from D1, falling back to the local SQLite file if D1 is down. */
export async function read<T>(fn: (db: Db) => PromiseLike<T>): Promise<T> {
  await ensureDbInitialized();
  if (d1Available()) {
    try {
      return await fn(remoteDb!);
    } catch (err) {
      markD1Down(err);
    }
  }
  return await fn(localDb);
}

type WriteQuery = PromiseLike<unknown> & { toSQL(): { sql: string; params: unknown[] } };

export class WriteError extends Error {}

/**
 * Writes a change.
 *
 * Deployed (Vercel): D1 is required. If it isn't configured or the write fails, this throws
 * and nothing is changed. The instance's local copy is updated best-effort for fallback reads.
 *
 * Local: writes to D1 and mirrors into portfolio.db. If D1 is down the write still lands
 * locally and is queued in `_pending_writes` for `pnpm db:sync` to replay; returns
 * `synced: false` so the UI can say so.
 */
export async function write(fn: (db: Db) => WriteQuery): Promise<{ synced: boolean }> {
  await ensureDbInitialized();

  if (isDeployed()) {
    if (!remoteDb) throw new WriteError("Cloudflare D1 isn't configured on this deployment, so changes can't be saved.");
    try {
      await fn(remoteDb); // always try D1 here, even if a recent read marked it down
    } catch (err) {
      markD1Down(err);
      throw new WriteError("Cloudflare D1 is unreachable, so nothing was saved. Please try again.");
    }
    d1DownUntil = 0;
    try {
      await fn(localDb);
    } catch (err) {
      console.error("[db] Local mirror write failed (D1 write succeeded):", err);
    }
    return { synced: true };
  }

  let wroteRemote = false;
  if (d1Available()) {
    try {
      await fn(remoteDb!);
      wroteRemote = true;
    } catch (err) {
      markD1Down(err);
    }
  }

  try {
    const localQuery = fn(localDb);
    await localQuery;
    if (remoteDb && !wroteRemote) {
      const { sql, params } = localQuery.toSQL();
      await localClient.execute({
        sql: "INSERT INTO _pending_writes (sql, params, created_at) VALUES (?, ?, ?)",
        args: [sql, JSON.stringify(params), Date.now()],
      });
    }
  } catch (err) {
    // The local copy is only a mirror when D1 took the write; don't fail the request for it.
    if (!wroteRemote) throw err;
    console.error("[db] Local mirror write failed (D1 write succeeded):", err);
  }

  // synced = the change is in the primary database (D1, or the local file when D1 isn't configured)
  return { synced: wroteRemote || !remoteDb };
}
