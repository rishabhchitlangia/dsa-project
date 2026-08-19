/**
 * Opening-hours parsing and the open/verified badge state.
 *
 * Everything here works in IST regardless of where the server runs, because
 * "is this Mumbai shop open right now" is a question about Mumbai's clock,
 * not the host's.
 */

const IST_TIMEZONE = "Asia/Kolkata";

export type BadgeState = "open" | "verified_closed" | "unverified";

export type ShopHours = {
  hoursWeekday: string;
  hoursWeekend: string;
};

export type OpenStatus = {
  state: BadgeState;
  label: string;
  /** Null when the shop is closed today or hours are unparseable. */
  todayRange: string | null;
  isOpenNow: boolean;
  verifiedToday: boolean;
};

/** Current wall-clock time in Mumbai, as parts we can compare against hours. */
export function nowInIST(reference: Date = new Date()): {
  minutes: number;
  weekday: number;
  ymd: string;
} {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(reference).map((p) => [p.type, p.value]),
  );
  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  // Intl renders midnight as "24" in some en-GB implementations.
  const hour = Number(parts.hour) % 24;
  return {
    minutes: hour * 60 + Number(parts.minute),
    weekday: weekdayMap[parts.weekday as string] ?? 0,
    ymd: `${parts.year}-${parts.month}-${parts.day}`,
  };
}

/** Saturday and Sunday use `hoursWeekend`. */
export function isWeekend(weekday: number): boolean {
  return weekday === 0 || weekday === 6;
}

export function rangeForDay(hours: ShopHours, weekday: number): string {
  return isWeekend(weekday) ? hours.hoursWeekend : hours.hoursWeekday;
}

function toMinutes(hhmm: string): number | null {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hhmm.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/**
 * True when `minutes` falls inside the range. Ranges that end before they
 * start are treated as running past midnight — "17:00-01:30" is open at
 * 00:45. Dive bars in particular depend on this.
 */
export function isWithinRange(range: string, minutes: number): boolean {
  const trimmed = range.trim();
  if (!trimmed || trimmed.toLowerCase() === "closed") return false;

  const [rawOpen, rawClose] = trimmed.split("-");
  if (!rawOpen || !rawClose) return false;

  const open = toMinutes(rawOpen);
  const close = toMinutes(rawClose);
  if (open === null || close === null) return false;

  if (open === close) return false;
  if (close > open) return minutes >= open && minutes < close;
  // Overnight: open until close on the following day.
  return minutes >= open || minutes < close;
}

/**
 * Whether an overnight range that started *yesterday* is still running.
 * At 00:30 a shop listed 17:00-01:30 is open on yesterday's session, and
 * yesterday may have been a different weekday bucket.
 */
function isOpenFromPreviousDay(
  hours: ShopHours,
  weekday: number,
  minutes: number,
): boolean {
  const yesterday = (weekday + 6) % 7;
  const range = rangeForDay(hours, yesterday).trim();
  if (!range || range.toLowerCase() === "closed") return false;
  const [rawOpen, rawClose] = range.split("-");
  if (!rawOpen || !rawClose) return false;
  const open = toMinutes(rawOpen);
  const close = toMinutes(rawClose);
  if (open === null || close === null) return false;
  // Only overnight ranges can spill into today.
  if (close >= open) return false;
  return minutes < close;
}

export function isOpenNow(hours: ShopHours, reference?: Date): boolean {
  const { minutes, weekday } = nowInIST(reference);
  return (
    isWithinRange(rangeForDay(hours, weekday), minutes) ||
    isOpenFromPreviousDay(hours, weekday, minutes)
  );
}

/** True when `verifiedAt` falls on today's date in Mumbai. */
export function wasVerifiedToday(
  verifiedAt: Date | string | null | undefined,
  reference?: Date,
): boolean {
  if (!verifiedAt) return false;
  const at = typeof verifiedAt === "string" ? new Date(verifiedAt) : verifiedAt;
  if (Number.isNaN(at.getTime())) return false;
  return nowInIST(at).ymd === nowInIST(reference).ymd;
}

/**
 * The badge shown on cards and shop pages.
 *
 * Green "Open now" requires both that the shop was verified today AND that
 * the current time falls inside its listed hours — green never claims more
 * than we actually know. Verified but outside hours gets its own amber
 * state so the verification isn't wasted; everything else is grey.
 */
export function getOpenStatus(
  shop: ShopHours & {
    verifiedToday: boolean;
    verifiedAt: Date | string | null;
  },
  reference?: Date,
): OpenStatus {
  const { weekday } = nowInIST(reference);
  const rawRange = rangeForDay(shop, weekday).trim();
  const todayRange =
    rawRange && rawRange.toLowerCase() !== "closed" ? rawRange : null;

  const openNow = isOpenNow(shop, reference);

  // verifiedAt is authoritative; the boolean alone would never expire.
  const verified = shop.verifiedAt
    ? wasVerifiedToday(shop.verifiedAt, reference)
    : false;

  if (verified && openNow) {
    return {
      state: "open",
      label: "Open now",
      todayRange,
      isOpenNow: true,
      verifiedToday: true,
    };
  }
  if (verified) {
    return {
      state: "verified_closed",
      label: todayRange ? "Verified today · closed now" : "Verified today · closed",
      todayRange,
      isOpenNow: false,
      verifiedToday: true,
    };
  }
  return {
    state: "unverified",
    label: "Hours may vary — unverified today",
    todayRange,
    isOpenNow: openNow,
    verifiedToday: false,
  };
}

/** "10:00-22:30" -> "10:00 am – 10:30 pm" for display. */
export function formatRange(range: string): string {
  const trimmed = range.trim();
  if (!trimmed || trimmed.toLowerCase() === "closed") return "Closed";
  const [open, close] = trimmed.split("-");
  const fmt = (t: string) => {
    const mins = toMinutes(t ?? "");
    if (mins === null) return t;
    const h24 = Math.floor(mins / 60);
    const m = mins % 60;
    const suffix = h24 < 12 ? "am" : "pm";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
  };
  return `${fmt(open)} – ${fmt(close)}`;
}
