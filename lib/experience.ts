// Helpers that turn the experience text columns (title, timeFrame, location) into structured
// parts for the editor and the public pages, and back. The database keeps plain strings.

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ---------------------------------------------------------------- Title: "Role | Company"
export function splitTitle(title: string): { role: string; company: string } {
  const [role, ...rest] = title.split("|");
  return { role: role.trim(), company: rest.join("|").trim() };
}

export function joinTitle(role: string, company: string) {
  return company.trim() ? `${role.trim()} | ${company.trim()}` : role.trim();
}

// ---------------------------------------------------------------- Time frame
export type MonthYear = { month: number | null; year: string }; // month: 0-11, null = year only
export type Period = { start: MonthYear; end: MonthYear; current: boolean };

const CURRENT_WORDS = /^(present|current|now|today|ongoing)$/i;

function parseMonthYear(text: string): MonthYear | null {
  const m = text.trim().match(/^(?:([A-Za-z]+)\.?,?\s+)?(\d{4})$/);
  if (!m) return null;
  if (!m[1]) return { month: null, year: m[2] };
  const idx = MONTHS.findIndex((name) => m[1].toLowerCase().startsWith(name.toLowerCase()));
  return idx === -1 ? null : { month: idx, year: m[2] };
}

/** Parses e.g. "Nov 2023 - Current)", "(2017 - 2022)", "July 2021 – September 2021". Null if it can't. */
export function parseTimeFrame(text: string): Period | null {
  const clean = text.replace(/[()]/g, "").trim();
  const parts = clean.split(/\s*[-–—]\s*|\s+to\s+/i);
  if (parts.length !== 2) return null;
  const start = parseMonthYear(parts[0]);
  if (!start) return null;
  if (CURRENT_WORDS.test(parts[1].trim())) return { start, end: { month: null, year: "" }, current: true };
  const end = parseMonthYear(parts[1]);
  return end ? { start, end, current: false } : null;
}

const fmtMonthYear = ({ month, year }: MonthYear) => (month === null ? year : `${MONTHS[month]} ${year}`);

export function formatTimeFrame(p: Period) {
  return `${fmtMonthYear(p.start)} – ${p.current ? "Present" : fmtMonthYear(p.end)}`;
}

/** Normalised display text: "Nov 2023 – Present". Falls back to the raw text, minus stray brackets. */
export function displayTimeFrame(text: string) {
  const p = parseTimeFrame(text);
  return p ? formatTimeFrame(p) : text.replace(/[()]/g, "").trim();
}

export function isCurrent(text: string) {
  return parseTimeFrame(text)?.current ?? false;
}

// ---------------------------------------------------------------- Location + work mode
export const WORK_MODES = ["On-site", "Hybrid", "Remote"] as const;
export type WorkMode = (typeof WORK_MODES)[number];

/** "Kenya, Nairobi: remote" → { place: "Kenya, Nairobi", mode: "Remote" } */
export function parseLocation(text: string): { place: string; mode: WorkMode } {
  const m = text.match(/^(.*?)\s*(?:[:·•|\-–]\s*|\()\s*(remote|hybrid|on-?site)\)?\s*$/i);
  if (!m) {
    if (/^remote$/i.test(text.trim())) return { place: "", mode: "Remote" };
    return { place: text.trim(), mode: "On-site" };
  }
  const word = m[2].toLowerCase();
  const mode: WorkMode = word === "remote" ? "Remote" : word === "hybrid" ? "Hybrid" : "On-site";
  return { place: m[1].trim().replace(/[,:·]$/, ""), mode };
}

export function formatLocation(place: string, mode: WorkMode) {
  const p = place.trim();
  if (mode === "On-site") return p;
  return p ? `${p} · ${mode}` : mode;
}
