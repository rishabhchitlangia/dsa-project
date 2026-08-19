import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/adminAuth";
import { categorySchema } from "@/lib/validation";

const actionSchema = z.object({
  action: z.enum(["approve", "reject", "setCategory"]),
  category: categorySchema.optional(),
});

/** PATCH /api/admin/shops/[id] — approve, reject, or re-categorise. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const jar = await cookies();
  if (!isValidAdminToken(jar.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = actionSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { action, category } = parsed.data;

  try {
    if (action === "setCategory") {
      if (!category) {
        return NextResponse.json({ error: "No category given" }, { status: 400 });
      }
      const shop = await prisma.shop.update({
        where: { id },
        data: { category },
        select: { id: true, category: true, name: true },
      });
      return NextResponse.json(shop);
    }

    const shop = await prisma.shop.update({
      where: { id },
      data: {
        status: action === "approve" ? "approved" : "rejected",
        reviewedAt: new Date(),
        // An approving curator can set the category in the same action.
        ...(action === "approve" && category ? { category } : {}),
      },
      select: { id: true, status: true, name: true, category: true },
    });
    return NextResponse.json(shop);
  } catch {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }
}
