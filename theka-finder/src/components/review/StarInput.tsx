"use client";

import { useState } from "react";

const LABELS = ["", "Poor", "Not great", "Fine", "Good", "Excellent"];

/**
 * Radio-group star picker. Real radio inputs underneath, so it is keyboard
 * operable and announced correctly; the stars are just the visual layer.
 */
export function StarInput({
  value,
  onChange,
  name = "rating",
}: {
  value: number;
  onChange: (rating: number) => void;
  name?: string;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHover(0)}
        role="radiogroup"
        aria-label="Rating out of 5"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className="cursor-pointer p-0.5"
            onMouseEnter={() => setHover(n)}
          >
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="sr-only peer"
            />
            <span className="sr-only">
              {n} star{n === 1 ? "" : "s"}
            </span>
            <svg
              viewBox="0 0 20 20"
              className="h-8 w-8 transition-transform peer-focus-visible:scale-110 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-accent"
              aria-hidden
            >
              <path
                d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z"
                fill={n <= shown ? "var(--star)" : "var(--border)"}
              />
            </svg>
          </label>
        ))}
      </div>
      <span className="text-sm text-muted" aria-live="polite">
        {shown ? LABELS[shown] : "Tap to rate"}
      </span>
    </div>
  );
}
