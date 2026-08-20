import test from "node:test";
import assert from "node:assert/strict";
import {
  isWithinRange,
  isOpenNow,
  getOpenStatus,
  wasVerifiedToday,
  formatRange,
  nowInIST,
} from "../hours";

/** A Date at the given IST wall-clock time. IST is UTC+5:30, no DST. */
function ist(dateISO: string, hh: number, mm: number): Date {
  return new Date(`${dateISO}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00+05:30`);
}

// 2026-08-17 is a Monday, 2026-08-22 a Saturday, 2026-08-23 a Sunday.
const MON = "2026-08-17";
const SAT = "2026-08-22";
const SUN = "2026-08-23";

test("nowInIST reads Mumbai wall clock regardless of host timezone", () => {
  const t = nowInIST(ist(MON, 14, 30));
  assert.equal(t.minutes, 14 * 60 + 30);
  assert.equal(t.weekday, 1);
  assert.equal(t.ymd, "2026-08-17");
});

test("nowInIST handles midnight without rolling to 24:00", () => {
  const t = nowInIST(ist(MON, 0, 15));
  assert.equal(t.minutes, 15);
  assert.equal(t.ymd, "2026-08-17");
});

test("same-day ranges", () => {
  assert.equal(isWithinRange("10:00-22:00", 9 * 60 + 59), false);
  assert.equal(isWithinRange("10:00-22:00", 10 * 60), true);
  assert.equal(isWithinRange("10:00-22:00", 21 * 60 + 59), true);
  assert.equal(isWithinRange("10:00-22:00", 22 * 60), false, "closing minute is closed");
});

test("overnight ranges wrap past midnight", () => {
  assert.equal(isWithinRange("17:00-01:30", 18 * 60), true);
  assert.equal(isWithinRange("17:00-01:30", 23 * 60 + 59), true);
  assert.equal(isWithinRange("17:00-01:30", 0 * 60 + 45), true, "00:45 is inside");
  assert.equal(isWithinRange("17:00-01:30", 1 * 60 + 30), false, "closing minute");
  assert.equal(isWithinRange("17:00-01:30", 9 * 60), false, "morning is closed");
});

test("closed and malformed ranges are never open", () => {
  for (const r of ["closed", "Closed", "", "   ", "nonsense", "25:00-26:00", "10:00", "10:00-10:00"]) {
    assert.equal(isWithinRange(r, 12 * 60), false, `${r} should be closed`);
  }
});

test("weekend uses hoursWeekend", () => {
  const shop = { hoursWeekday: "10:00-18:00", hoursWeekend: "10:00-23:00" };
  assert.equal(isOpenNow(shop, ist(MON, 20, 0)), false, "Monday 8pm closed");
  assert.equal(isOpenNow(shop, ist(SAT, 20, 0)), true, "Saturday 8pm open");
  assert.equal(isOpenNow(shop, ist(SUN, 20, 0)), true, "Sunday 8pm open");
});

test("an overnight session started yesterday is still open after midnight", () => {
  // Sunday 17:00-01:30 spills into Monday 00:xx, which is a weekday bucket.
  const shop = { hoursWeekday: "17:00-01:00", hoursWeekend: "17:00-01:30" };

  // Monday 00:30 and 01:15 both belong to *Sunday's* 17:00-01:30 session,
  // which runs later than the weekday close. The previous day's bucket is
  // what decides, not today's.
  assert.equal(isOpenNow(shop, ist(MON, 0, 30)), true);
  assert.equal(isOpenNow(shop, ist(MON, 1, 15)), true, "Sunday's session runs to 01:30");
  assert.equal(isOpenNow(shop, ist(MON, 1, 30)), false, "Sunday's session has ended");

  // Tuesday 01:15 follows Monday's weekday session, which closed at 01:00.
  assert.equal(isOpenNow(shop, ist("2026-08-18", 1, 15)), false, "weekday session closed at 01:00");
  assert.equal(isOpenNow(shop, ist("2026-08-18", 0, 30)), true, "Monday's session still running");

  // Monday 06:00 — nothing running.
  assert.equal(isOpenNow(shop, ist(MON, 6, 0)), false);
});

test("wasVerifiedToday is evaluated on Mumbai's date, not UTC's", () => {
  // 2026-08-17 19:00 UTC is already 2026-08-18 00:30 IST.
  const lateUTC = new Date("2026-08-17T19:00:00Z");
  assert.equal(wasVerifiedToday(lateUTC, ist("2026-08-18", 9, 0)), true);
  assert.equal(wasVerifiedToday(lateUTC, ist("2026-08-17", 9, 0)), false);
  assert.equal(wasVerifiedToday(null), false);
  assert.equal(wasVerifiedToday(new Date("not a date")), false);
});

test("badge: green only when verified today AND inside hours", () => {
  const base = { hoursWeekday: "10:00-22:00", hoursWeekend: "10:00-23:00" };
  const noon = ist(MON, 12, 0);
  const threeAM = ist(MON, 3, 0);

  const verifiedOpen = getOpenStatus(
    { ...base, verifiedToday: true, verifiedAt: ist(MON, 8, 0) },
    noon,
  );
  assert.equal(verifiedOpen.state, "open");
  assert.equal(verifiedOpen.label, "Open now");

  const verifiedClosed = getOpenStatus(
    { ...base, verifiedToday: true, verifiedAt: ist(MON, 2, 0) },
    threeAM,
  );
  assert.equal(verifiedClosed.state, "verified_closed", "verified at 3am but shut");

  const unverified = getOpenStatus(
    { ...base, verifiedToday: false, verifiedAt: null },
    noon,
  );
  assert.equal(unverified.state, "unverified");
  assert.match(unverified.label, /unverified today/);
});

test("badge: a stale verifiedAt does not keep claiming green", () => {
  const shop = {
    hoursWeekday: "10:00-22:00",
    hoursWeekend: "10:00-23:00",
    verifiedToday: true, // boolean never reset by anyone
    verifiedAt: ist("2026-03-01", 10, 0), // months ago
  };
  const status = getOpenStatus(shop, ist(MON, 12, 0));
  assert.equal(status.state, "unverified", "months-old verification must expire");
});

test("formatRange renders 12-hour times", () => {
  assert.equal(formatRange("10:00-22:30"), "10:00 am – 10:30 pm");
  assert.equal(formatRange("17:00-01:30"), "5:00 pm – 1:30 am");
  assert.equal(formatRange("00:00-12:00"), "12:00 am – 12:00 pm");
  assert.equal(formatRange("closed"), "Closed");
});

test("no hours on record never claims open or closed", () => {
  const unknown = { hoursWeekday: null, hoursWeekend: null };

  assert.equal(isOpenNow(unknown, ist(MON, 12, 0)), false);

  const status = getOpenStatus(
    { ...unknown, verifiedToday: false, verifiedAt: null },
    ist(MON, 12, 0),
  );
  assert.equal(status.hoursUnknown, true);
  assert.equal(status.state, "unverified");
  assert.equal(status.label, "Hours not listed");
  assert.equal(status.todayRange, null);
});

test("unknown hours stay unknown even when verified today", () => {
  // Someone can confirm a shop exists without knowing its hours. That must
  // not turn into a green "Open now".
  const status = getOpenStatus(
    {
      hoursWeekday: null,
      hoursWeekend: null,
      verifiedToday: true,
      verifiedAt: ist(MON, 9, 0),
    },
    ist(MON, 12, 0),
  );
  assert.equal(status.state, "unverified");
  assert.equal(status.hoursUnknown, true);
  assert.equal(status.isOpenNow, false);
});

test("one side known, the other missing", () => {
  // Weekday hours recorded, weekend not: Saturday must not inherit them.
  const hours = { hoursWeekday: "10:00-22:00", hoursWeekend: null };

  const mon = getOpenStatus(
    { ...hours, verifiedToday: true, verifiedAt: ist(MON, 9, 0) },
    ist(MON, 12, 0),
  );
  assert.equal(mon.state, "open", "weekday hours are known");

  const sat = getOpenStatus(
    { ...hours, verifiedToday: true, verifiedAt: ist(SAT, 9, 0) },
    ist(SAT, 12, 0),
  );
  assert.equal(sat.hoursUnknown, false, "some hours are known");
  assert.equal(sat.isOpenNow, false, "weekend hours are not recorded");
  assert.equal(sat.todayRange, null);
});

test("formatRange distinguishes unknown from closed", () => {
  assert.equal(formatRange(null), "Not listed");
  assert.equal(formatRange(""), "Not listed");
  assert.equal(formatRange("closed"), "Closed");
});

test("location formatting never repeats the area", async () => {
  const { formatLocation } = await import("../geo");
  assert.equal(formatLocation("12 Hill Road", "Bandra West"), "12 Hill Road, Bandra West");
  // The OSM importer falls back to the area name when there is no street.
  assert.equal(formatLocation("Nariman Point", "Nariman Point"), "Nariman Point");
  assert.equal(formatLocation("nariman point", "Nariman Point"), "Nariman Point");
  assert.equal(formatLocation("   ", "Powai"), "Powai");

  // OSM often tags addr:neighbourhood with the same name as the area.
  assert.equal(
    formatLocation("Gaspar Enclave, Dr Ambedkar Road, Bandra West", "Bandra West"),
    "Gaspar Enclave, Dr Ambedkar Road, Bandra West",
  );
  assert.equal(formatLocation("Bandra West, Bandra West", "Bandra West"), "Bandra West");
});
