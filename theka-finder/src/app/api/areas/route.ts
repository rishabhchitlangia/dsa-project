import { NextResponse } from "next/server";
import { suggestAreas } from "@/lib/areas";

/** GET /api/areas?q= — local neighbourhood/pincode autocomplete. */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  return NextResponse.json({ areas: suggestAreas(q, 6) });
}
