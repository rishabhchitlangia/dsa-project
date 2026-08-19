import { Stars } from "./Stars";

/**
 * Rating summary for a card. Renders nothing when there are no reviews —
 * an empty rating is worse than no rating, because it reads as a bad one.
 */
export function RatingBadge({
  averageRating,
  reviewCount,
  compact = false,
}: {
  averageRating: number | null;
  reviewCount: number;
  compact?: boolean;
}) {
  if (averageRating === null || reviewCount === 0) {
    return (
      <span className="text-xs text-muted">No reviews yet</span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <Stars rating={averageRating} size={compact ? 12 : 14} />
      <span className="font-semibold text-text">{averageRating.toFixed(1)}</span>
      <span className="text-muted">
        ({reviewCount}
        {compact ? "" : reviewCount === 1 ? " review" : " reviews"})
      </span>
    </span>
  );
}
