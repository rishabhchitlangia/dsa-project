import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getShopBySlug } from "@/lib/shops";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { OpenBadge } from "@/components/shop/OpenBadge";
import { CategoryTag } from "@/components/shop/CategoryTag";
import { Stars } from "@/components/shop/Stars";
import { ShopReviews } from "@/components/shop/ShopReviews";
import { InsiderTip } from "@/components/review/InsiderTip";
import { ShopLocationMap } from "@/components/map/ShopLocationMap";
import { formatRange } from "@/lib/hours";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  if (!shop) return { title: "Shop not found" };
  return {
    title: `${shop.name}, ${shop.area}`,
    description: `${shop.name} in ${shop.area}, Mumbai — opening hours, location and reviews.`,
  };
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  if (!shop) notFound();

  const isDiveBar = shop.category === "dive_bar";
  const wrapperClass = isDiveBar ? "theme-dive dive-grain relative" : "";

  return (
    <div className={wrapperClass}>
      <SiteHeader active={isDiveBar ? "/dive-bars" : "/"} />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Link
          href={isDiveBar ? "/dive-bars" : "/"}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-accent"
        >
          ← {isDiveBar ? "All dive bars" : "Back to map"}
        </Link>

        <header>
          <div className="flex flex-wrap items-center gap-2">
            <CategoryTag category={shop.category} />
            <OpenBadge status={shop.status} />
          </div>

          <h1
            className={`mt-3 text-text ${
              isDiveBar
                ? "font-display text-4xl tracking-wide sm:text-5xl"
                : "text-2xl font-bold sm:text-3xl"
            }`}
          >
            {shop.name}
          </h1>

          <p className="mt-1.5 text-sm text-muted">
            {shop.address}, {shop.area} {shop.pincode}
          </p>

          {shop.averageRating !== null && (
            <div className="mt-3 flex items-center gap-2">
              <Stars rating={shop.averageRating} size={17} />
              <span className="text-sm font-semibold text-text">
                {shop.averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-muted">
                · {shop.reviewCount} review{shop.reviewCount === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </header>

        {/* Insider tips lead on a dive-bar page — this is the reason to come. */}
        {isDiveBar && shop.insiderTips.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 font-display text-2xl tracking-wide text-text">
              What regulars know
            </h2>
            <div className="flex flex-col gap-3">
              {shop.insiderTips.map((tip) => (
                <InsiderTip
                  key={tip.id}
                  tip={tip.insiderTip!}
                  author={tip.authorName}
                  prominent
                />
              ))}
            </div>
          </section>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section className="order-2 lg:order-1">
            <ShopReviews
              slug={shop.slug}
              isDiveBar={isDiveBar}
              initialReviews={shop.reviews}
            />
          </section>

          <aside className="order-1 flex flex-col gap-4 lg:order-2">
            <div className="h-48 overflow-hidden rounded-card border border-border">
              <ShopLocationMap
                latitude={shop.latitude}
                longitude={shop.longitude}
                name={shop.name}
                category={shop.category}
              />
            </div>

            <div className="rounded-card border border-border bg-surface p-4">
              <h2 className="text-sm font-semibold text-text">Opening hours</h2>
              <dl className="mt-2.5 space-y-1.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Mon–Fri</dt>
                  <dd className="text-text">{formatRange(shop.hoursWeekday)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Sat–Sun</dt>
                  <dd className="text-text">{formatRange(shop.hoursWeekend)}</dd>
                </div>
              </dl>
              {!shop.status.verifiedToday && (
                <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted">
                  Nobody has confirmed these today. They&apos;re
                  community-reported, so call ahead if it matters.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {shop.phone && (
                <a
                  href={`tel:${shop.phone.replace(/\s/g, "")}`}
                  className="flex items-center justify-center gap-2 rounded-card border border-border bg-surface px-4 py-3 text-sm font-medium text-text hover:border-accent"
                >
                  Call {shop.phone}
                </a>
              )}
              <a
                href={`https://www.openstreetmap.org/directions?to=${shop.latitude },${shop.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-card bg-accent px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                Get directions
              </a>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
