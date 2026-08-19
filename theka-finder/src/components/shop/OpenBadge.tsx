import { Badge } from "@/components/ui/Badge";
import type { OpenStatus } from "@/lib/hours";

/**
 * Green is earned, not assumed: it needs a same-day verification AND the
 * shop to be inside its listed hours. Anything less says so plainly rather
 * than implying the hours are trustworthy.
 */
export function OpenBadge({
  status,
  className = "",
}: {
  status: OpenStatus;
  className?: string;
}) {
  if (status.state === "open") {
    return (
      <Badge tone="open" className={className} title="Confirmed open today">
        <Dot className="bg-open" />
        Open now
      </Badge>
    );
  }

  if (status.state === "verified_closed") {
    return (
      <Badge
        tone="warn"
        className={className}
        title="Hours confirmed today, but the shop is shut right now"
      >
        <Dot className="bg-warn" />
        Verified today · closed now
      </Badge>
    );
  }

  return (
    <Badge
      tone="muted"
      className={className}
      title="Nobody has confirmed today's hours, so treat them as a guess"
    >
      <Dot className="bg-unverified" />
      <span className="sm:hidden">Unverified today</span>
      <span className="hidden sm:inline">Hours may vary — unverified today</span>
    </Badge>
  );
}

function Dot({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${className}`}
    />
  );
}
