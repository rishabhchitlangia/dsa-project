"use client";

import { useState, useSyncExternalStore } from "react";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  hasVoted,
  recordVote,
} from "@/lib/helpfulVotes";

/**
 * Without accounts there is no way to truly prevent repeat votes. The
 * browser remembers what it voted on and the server rate-limits per
 * fingerprint — proportionate for a casual community, and honest about it.
 */
export function HelpfulButton({
  reviewId,
  initialCount,
}: {
  reviewId: string;
  initialCount: number;
}) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const voted = hasVoted(snapshot, reviewId);

  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  const vote = async () => {
    if (voted || pending) return;
    setPending(true);
    // Optimistic: the count moves immediately and rolls back on failure.
    setCount((c) => c + 1);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(String(res.status));
      const data: { helpfulCount: number } = await res.json();
      setCount(data.helpfulCount);
      recordVote(reviewId);
    } catch {
      setCount((c) => Math.max(initialCount, c - 1));
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={vote}
      disabled={voted || pending}
      aria-pressed={voted}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        voted
          ? "border-accent/30 bg-accent-soft text-accent"
          : "border-border text-muted hover:border-accent hover:text-accent"
      }`}
    >
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
        <path d="M7.5 18H5a2 2 0 01-2-2v-5a2 2 0 012-2h2.5l3-6a2.5 2.5 0 012.4 3.2L12.3 9H16a2 2 0 011.9 2.6l-1.6 5A2 2 0 0114.4 18H7.5z" />
      </svg>
      <span>Helpful</span>
      {count > 0 && <span className="tabular-nums">· {count}</span>}
    </button>
  );
}
