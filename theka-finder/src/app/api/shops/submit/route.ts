import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { shopSubmissionSchema } from "@/lib/validation";
import { moderateReview } from "@/lib/moderation";
import { checkRateLimit, submitterKey } from "@/lib/ratelimit";
import { shopSlug } from "@/lib/slug";
import { haversineKm } from "@/lib/geo";

/** Submitting a shop is heavier than a review, so the limit is tighter. */
const SUBMIT_LIMIT = { windowMs: 60 * 60 * 1000, max: 5 };

/** POST /api/shops/submit — public, no login. Lands as pending. */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }

  const parsed = shopSubmissionSchema.safeParse(payload);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      {
        error: first?.message ?? "That submission isn't valid.",
        field: first?.path[0] ?? null,
      },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const key = submitterKey(request);
  const limit = checkRateLimit(`submit:${key}`, SUBMIT_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "That's a few shops in a row. Try again in a little while." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  // The same filter the reviews use; free text is free text.
  const moderation = moderateReview({
    authorName: input.submittedByName,
    body: `${input.name} ${input.address}`,
    insiderTip: input.note,
  });
  if (!moderation.ok) {
    // The filter is shared with reviews, so translate its field names into
    // the ones this form actually shows.
    const FIELD_MAP: Record<string, string> = {
      body: "name",
      insiderTip: "note",
      authorName: "submittedByName",
    };
    return NextResponse.json(
      {
        error: moderation.reason,
        field: FIELD_MAP[moderation.field] ?? moderation.field,
      },
      { status: 422 },
    );
  }

  try {
    // Duplicate check: same name nearby, whatever its status. Catches both
    // "already on the map" and "someone submitted this an hour ago".
    const nearby = await prisma.shop.findMany({
      where: {
        name: { equals: input.name, mode: "insensitive" },
        latitude: { gte: input.latitude - 0.01, lte: input.latitude + 0.01 },
        longitude: { gte: input.longitude - 0.01, lte: input.longitude + 0.01 },
      },
      select: { id: true, name: true, slug: true, status: true, latitude: true, longitude: true },
    });

    const duplicate = nearby.find(
      (s) =>
        haversineKm(
          { latitude: s.latitude, longitude: s.longitude },
          { latitude: input.latitude, longitude: input.longitude },
        ) < 0.15,
    );

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            duplicate.status === "approved"
              ? "That one's already listed."
              : "Thanks — someone already submitted this and it's awaiting review.",
          existingSlug: duplicate.status === "approved" ? duplicate.slug : null,
        },
        { status: 409 },
      );
    }

    // Slugs are unique; a pending submission still needs one reserved.
    const base = shopSlug(input.name, input.area);
    let slug = base;
    for (let i = 2; await prisma.shop.findUnique({ where: { slug }, select: { id: true } }); i++) {
      slug = `${base}-${i}`;
    }

    const shop = await prisma.shop.create({
      data: {
        slug,
        name: input.name,
        address: input.address,
        area: input.area,
        pincode: input.pincode,
        latitude: input.latitude,
        longitude: input.longitude,
        phone: input.phone ?? null,
        hoursWeekday: input.hoursWeekday ?? null,
        hoursWeekend: input.hoursWeekend ?? null,
        // The submitter's suggestion is recorded, but curation stays manual:
        // a submission cannot put itself in the legendary or dive-bar lists.
        category: "standard",
        source: "community",
        status: "pending",
        suggestedCategory: input.suggestedCategory,
        submittedByName: input.submittedByName,
        submitterKey: key,
        submittedNote: input.note ?? null,
      },
      select: { id: true, name: true },
    });

    return NextResponse.json(
      {
        ok: true,
        name: shop.name,
        message:
          "Thanks — sent for review. It'll appear on the map once someone confirms it.",
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/shops/submit failed", err);
    return NextResponse.json(
      { error: "Could not save that submission. Try again." },
      { status: 500 },
    );
  }
}
