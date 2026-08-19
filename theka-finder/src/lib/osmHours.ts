/**
 * Converts OpenStreetMap `opening_hours` values into the weekday/weekend
 * pair this app stores.
 *
 * The real opening_hours grammar is enormous (holidays, month ranges,
 * sunset offsets, week numbers). This handles the forms that actually
 * appear on Mumbai shops and bars, and returns null for anything else —
 * null means "we don't know", which is a truthful answer and far better
 * than a confidently wrong one.
 */

export type ParsedHours = {
  weekday: string | null;
  weekend: string | null;
};

const DAYS = ["su", "mo", "tu", "we", "th", "fr", "sa"];
const WEEKDAY_INDEXES = [1, 2, 3, 4, 5];
const WEEKEND_INDEXES = [0, 6];

function normaliseTime(t: string): string | null {
  const m = /^(\d{1,2}):?(\d{2})?$/.exec(t.trim());
  if (!m) return null;
  let hour = Number(m[1]);
  const min = Number(m[2] ?? "0");
  if (!Number.isFinite(hour) || !Number.isFinite(min) || min > 59) return null;
  // OSM writes past-midnight closes as 24:00–30:00.
  if (hour >= 24) hour -= 24;
  if (hour > 23) return null;
  return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

/** "10:00-22:00" or "10:00-14:00,17:00-22:00" -> a single spanning range. */
function parseTimeSpans(text: string): string | null {
  const spans = text.split(",").map((s) => s.trim()).filter(Boolean);
  const parsed: Array<[string, string]> = [];

  for (const span of spans) {
    const m = /^(\d{1,2}:?\d{0,2})\s*-\s*(\d{1,2}:?\d{0,2})$/.exec(span);
    if (!m) return null;
    const from = normaliseTime(m[1]);
    const to = normaliseTime(m[2]);
    if (!from || !to) return null;

    // "00:00-24:00" and "09:00-33:00" both mean a full 24 hours. Normalising
    // the close alone would collapse them to from === to, which this app's
    // isWithinRange reads as permanently closed — the opposite of the truth.
    if (from === to) return "00:00-23:59";

    parsed.push([from, to]);
  }

  if (parsed.length === 0) return null;
  // A split shift (lunch closure) collapses to first-open..last-close. We
  // lose the gap, which is a known simplification worth documenting.
  return `${parsed[0][0]}-${parsed[parsed.length - 1][1]}`;
}

/** Expands "Mo-Fr", "Sa,Su", "Mo" into day indexes. */
function parseDaySelector(text: string): number[] | null {
  const out = new Set<number>();
  for (const part of text.split(",").map((s) => s.trim()).filter(Boolean)) {
    const range = /^([a-z]{2})\s*-\s*([a-z]{2})$/i.exec(part);
    if (range) {
      const from = DAYS.indexOf(range[1].toLowerCase());
      const to = DAYS.indexOf(range[2].toLowerCase());
      if (from === -1 || to === -1) return null;
      // Ranges wrap: "Fr-Mo" means Fri, Sat, Sun, Mon.
      for (let i = from; ; i = (i + 1) % 7) {
        out.add(i);
        if (i === to) break;
      }
      continue;
    }
    const single = DAYS.indexOf(part.toLowerCase());
    if (single === -1) return null;
    out.add(single);
  }
  return out.size > 0 ? [...out] : null;
}

function summarise(byDay: Map<number, string | null>, indexes: number[]): string | null {
  const values = indexes.map((i) => byDay.get(i)).filter((v) => v !== undefined);
  if (values.length === 0) return null;

  const open = values.filter((v): v is string => v !== null);

  if (open.length === 0) return "closed";

  // Some days open, some closed. A single field cannot say "Saturday yes,
  // Sunday no", and reporting the open hours would assert the closed day is
  // open. Unknown is the only truthful answer this model can give.
  // `npm run import:osm` reports how often this happens.
  if (open.length !== values.length) return null;

  // All open but with differing times: take the most common and accept the
  // imprecision, since every day genuinely does open.
  const counts = new Map<string, number>();
  for (const v of open) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

export function parseOpeningHours(raw: string | undefined | null): ParsedHours {
  const none: ParsedHours = { weekday: null, weekend: null };
  if (!raw) return none;

  const value = raw.trim().toLowerCase();
  if (!value) return none;

  if (value === "24/7") {
    return { weekday: "00:00-23:59", weekend: "00:00-23:59" };
  }
  // Anything conditional, seasonal or holiday-scoped is beyond this parser.
  if (/(ph|su\[|week|easter|sunrise|sunset|open|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/.test(value)) {
    return none;
  }

  const byDay = new Map<number, string | null>();
  let sawAnything = false;

  for (const rule of value.split(";").map((r) => r.trim()).filter(Boolean)) {
    // Bare time span with no day selector applies to every day.
    const bare = parseTimeSpans(rule);
    if (bare) {
      for (let i = 0; i < 7; i++) byDay.set(i, bare);
      sawAnything = true;
      continue;
    }

    const m = /^([a-z]{2}(?:\s*[-,]\s*[a-z]{2})*)\s+(.+)$/i.exec(rule);
    if (!m) {
      // "Mo-Su off" style.
      const offMatch = /^([a-z]{2}(?:\s*[-,]\s*[a-z]{2})*)\s*(off|closed)$/i.exec(rule);
      if (offMatch) {
        const days = parseDaySelector(offMatch[1]);
        if (days) {
          for (const d of days) byDay.set(d, null);
          sawAnything = true;
        }
      }
      continue;
    }

    const days = parseDaySelector(m[1]);
    if (!days) continue;

    const rest = m[2].trim();
    if (rest === "off" || rest === "closed") {
      for (const d of days) byDay.set(d, null);
      sawAnything = true;
      continue;
    }

    const span = parseTimeSpans(rest);
    if (!span) continue;
    for (const d of days) byDay.set(d, span);
    sawAnything = true;
  }

  if (!sawAnything) return none;

  return {
    weekday: summarise(byDay, WEEKDAY_INDEXES),
    weekend: summarise(byDay, WEEKEND_INDEXES),
  };
}
