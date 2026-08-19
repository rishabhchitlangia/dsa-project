/** Static star display. `size` is the pixel height of one star. */
export function Stars({
  rating,
  size = 14,
  className = "",
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0;
        return <Star key={i} fill={fill} size={size} />;
      })}
    </span>
  );
}

function Star({ fill, size }: { fill: number; size: number }) {
  const id = `half-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      aria-hidden
      className="shrink-0"
    >
      <defs>
        <linearGradient id={id}>
          <stop offset="50%" stopColor="var(--star)" />
          <stop offset="50%" stopColor="var(--border)" />
        </linearGradient>
      </defs>
      <path
        d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z"
        fill={fill === 1 ? "var(--star)" : fill === 0.5 ? `url(#${id})` : "var(--border)"}
      />
    </svg>
  );
}
