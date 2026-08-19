import test from "node:test";
import assert from "node:assert/strict";
import { parseOpeningHours } from "../osmHours";

const p = parseOpeningHours;

test("simple all-week span", () => {
  assert.deepEqual(p("Mo-Su 10:00-22:00"), {
    weekday: "10:00-22:00",
    weekend: "10:00-22:00",
  });
});

test("bare time span applies to every day", () => {
  assert.deepEqual(p("10:00-22:00"), {
    weekday: "10:00-22:00",
    weekend: "10:00-22:00",
  });
});

test("weekday and weekend differ", () => {
  assert.deepEqual(p("Mo-Fr 11:00-23:00; Sa-Su 11:00-01:00"), {
    weekday: "11:00-23:00",
    weekend: "11:00-01:00",
  });
});

test("past-midnight closes normalise from 24h+ notation", () => {
  assert.deepEqual(p("Mo-Su 17:00-25:30"), {
    weekday: "17:00-01:30",
    weekend: "17:00-01:30",
  });
});

test("a fully closed side is recorded as closed, not as unknown", () => {
  assert.deepEqual(p("Mo-Fr 10:00-22:00; Sa-Su off"), {
    weekday: "10:00-22:00",
    weekend: "closed",
  });
});

test("a side where days disagree becomes unknown, never a false claim", () => {
  // Saturday open, Sunday shut. One weekend field cannot express that, and
  // reporting Saturday's hours would assert Sunday is open too.
  assert.deepEqual(p("Mo-Sa 10:00-22:00; Su off"), {
    weekday: "10:00-22:00",
    weekend: null,
  });
});

test("split shifts collapse to first-open..last-close", () => {
  assert.deepEqual(p("Mo-Fr 10:00-14:00,17:00-22:00"), {
    weekday: "10:00-22:00",
    weekend: null,
  });
});

test("24/7", () => {
  assert.deepEqual(p("24/7"), {
    weekday: "00:00-23:59",
    weekend: "00:00-23:59",
  });
});

test("wrapping day ranges", () => {
  // Fr-Mo covers Fri, Sat, Sun, Mon.
  const r = p("Fr-Mo 18:00-23:00");
  assert.equal(r.weekend, "18:00-23:00");
  assert.equal(r.weekday, "18:00-23:00", "Monday and Friday are weekdays");
});

test("unparseable and conditional values return unknown, never a guess", () => {
  for (const v of [
    undefined, null, "", "   ",
    "sunrise-sunset",
    "Mo-Su 10:00-22:00; PH off",
    "Apr-Oct 10:00-22:00",
    "Su[1] 10:00-14:00",
    "by appointment",
    "gibberish",
  ]) {
    assert.deepEqual(p(v as string), { weekday: null, weekend: null }, `${v}`);
  }
});

test("only one side specified leaves the other unknown", () => {
  assert.deepEqual(p("Sa-Su 12:00-23:00"), {
    weekday: null,
    weekend: "12:00-23:00",
  });
});

test("output always feeds back into the app's own hours parser", async () => {
  const { isWithinRange } = await import("../hours");
  const r = p("Mo-Su 17:00-25:30");
  assert.equal(isWithinRange(r.weekday!, 0 * 60 + 45), true, "00:45 inside");
  assert.equal(isWithinRange(r.weekday!, 2 * 60), false, "02:00 outside");
});

test("full-day ranges become all-day, not permanently closed", async () => {
  const { isWithinRange } = await import("../hours");

  // OSM writes an all-day venue several ways. Every one must end up open,
  // never collapsed into a from === to range that reads as closed.
  for (const raw of ["00:00-24:00", "Mo-Su 00:00-24:00", "09:00-33:00", "24/7"]) {
    const r = p(raw);
    assert.ok(r.weekday, `${raw} should produce hours`);
    assert.notEqual(r.weekday, "00:00-00:00", `${raw} must not collapse`);
    assert.equal(
      isWithinRange(r.weekday!, 12 * 60),
      true,
      `${raw} should be open at noon`,
    );
    assert.equal(
      isWithinRange(r.weekday!, 3 * 60),
      true,
      `${raw} should be open at 3am`,
    );
  }
});
