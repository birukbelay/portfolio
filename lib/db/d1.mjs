// Minimal client for the Cloudflare D1 HTTP API.
// Used because the app runs on Vercel / Node, where the Workers D1 binding isn't available.
// Docs: https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/raw/
// Shared by the app (lib/db/index.ts) and the sync script (scripts/sync-db.mjs).

/** @typedef {{ accountId: string, databaseId: string, apiToken: string }} D1Config */

/** @returns {D1Config | null} */
export function getD1Config() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_D1_API_TOKEN;
  if (!accountId || !databaseId || !apiToken) return null;
  return { accountId, databaseId, apiToken };
}

const TIMEOUT_MS = Number(process.env.D1_TIMEOUT_MS || 5000);

/**
 * Runs one SQL statement on D1.
 * @param {D1Config} config
 * @param {string} sql
 * @param {unknown[]} [params]
 * @returns {Promise<{ columns: string[], rows: unknown[][] }>}
 */
export async function d1Raw(config, sql, params = []) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}/raw`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params }),
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) {
    const message = body?.errors?.map((e) => `${e.code}: ${e.message}`).join("; ") || res.statusText;
    throw new Error(`D1 query failed (${res.status}): ${message}`);
  }

  const results = body.result?.[0]?.results;
  return { columns: results?.columns ?? [], rows: results?.rows ?? [] };
}
