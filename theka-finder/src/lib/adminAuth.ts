import { timingSafeEqual } from "node:crypto";

/**
 * Single shared secret, held in ADMIN_TOKEN and passed as a cookie.
 *
 * This is deliberately the smallest thing that works: there is no account
 * system yet, and one curator needs to approve submissions from a phone.
 * It is not a substitute for real auth — anyone with the token is an admin,
 * there are no roles and no audit trail beyond `reviewedAt`. Replace it
 * when accounts land.
 */
export const ADMIN_COOKIE = "theka_admin";

export function adminTokenConfigured(): boolean {
  return Boolean(process.env.ADMIN_TOKEN && process.env.ADMIN_TOKEN.length >= 16);
}

/** Constant-time compare, so the token can't be guessed a character at a time. */
export function isValidAdminToken(candidate: string | undefined | null): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || expected.length < 16) return false;
  if (!candidate) return false;

  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
