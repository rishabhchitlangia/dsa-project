import Link from "next/link";

const NAV = [
  { href: "/", label: "Map" },
  { href: "/legendary", label: "Legendary" },
  { href: "/dive-bars", label: "Dive Bars" },
];

export function SiteHeader({ active }: { active?: string }) {
  return (
    <header className="sticky top-0 z-[600] border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4">
        <Link href="/" className="flex shrink-0 items-baseline gap-1.5">
          <span className="font-display text-xl leading-none tracking-wide text-accent sm:text-2xl">
            THEKA
          </span>
          <span className="font-display text-xl leading-none tracking-wide text-text sm:text-2xl">
            FINDER
          </span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active === item.href ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-2.5 py-2 text-[13px] font-medium transition-colors sm:px-3 sm:text-sm ${
                active === item.href
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:text-text"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
