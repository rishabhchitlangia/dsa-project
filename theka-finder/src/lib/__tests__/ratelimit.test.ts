import test from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit, __resetRateLimits, submitterKey } from "../ratelimit";

const rule = { windowMs: 1000, max: 3 };

test("allows up to max then blocks", () => {
  __resetRateLimits();
  const now = 1_000_000;
  for (let i = 0; i < 3; i++) {
    assert.equal(checkRateLimit("a", rule, now).allowed, true, `hit ${i + 1}`);
  }
  const blocked = checkRateLimit("a", rule, now);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfter > 0);
});

test("window slides", () => {
  __resetRateLimits();
  const now = 2_000_000;
  for (let i = 0; i < 3; i++) checkRateLimit("b", rule, now);
  assert.equal(checkRateLimit("b", rule, now + 999).allowed, false);
  assert.equal(checkRateLimit("b", rule, now + 1001).allowed, true, "old hits expired");
});

test("keys are independent", () => {
  __resetRateLimits();
  const now = 3_000_000;
  for (let i = 0; i < 3; i++) checkRateLimit("c", rule, now);
  assert.equal(checkRateLimit("c", rule, now).allowed, false);
  assert.equal(checkRateLimit("d", rule, now).allowed, true);
});

test("submitterKey is stable, opaque and does not leak the IP", () => {
  const req = new Request("https://example.com", {
    headers: { "x-forwarded-for": "203.0.113.9, 10.0.0.1", "user-agent": "UA/1" },
  });
  const k1 = submitterKey(req);
  const k2 = submitterKey(req);
  assert.equal(k1, k2, "stable");
  assert.match(k1, /^[a-f0-9]{32}$/);
  assert.ok(!k1.includes("203"), "must not embed the address");

  const other = new Request("https://example.com", {
    headers: { "x-forwarded-for": "198.51.100.4", "user-agent": "UA/1" },
  });
  assert.notEqual(k1, submitterKey(other), "different IP, different key");
});
