import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isValidAdminToken, adminTokenConfigured } from "@/lib/adminAuth";
import { checkRateLimit, submitterKey } from "@/lib/ratelimit";

/** Slow down brute-forcing the shared secret. */
const LOGIN_LIMIT = { windowMs: 15 * 60 * 1000, max: 10 };

export async function POST(request: Request) {
  if (!adminTokenConfigured()) {
    return NextResponse.json(
      {
        error:
          "ADMIN_TOKEN is not set (or is under 16 characters). Set it in .env and restart.",
      },
      { status: 503 },
    );
  }

  const limit = checkRateLimit(`admin:${submitterKey(request)}`, LOGIN_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token : "";

  if (!isValidAdminToken(token)) {
    return NextResponse.json({ error: "That token isn't right." }, { status: 401 });
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}
