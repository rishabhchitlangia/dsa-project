import { Stars } from "@/components/shop/Stars";
import { HelpfulButton } from "./HelpfulButton";
import { InsiderTip } from "./InsiderTip";
import type { ReviewDTO } from "@/types/shop";

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Newest first, as specified. Helpful counts surface quality in place. */
export function ReviewList({
  reviews,
  showTips = true,
}: {
  reviews: ReviewDTO[];
  showTips?: boolean;
}) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border p-6 text-center">
        <p className="text-sm font-medium text-text">No reviews yet</p>
        <p className="mt-1 text-sm text-muted">
          Be the first to say what this place is like.
        </p>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-3">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="rounded-card border border-border bg-surface p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text">
                {review.authorName}
              </span>
              <Stars rating={review.rating} size={13} />
            </div>
            <time
              dateTime={review.createdAt}
              className="text-xs text-muted"
              title={new Date(review.createdAt).toLocaleString("en-IN")}
            >
              {timeAgo(review.createdAt)}
            </time>
          </div>

          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text">
            {review.body}
          </p>

          {showTips && review.insiderTip && (
            <div className="mt-3">
              <InsiderTip tip={review.insiderTip} />
            </div>
          )}

          <div className="mt-3">
            <HelpfulButton
              reviewId={review.id}
              initialCount={review.helpfulCount}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
