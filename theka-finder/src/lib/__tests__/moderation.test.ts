import test from "node:test";
import assert from "node:assert/strict";
import { moderateReview } from "../moderation";

const pass = (body: string, extra: Record<string, string> = {}) =>
  moderateReview({ body, ...extra });

test("ordinary reviews pass, including blunt ones", () => {
  const samples = [
    "Great place, always stocked. Uncle at the counter is friendly.",
    "Bit of a dump honestly but the prices are unbeatable and it's open late.",
    "Damn good selection of local stuff. Crowded on Fridays.",
    "Bloody hell the queue was long but worth it.",
    "Shitty lighting, sticky tables, best fish fry in Dadar. 10/10.",
    "Not great. Rude staff, overpriced, wouldn't come back.",
    "Classic. Been coming here since college. Nothing has changed and that's the point.",
  ];
  for (const s of samples) {
    const r = pass(s);
    assert.equal(r.ok, true, `should pass: "${s}" -> ${r.ok ? "" : r.reason}`);
  }
});

test("insider tips with real dive-bar detail pass", () => {
  const tips = [
    "Go before 7pm, after that there's no place to sit. Ask for Ramesh, he'll find you a table.",
    "Order the chakna platter, skip the food menu. Cash only.",
    "Back room is quieter. Sunday evenings it's mostly regulars.",
  ];
  for (const t of tips) {
    assert.equal(moderateReview({ body: "Good place", insiderTip: t }).ok, true, t);
  }
});

test("slurs and targeted abuse are rejected", () => {
  for (const s of ["what a chutiya owner", "the staff are retards", "kill yourself"]) {
    const r = pass(s);
    assert.equal(r.ok, false, `should block: ${s}`);
    if (!r.ok) assert.match(r.reason, /slurs and abuse/);
  }
});

test("leetspeak and padding evasion is caught", () => {
  for (const s of ["ch4ndu is a chuuutiya", "total m@d@rchod behaviour"]) {
    assert.equal(pass(s).ok, false, s);
  }
});

test("word-boundary matching avoids false positives", () => {
  // Blocked terms must not fire inside ordinary words. (Words that *contain*
  // a slur as a whole word, like the British dish "faggots", stay blocked —
  // vanishingly unlikely here and not worth weakening the filter for.)
  for (const s of [
    "Grandpa loves this place",
    "Scunthorpe pale ale in stock",
    "Analysis of the prices: fair",
  ]) {
    assert.equal(pass(s).ok, true, `false positive on: ${s}`);
  }
});

test("promotional spam is rejected", () => {
  const spam = [
    "Best price guaranteed, home delivery available, whatsapp me",
    "Order now for free delivery across Mumbai",
    "Visit my site for discount code on liquor",
  ];
  for (const s of spam) {
    const r = pass(s);
    assert.equal(r.ok, false, s);
  }
});

test("links and phone numbers are rejected", () => {
  const r1 = pass("Nice shop, check https://buycheapbooze.xyz for more");
  assert.equal(r1.ok, false);
  if (!r1.ok) assert.match(r1.reason, /Links/);

  const r2 = pass("Call the owner on 9876543210 for stock");
  assert.equal(r2.ok, false);
  if (!r2.ok) assert.match(r2.reason, /phone numbers/);
});

test("mashing and repeated text are rejected", () => {
  assert.equal(pass("aaaaaaaaaaaaaaaaaaaa").ok, false);
  assert.equal(
    pass("good good good good good good good good good good").ok,
    false,
  );
});

test("shouting alone is allowed through", () => {
  // Deliberate: an angry all-caps review is still a real review. Caps only
  // add weight alongside another spam signal.
  assert.equal(pass("THIS PLACE IS ABSOLUTELY THE WORST EVER").ok, true);
  assert.equal(
    pass("BEST SHOP IN DADAR WHATSAPP ME FOR HOME DELIVERY").ok,
    false,
    "caps plus a promo phrase still blocks",
  );
});

test("plural forms of blocked terms are caught", () => {
  assert.equal(pass("the staff are retards").ok, false);
  assert.equal(pass("bunch of gandus").ok, false);
});

test("an acronym in an otherwise normal review is not shouting", () => {
  assert.equal(pass("Good spot near the BKC office, open till late").ok, true);
});

test("the filter checks the author name and insider tip too", () => {
  const byName = moderateReview({ authorName: "madarchod", body: "fine shop" });
  assert.equal(byName.ok, false);
  if (!byName.ok) assert.equal(byName.field, "authorName");

  const byTip = moderateReview({
    body: "fine shop",
    insiderTip: "whatsapp me for home delivery",
  });
  assert.equal(byTip.ok, false);
  if (!byTip.ok) assert.equal(byTip.field, "insiderTip");
});
