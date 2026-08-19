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
          <Link
            href="/add"
            // The label is visually hidden on narrow screens, so the link
            // needs its own accessible name — otherwise it announces as
            // nothing at all.
            aria-label="Add a shop"
            aria-current={active === "/add" ? "page" : undefined}
            className="ml-1 whitespace-nowrap rounded-full bg-accent px-3 py-2 text-[13px] font-semibold text-white sm:text-sm"
          >
            <span aria-hidden>+</span>
            <span className="ml-1 hidden sm:inline">Add</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
