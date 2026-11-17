/**
 * "deployed": running on Vercel (or APP_MODE=deployed). Writes must reach the real backends:
 *   text changes need Cloudflare D1, file uploads need object storage, with no local fallback.
 * "local": running on your machine. Files are kept in public/assets/uploads and changes are
 *   mirrored into portfolio.db, so the site works even when D1 / storage are unavailable.
 */
export function isDeployed(): boolean {
  const mode = process.env.APP_MODE?.toLowerCase();
  if (mode === "deployed" || mode === "production") return true;
  if (mode === "local") return false;
  return !!process.env.VERCEL;
}
