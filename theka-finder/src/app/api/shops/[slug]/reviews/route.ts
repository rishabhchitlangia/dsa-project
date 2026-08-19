import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { reviewInputSchema } from "@/lib/validation";
import { moderateReview } from "@/lib/moderation";
import { checkRateLimit, submitterKey, REVIEW_LIMIT } from "@/lib/ratelimit";

/** POST /api/shops/[slug]/reviews — public, no login. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }

  const parsed = reviewInputSchema.safeParse(payload);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      {
        error: first?.message ?? "That review isn't valid.",
        field: first?.path[0] ?? null,
      },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const key = submitterKey(request);
  const limit = checkRateLimit(`review:${key}`, REVIEW_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "You've posted a few reviews just now. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const moderation = moderateReview({
    authorName: input.authorName,
    body: input.body,
    insiderTip: input.insiderTip,
  });
  if (!moderation.ok) {
    return NextResponse.json(
      { error: moderation.reason, field: moderation.field },
      { status: 422 },
    );
  }

  try {
    const shop = await prisma.shop.findUnique({
      where: { slug },
      select: { id: true, category: true },
    });
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    // Insider tips are a dive-bar feature. Silently dropping the field for
    // other categories would lose someone's writing without telling them.
    if (input.insiderTip && shop.category !== "dive_bar") {
      return NextResponse.json(
        {
          error: "Insider tips are only for dive bars.",
          field: "insiderTip",
        },
        { status: 422 },
      );
    }

    // Cheap duplicate guard: same person, same shop, same text.
    const duplicate = await prisma.review.findFirst({
      where: { shopId: shop.id, submitterKey: key, body: input.body },
      select: { id: true },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "Looks like you already posted that one." },
        { status: 409 },
      );
    }

    const review = await prisma.review.create({
      data: {
        shopId: shop.id,
        authorName: input.authorName,
        rating: input.rating,
        body: input.body,
        insiderTip: input.insiderTip ?? null,
        submitterKey: key,
      },
    });

    return NextResponse.json(
      {
        review: {
          id: review.id,
          authorName: review.authorName,
          rating: review.rating,
          body: review.body,
          insiderTip: review.insiderTip,
          helpfulCount: review.helpfulCount,
          createdAt: review.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error(`POST /api/shops/${slug}/reviews failed`, err);
    return NextResponse.json(
      { error: "Could not save that review. Try again." },
      { status: 500 },
    );
  }
}
