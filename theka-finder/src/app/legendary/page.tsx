import type { Metadata } from "next";
import { listByCategory } from "@/lib/shops";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { ShopCard } from "@/components/shop/ShopCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Legendary",
  description:
    "Mumbai's institution-status liquor shops — hand-picked, not algorithmic.",
};

export default async function LegendaryPage() {
  const shops = await listByCategory("legendary");

  return (
    <>
      <SiteHeader active="/legendary" />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <header className="border-b border-border pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Curated
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-text sm:text-5xl">
            Legendary
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
            The institutions. Shops that have been part of their
            neighbourhood long enough that people give directions by them.
            This list is picked by hand — nothing gets in through ratings or
            review counts.
          </p>
        </header>

        {shops.length === 0 ? (
          <p className="mt-8 rounded-card border border-dashed border-border p-8 text-center text-sm text-muted">
            No legendary shops tagged yet. Set{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">
              &quot;category&quot;: &quot;legendary&quot;
            </code>{" "}
            in your seed data.
          </p>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {shops.map((shop) => (
              <ShopCard key={shop.slug} shop={shop} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
