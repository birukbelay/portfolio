// Keeps the local copies (portfolio.db + public/assets/uploads) in sync with Cloudflare D1 and
// object storage, then commits and pushes them. Runs before every `pnpm dev`, or with `pnpm db:sync`.
//
// Database
//   1. Replays writes that only reached the local file while D1 was down.
//   2. Copies local data into any D1 table that is still empty (first run on a new D1 database).
//   3. Pulls D1 into portfolio.db, so the committed file is an up-to-date fallback.
// Uploads
//   4. Uploads local files that storage doesn't have yet (e.g. added while storage was down).
//   5. Downloads files that only exist in storage (e.g. uploaded on the deployed site).
// Git
//   6. If the data or uploads changed: commits only those paths and pushes.
//
// It never blocks the app from starting: failures are logged and the script exits 0.
// Env toggles: DB_SYNC_COMMIT=false (skip commit + push), DB_SYNC_PUSH=false (commit but don't push).

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient } from "@libsql/client";
import { getD1Config } from "../lib/db/d1.mjs";
import {
  createLocalTables,
  createRemoteTables,
  replayPendingWrites,
  bootstrapRemoteFromLocal,
  pullRemoteIntoLocal,
  dumpSyncedTables,
} from "../lib/db/sync-core.mjs";
import {
  STORAGE_KEY_PREFIX,
  UPLOAD_DIR,
  contentTypeFor,
  getObject,
  getStorageConfig,
  listKeys,
  putObject,
} from "../lib/storage/s3.mjs";

const DB_FILE = "portfolio.db";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const log = (msg) => console.log(`[db:sync] ${msg}`);
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

async function main() {
  if (process.env.VERCEL || process.env.CI) {
    log("Skipped in CI / Vercel builds.");
    return;
  }

  const local = createClient({ url: `file:${path.join(root, DB_FILE)}` });
  try {
    const dbSynced = await syncDatabase(local);
    await syncUploads();
    await commitAndPush(local, dbSynced);
  } finally {
    local.close();
  }
}

// ---------------------------------------------------------------- database
async function syncDatabase(local) {
  const d1 = getD1Config();
  if (!d1) {
    log("Cloudflare D1 env vars not set; using the local SQLite file only.");
    return false;
  }
  try {
    await createLocalTables(local);
    await createRemoteTables(d1);

    const replayed = await replayPendingWrites(local, d1);
    if (replayed) log(`Replayed ${replayed} pending write(s) on D1.`);

    const copied = await bootstrapRemoteFromLocal(local, d1);
    if (copied.length) log(`Copied local data into empty D1 tables: ${copied.join(", ")}.`);

    await pullRemoteIntoLocal(local, d1);
    // Login accounts live only in D1; keep password hashes out of the committed file.
    await local.execute("DELETE FROM users");
    await local.execute("VACUUM");
    log("Local SQLite is now in sync with D1.");
    return true;
  } catch (err) {
    log(`Database sync failed, keeping the existing local file: ${err.message}`);
    return false;
  }
}

// ---------------------------------------------------------------- uploads
async function syncUploads() {
  const storage = getStorageConfig();
  if (!storage) {
    log("Object storage not configured; uploads stay in public/assets/uploads only.");
    return;
  }
  const dir = path.join(root, UPLOAD_DIR);
  try {
    fs.mkdirSync(dir, { recursive: true });
    const localFiles = new Set(fs.readdirSync(dir).filter((f) => !f.startsWith(".")));
    const remoteFiles = new Set((await listKeys(storage, STORAGE_KEY_PREFIX)).map((k) => k.slice(STORAGE_KEY_PREFIX.length)));

    let up = 0, down = 0;
    for (const file of localFiles) {
      if (remoteFiles.has(file)) continue;
      await putObject(storage, STORAGE_KEY_PREFIX + file, fs.readFileSync(path.join(dir, file)), contentTypeFor(file));
      up++;
    }
    for (const file of remoteFiles) {
      if (localFiles.has(file) || file.includes("/")) continue;
      fs.writeFileSync(path.join(dir, file), await getObject(storage, STORAGE_KEY_PREFIX + file));
      down++;
    }
    log(up || down ? `Uploads in sync (${up} uploaded to storage, ${down} downloaded).` : "Uploads already in sync.");
  } catch (err) {
    log(`Uploads sync failed: ${err.message}`);
  }
}

// ---------------------------------------------------------------- git
async function commitAndPush(local, dbSynced) {
  if (process.env.DB_SYNC_COMMIT === "false") return;
  try {
    git("rev-parse", "--is-inside-work-tree");
  } catch {
    log("Not a git repository; skipping commit.");
    return;
  }

  const paths = [];
  if (dbSynced) {
    // SQLite files change bytes even when the data doesn't, so compare the actual content with HEAD.
    if (await dbChangedSinceHead(local)) {
      paths.push(DB_FILE);
    } else {
      try { git("checkout", "HEAD", "--", DB_FILE); } catch {}
    }
  }
  if (fs.existsSync(path.join(root, UPLOAD_DIR)) && git("status", "--porcelain", "--", UPLOAD_DIR)) {
    paths.push(UPLOAD_DIR);
  }

  if (!paths.length) {
    log("No data or upload changes to commit.");
    return;
  }

  git("add", "-f", "--", ...paths);
  // Commit only these paths, leaving any other staged work alone.
  git("commit", "--only", "-m", "chore(data): sync portfolio.db and uploads", "--", ...paths);
  log(`Committed ${paths.join(" and ")}.`);

  if (process.env.DB_SYNC_PUSH === "false") return;
  try {
    git("rev-parse", "--abbrev-ref", "@{u}");
  } catch {
    log("Current branch has no upstream; skipping push.");
    return;
  }
  try {
    git("push");
    log("Pushed.");
  } catch (err) {
    log(`Push failed (commit kept locally): ${err.stderr || err.message}`);
  }
}

async function dbChangedSinceHead(local) {
  let headBytes;
  try {
    headBytes = execFileSync("git", ["show", `HEAD:${DB_FILE}`], { cwd: root, stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return true; // not committed yet
  }

  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-db-")), DB_FILE);
  fs.writeFileSync(tmp, headBytes);
  const head = createClient({ url: `file:${tmp}` });
  try {
    const [a, b] = await Promise.all([dumpSyncedTables(local), dumpSyncedTables(head)]);
    const pending = await local.execute("SELECT COUNT(*) AS n FROM _pending_writes");
    return a !== b || Number(pending.rows[0].n) > 0;
  } finally {
    head.close();
    fs.rmSync(path.dirname(tmp), { recursive: true, force: true });
  }
}

main().catch((err) => log(`Unexpected error: ${err.message}`));
