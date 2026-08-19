import type { ReactNode } from "react";

type Tone = "open" | "warn" | "muted" | "accent" | "star";

const TONES: Record<Tone, string> = {
  open: "bg-open-soft text-open",
  warn: "bg-warn-soft text-warn",
  muted: "bg-unverified-soft text-unverified",
  accent: "bg-accent-soft text-accent",
  star: "bg-surface-2 text-text",
};

export function Badge({
  tone = "muted",
  children,
  title,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium leading-none ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
