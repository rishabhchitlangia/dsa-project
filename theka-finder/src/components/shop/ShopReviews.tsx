"use client";

import { useState } from "react";
import { ReviewForm } from "@/components/review/ReviewForm";
import { ReviewList } from "@/components/review/ReviewList";
import type { ReviewDTO } from "@/types/shop";

/**
 * Client wrapper so a newly posted review appears immediately, before the
 * server refresh lands.
 */
export function ShopReviews({
  slug,
  isDiveBar,
  initialReviews,
}: {
  slug: string;
  isDiveBar: boolean;
  initialReviews: ReviewDTO[];
}) {
  const [reviews, setReviews] = useState(initialReviews);

  return (
    <div className="flex flex-col gap-5">
      <ReviewForm
        slug={slug}
        isDiveBar={isDiveBar}
        onPosted={(review) => setReviews((prev) => [review, ...prev])}
      />

      <div>
        <h2 className="mb-3 text-base font-semibold text-text">
          {reviews.length > 0
            ? `${reviews.length} review${reviews.length === 1 ? "" : "s"}`
            : "Reviews"}
          {reviews.length > 1 && (
            <span className="ml-2 text-sm font-normal text-muted">
              newest first
            </span>
          )}
        </h2>
        {/* Tips already appear in their own section on dive-bar pages. */}
        <ReviewList reviews={reviews} showTips={!isDiveBar} />
      </div>
    </div>
  );
}
