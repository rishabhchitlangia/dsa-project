import { NextResponse } from "next/server";
import { getShopBySlug } from "@/lib/shops";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const shop = await getShopBySlug(slug);
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }
    return NextResponse.json(shop);
  } catch (err) {
    console.error(`GET /api/shops/${slug} failed`, err);
    return NextResponse.json(
      { error: "Could not load this shop right now." },
      { status: 500 },
    );
  }
}
