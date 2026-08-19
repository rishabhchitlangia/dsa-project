/**
 * Insider tips get their own visual treatment, separate from the star
 * rating and review text. For a dive bar this is the content that actually
 * decides whether the trip is worth it, so it must not read as a footnote
 * to the star rating.
 */
export function InsiderTip({
  tip,
  author,
  prominent = false,
}: {
  tip: string;
  author?: string;
  prominent?: boolean;
}) {
  return (
    <div
      className={`rounded-card border-l-[3px] border-accent bg-accent-soft ${
        prominent ? "p-4" : "px-3.5 py-3"
      }`}
    >
      <div className="flex items-center gap-1.5">
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-accent" fill="currentColor" aria-hidden>
          <path d="M10 1a6 6 0 00-3.3 11v2.2c0 .4.4.8.8.8h5c.4 0 .8-.4.8-.8V12A6 6 0 0010 1zM7.5 17.2c0 .4.4.8.8.8h3.4c.4 0 .8-.4.8-.8v-.4h-5v.4z" />
        </svg>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
          Insider tip
        </span>
      </div>
      <p
        className={`mt-1.5 leading-relaxed text-text ${
          prominent ? "text-[15px]" : "text-sm"
        }`}
      >
        {tip}
      </p>
      {author && (
        <p className="mt-1.5 text-xs text-muted">— {author}</p>
      )}
    </div>
  );
}
