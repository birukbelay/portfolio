// Table definitions and D1 <-> local SQLite sync logic.
// Shared by the app (lib/db/index.ts, lib/db/seed.ts) and the sync script (scripts/sync-db.mjs).
import { d1Raw } from "./d1.mjs";

export const CREATE_TABLES = [
  `CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tech TEXT NOT NULL,
    image TEXT NOT NULL,
    technologies TEXT NOT NULL,
    desc TEXT NOT NULL,
    code TEXT,
    demo TEXT,
    video TEXT,
    "order" INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Other',
    image TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    created_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS experiences (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    time_frame TEXT NOT NULL,
    key_tasks TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    created_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS resume_info (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL DEFAULT 'Biruk B Kassa',
    about TEXT NOT NULL,
    titles TEXT NOT NULL,
    resume_link TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    medium_url TEXT,
    updated_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    password TEXT,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at INTEGER
  )`,
];

// Local-only: writes that reached the local DB but not D1 (because D1 was down).
// They are replayed on D1 by the next sync.
export const CREATE_PENDING_TABLE = `CREATE TABLE IF NOT EXISTS _pending_writes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sql TEXT NOT NULL,
  params TEXT NOT NULL,
  created_at INTEGER NOT NULL
)`;

// Content tables kept identical between D1 and the committed SQLite file.
// `users` is deliberately left out so password hashes never end up in git.
export const SYNCED_TABLES = ["projects", "skills", "experiences", "resume_info"];

/** @param {import("@libsql/client").Client} local */
export async function createLocalTables(local) {
  for (const stmt of [...CREATE_TABLES, CREATE_PENDING_TABLE]) await local.execute(stmt);
}

/** @param {import("./d1.mjs").D1Config} d1 */
export async function createRemoteTables(d1) {
  for (const stmt of CREATE_TABLES) await d1Raw(d1, stmt);
}

/**
 * Re-runs on D1 the writes that only reached the local DB. Stops at the first failure.
 * @returns {Promise<number>} number of writes replayed
 */
export async function replayPendingWrites(local, d1) {
  const { rows } = await local.execute("SELECT id, sql, params FROM _pending_writes ORDER BY id");
  for (const row of rows) {
    await d1Raw(d1, String(row.sql), JSON.parse(String(row.params)));
    await local.execute({ sql: "DELETE FROM _pending_writes WHERE id = ?", args: [row.id] });
  }
  return rows.length;
}

/**
 * Copies local rows into D1 for every synced table that is empty on D1
 * (first run against a fresh D1 database).
 * @returns {Promise<string[]>} tables that were copied
 */
export async function bootstrapRemoteFromLocal(local, d1) {
  const copied = [];
  for (const table of SYNCED_TABLES) {
    const remote = await d1Raw(d1, `SELECT COUNT(*) FROM ${table}`);
    if (Number(remote.rows[0]?.[0] ?? 0) > 0) continue;

    const { columns, rows } = await local.execute(`SELECT * FROM ${table}`);
    if (rows.length === 0) continue;

    const cols = columns.map((c) => `"${c}"`).join(", ");
    const placeholders = columns.map(() => "?").join(", ");
    for (const row of rows) {
      await d1Raw(
        d1,
        `INSERT OR REPLACE INTO ${table} (${cols}) VALUES (${placeholders})`,
        columns.map((c) => row[c] ?? null)
      );
    }
    copied.push(table);
  }
  return copied;
}

/** Replaces the local content of every synced table with what's in D1, in one transaction. */
export async function pullRemoteIntoLocal(local, d1) {
  const statements = [];
  for (const table of SYNCED_TABLES) {
    const { columns, rows } = await d1Raw(d1, `SELECT * FROM ${table} ORDER BY id`);
    statements.push(`DELETE FROM ${table}`);
    if (columns.length === 0) continue;
    const cols = columns.map((c) => `"${c}"`).join(", ");
    const placeholders = columns.map(() => "?").join(", ");
    for (const row of rows) {
      statements.push({ sql: `INSERT INTO ${table} (${cols}) VALUES (${placeholders})`, args: row });
    }
  }
  await local.batch(statements, "write");
}

/** Deterministic JSON of the synced content, used to tell whether anything really changed. */
export async function dumpSyncedTables(local) {
  const out = {};
  for (const table of SYNCED_TABLES) {
    try {
      const { rows } = await local.execute(`SELECT * FROM ${table} ORDER BY id`);
      out[table] = rows.map((r) => ({ ...r }));
    } catch {
      out[table] = null;
    }
  }
  return JSON.stringify(out);
}
