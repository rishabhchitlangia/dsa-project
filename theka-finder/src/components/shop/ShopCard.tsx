import Link from "next/link";
import { OpenBadge } from "./OpenBadge";
import { RatingBadge } from "./RatingBadge";
import { CategoryTag } from "./CategoryTag";
import { formatDistance } from "@/lib/geo";
import { formatRange } from "@/lib/hours";
import type { ShopSummary } from "@/types/shop";

export function ShopCard({
  shop,
  selected = false,
  onHover,
  onSelect,
}: {
  shop: ShopSummary;
  selected?: boolean;
  onHover?: (slug: string | null) => void;
  onSelect?: (slug: string) => void;
}) {
  return (
    <article
      // Only attach handlers when a caller supplied them. Creating the
      // closures unconditionally would make this component unusable from a
      // server component, which is how the curated sections render it.
      onMouseEnter={onHover ? () => onHover(shop.slug) : undefined}
      onMouseLeave={onHover ? () => onHover(null) : undefined}
      className={`rounded-card border bg-surface p-4 transition-colors ${
        selected ? "border-accent" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-text">
            <Link
              href={`/shop/${shop.slug}`}
              onClick={onSelect ? () => onSelect(shop.slug) : undefined}
              className="hover:text-accent focus-visible:text-accent focus-visible:outline-none"
            >
              {shop.name}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-sm text-muted">
            {shop.address}, {shop.area}
          </p>
        </div>
        {shop.distanceKm !== undefined && (
          <span className="shrink-0 rounded-full bg-surface-2 px-2 py-1 text-xs font-medium text-muted tabular-nums">
            {formatDistance(shop.distanceKm)}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <OpenBadge status={shop.status} />
        <CategoryTag category={shop.category} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <RatingBadge
          averageRating={shop.averageRating}
          reviewCount={shop.reviewCount}
        />
        {shop.status.todayRange && (
          <span className="text-xs text-muted">
            Today {formatRange(shop.status.todayRange)}
          </span>
        )}
      </div>
    </article>
  );
}
