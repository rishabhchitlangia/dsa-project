import { createHash } from "node:crypto";

/**
 * In-process sliding-window rate limiting.
 *
 * Honest caveat: this lives in memory, so on a serverless host each instance
 * keeps its own counters and a determined spammer can dodge it by spreading
 * requests across cold starts. It is here to stop accidents and casual
 * flooding, not a motivated attacker. If abuse becomes real, the fix is a
 * shared store (Postgres table or Upstash Redis) behind this same interface —
 * every caller goes through `checkRateLimit`, so the swap is local.
 */

type Bucket = { hits: number[]; };

const buckets = new Map<string, Bucket>();

/** Bound memory: prune whole buckets once the map gets large. */
const MAX_BUCKETS = 10_000;

export type RateLimitRule = {
  /** Window length in milliseconds. */
  windowMs: number;
  /** Requests allowed inside the window. */
  max: number;
};

export const REVIEW_LIMIT: RateLimitRule = {
  windowMs: 10 * 60 * 1000,
  max: 5,
};

export const HELPFUL_LIMIT: RateLimitRule = {
  windowMs: 60 * 1000,
  max: 20,
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Seconds until the caller may retry. 0 when allowed. */
  retryAfter: number;
};

export function checkRateLimit(
  key: string,
  rule: RateLimitRule,
  now: number = Date.now(),
): RateLimitResult {
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, bucket] of buckets) {
      if (bucket.hits.every((t) => now - t > rule.windowMs)) buckets.delete(k);
      if (buckets.size <= MAX_BUCKETS / 2) break;
    }
  }

  const bucket = buckets.get(key) ?? { hits: [] };
  const cutoff = now - rule.windowMs;
  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= rule.max) {
    buckets.set(key, bucket);
    const oldest = bucket.hits[0];
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((oldest + rule.windowMs - now) / 1000)),
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return {
    allowed: true,
    remaining: rule.max - bucket.hits.length,
    retryAfter: 0,
  };
}

/**
 * Stable, non-reversible fingerprint for a submitter. Stored so we can rate
 * limit and dedupe upvotes without any login or tracking cookie; never
 * displayed and never joined to anything identifying.
 */
export function submitterKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip =
    forwarded.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const ua = request.headers.get("user-agent") ?? "unknown";
  const salt = process.env.REVIEW_SALT ?? "theka-finder-dev-salt";
  return createHash("sha256").update(`${salt}:${ip}:${ua}`).digest("hex").slice(0, 32);
}

/** Test seam. */
export function __resetRateLimits() {
  buckets.clear();
}
