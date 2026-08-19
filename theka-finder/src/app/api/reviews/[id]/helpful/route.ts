import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit, submitterKey, HELPFUL_LIMIT } from "@/lib/ratelimit";

/**
 * POST /api/reviews/[id]/helpful — mark a review helpful.
 *
 * Without accounts there is no perfect way to stop repeat votes. The client
 * remembers what it voted on, and the rate limiter caps how fast one
 * fingerprint can vote; that is proportionate for a casual community.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const limit = checkRateLimit(`helpful:${submitterKey(request)}`, HELPFUL_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Slow down a moment." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  try {
    const review = await prisma.review.update({
      where: { id },
      data: { helpfulCount: { increment: 1 } },
      select: { id: true, helpfulCount: true },
    });
    return NextResponse.json(review);
  } catch {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
}
