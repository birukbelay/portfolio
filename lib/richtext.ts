// Helpers for the rich-text resume summary. Older summaries are plain text; new ones are HTML
// produced by the editor (bold, italic, underline, strike, links, lists).

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const isHtml = (s: string) => /<\/?(p|strong|em|u|s|a|ul|ol|li|br)\b/i.test(s);

/** Plain text → paragraphs. Single line breaks (hard-wrapped seed text) are joined. */
export function plainToHtml(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
}

/** Editor-ready HTML for a stored summary (plain or HTML). */
export const summaryToHtml = (stored: string) => (isHtml(stored) ? stored : plainToHtml(stored));

/** Text-only version, e.g. for meta descriptions and length checks. */
export function htmlToText(html: string) {
  return html
    .replace(/<\/(p|li)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
