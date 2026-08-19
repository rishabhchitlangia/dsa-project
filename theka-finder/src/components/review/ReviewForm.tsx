"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StarInput } from "./StarInput";
import type { ReviewDTO } from "@/types/shop";

const TIP_PLACEHOLDER =
  "Best time to go, what to order, who to ask for…";

export function ReviewForm({
  slug,
  isDiveBar,
  onPosted,
}: {
  slug: string;
  isDiveBar: boolean;
  onPosted?: (review: ReviewDTO) => void;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [insiderTip, setInsiderTip] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorField(null);

    if (rating < 1) {
      setError("Pick a star rating first.");
      setErrorField("rating");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/shops/${slug}/reviews`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          authorName: authorName.trim(),
          rating,
          body: body.trim(),
          // Only dive bars accept a tip; sending it elsewhere is rejected.
          ...(isDiveBar && insiderTip.trim()
            ? { insiderTip: insiderTip.trim() }
            : {}),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Couldn't post that. Try again.");
        setErrorField(data.field ?? null);
        return;
      }

      setDone(true);
      onPosted?.(data.review);
      setRating(0);
      setBody("");
      setInsiderTip("");
      // Refresh the server components so averages and counts update.
      router.refresh();
    } catch {
      setError("Network trouble — your review wasn't posted. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-card border border-open/30 bg-open-soft p-5 text-center">
        <p className="text-sm font-semibold text-open">Posted — thanks.</p>
        <p className="mt-1 text-sm text-muted">
          Your review is live on this page.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-3 text-sm font-medium text-accent underline"
        >
          Write another
        </button>
      </div>
    );
  }

  const fieldError = (field: string) =>
    errorField === field ? "border-warn" : "border-border";

  return (
    <form
      onSubmit={submit}
      className="rounded-card border border-border bg-surface p-4 sm:p-5"
    >
      <h3 className="text-base font-semibold text-text">Leave a review</h3>
      <p className="mt-0.5 text-sm text-muted">
        No account needed. Leave the name blank to post as Anonymous.
      </p>

      <div className="mt-4">
        <StarInput value={rating} onChange={setRating} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-text">
            Name <span className="font-normal text-muted">(optional)</span>
          </span>
          <input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={40}
            placeholder="Anonymous"
            className={`w-full rounded-card border bg-bg px-3 py-2.5 text-base text-text placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 ${fieldError("authorName")}`}
          />
        </label>
      </div>

      <label className="mt-3 block">
        <span className="mb-1.5 block text-sm font-medium text-text">
          Your review
        </span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={1000}
          required
          placeholder="What's it actually like? Stock, staff, queue, timings…"
          className={`w-full resize-y rounded-card border bg-bg px-3 py-2.5 text-base leading-relaxed text-text placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 ${fieldError("body")}`}
        />
        <span className="mt-1 block text-right text-xs text-muted tabular-nums">
          {body.length}/1000
        </span>
      </label>

      {isDiveBar && (
        <label className="mt-1 block rounded-card border border-accent/25 bg-accent-soft p-3.5">
          <span className="block text-sm font-semibold text-accent">
            Insider tip <span className="font-normal">(optional)</span>
          </span>
          <span className="mb-2 mt-0.5 block text-xs text-muted">
            Shown separately from your review — this is the bit that makes a
            place worth the trip.
          </span>
          <textarea
            value={insiderTip}
            onChange={(e) => setInsiderTip(e.target.value)}
            rows={3}
            maxLength={400}
            placeholder={TIP_PLACEHOLDER}
            className={`w-full resize-y rounded-card border bg-surface px-3 py-2.5 text-base leading-relaxed text-text placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 ${fieldError("insiderTip")}`}
          />
          <span className="mt-1 block text-right text-xs text-muted tabular-nums">
            {insiderTip.length}/400
          </span>
        </label>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-card bg-warn-soft px-3 py-2.5 text-sm text-warn"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full rounded-card bg-accent px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}
