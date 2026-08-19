import { NextResponse } from "next/server";
import { shopQuerySchema } from "@/lib/validation";
import { searchShops } from "@/lib/shops";

/**
 * GET /api/shops
 *   ?lat=&lng=      search outward from a point (device location)
 *   ?q=             neighbourhood, pincode, or free text
 *   ?category=      standard | legendary | dive_bar
 *   ?limit=
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = shopQuerySchema.safeParse(
    Object.fromEntries(url.searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid search", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // lat and lng only mean anything together.
  const { lat, lng, ...rest } = parsed.data;
  const hasPoint = lat !== undefined && lng !== undefined;

  try {
    const result = await searchShops({
      ...rest,
      ...(hasPoint ? { lat, lng } : {}),
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/shops failed", err);
    return NextResponse.json(
      { error: "Could not load shops right now." },
      { status: 500 },
    );
  }
}
