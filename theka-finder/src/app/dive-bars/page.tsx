import type { Metadata } from "next";
import Link from "next/link";
import { listByCategory } from "@/lib/shops";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { OpenBadge } from "@/components/shop/OpenBadge";
import { Stars } from "@/components/shop/Stars";
import { InsiderTip } from "@/components/review/InsiderTip";
import { formatRange } from "@/lib/hours";
import { formatLocation } from "@/lib/geo";
import type { ShopSummary } from "@/types/shop";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dive Bars",
  description:
    "Mumbai's uncle bars and permit rooms — small, no-frills, full of character, with tips from the regulars.",
};

/** Top tip per dive bar, so the listing leads with the useful part. */
async function topTips(shopIds: string[]) {
  if (shopIds.length === 0) return new Map<string, { tip: string; author: string }>();
  const rows = await prisma.review.findMany({
    where: { shopId: { in: shopIds }, insiderTip: { not: null } },
    orderBy: [{ helpfulCount: "desc" }, { createdAt: "desc" }],
    select: { shopId: true, insiderTip: true, authorName: true },
  });
  const map = new Map<string, { tip: string; author: string }>();
  for (const row of rows) {
    if (!map.has(row.shopId) && row.insiderTip) {
      map.set(row.shopId, { tip: row.insiderTip, author: row.authorName });
    }
  }
  return map;
}

export default async function DiveBarsPage() {
  const shops = await listByCategory("dive_bar");
  const tips = await topTips(shops.map((s) => s.id));

  return (
    <>
      <SiteHeader active="/dive-bars" />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <header className="border-b border-border pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Uncle bars &amp; permit rooms
          </p>
          <h1 className="mt-2 font-display text-5xl leading-none tracking-wide text-text sm:text-6xl">
            Dive Bars
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
            Small, no-frills, plastic chairs, a fan that has seen things.
            You don&apos;t come for the decor. The tips below are the whole
            point — when to go, what to order, who to ask for.
          </p>
        </header>

        {shops.length === 0 ? (
          <p className="mt-8 rounded-card border border-dashed border-border p-8 text-center text-sm text-muted">
            No dive bars tagged yet. Set{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">
              &quot;category&quot;: &quot;dive_bar&quot;
            </code>{" "}
            in your seed data.
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-4">
            {shops.map((shop) => (
              <DiveBarCard
                key={shop.slug}
                shop={shop}
                tip={tips.get(shop.id)}
              />
            ))}
          </ul>
        )}
      </main>

      <SiteFooter />
    </>
  );
}

function DiveBarCard({
  shop,
  tip,
}: {
  shop: ShopSummary;
  tip?: { tip: string; author: string };
}) {
  return (
    <li className="overflow-hidden rounded-card border border-border bg-surface">
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-2xl leading-tight tracking-wide text-text sm:text-3xl">
              <Link href={`/shop/${shop.slug}`} className="hover:text-accent">
                {shop.name}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-muted">
              {formatLocation(shop.address, shop.area)}
            </p>
          </div>
          <OpenBadge status={shop.status} className="shrink-0" />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {shop.averageRating !== null ? (
            <span className="flex items-center gap-1.5">
              <Stars rating={shop.averageRating} size={13} />
              <span className="font-semibold text-text">
                {shop.averageRating.toFixed(1)}
              </span>
              <span className="text-muted">({shop.reviewCount})</span>
            </span>
          ) : (
            <span className="text-xs text-muted">No reviews yet</span>
          )}
          {shop.status.todayRange && (
            <span className="text-xs text-muted">
              Today {formatRange(shop.status.todayRange)}
            </span>
          )}
        </div>

        {/* The tip leads — it is why this section exists. */}
        {tip ? (
          <div className="mt-4">
            <InsiderTip tip={tip.tip} author={tip.author} prominent />
          </div>
        ) : (
          <p className="mt-4 rounded-card border border-dashed border-border px-3.5 py-3 text-sm text-muted">
            No insider tips yet.{" "}
            <Link
              href={`/shop/${shop.slug}`}
              className="font-medium text-accent underline"
            >
              Know this place? Add one.
            </Link>
          </p>
        )}
      </div>
    </li>
  );
}
