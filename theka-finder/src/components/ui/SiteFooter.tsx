/**
 * The disclaimer is load-bearing, not boilerplate: this site lists shops
 * and nothing else. Saying so plainly heads off the assumption that it
 * sells or delivers.
 */
export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-border bg-surface">
      <div className="safe-bottom mx-auto max-w-6xl px-4 py-8 text-sm text-muted">
        <p className="font-medium text-text">
          Theka Finder is a locator. Nothing is sold or delivered here.
        </p>
        <p className="mt-2 max-w-2xl leading-relaxed">
          We list shop locations, hours and what other people say about them.
          We are not affiliated with any shop, we take no orders, and we
          handle no payments. Hours are community-reported and often wrong —
          call ahead if it matters. Sale and consumption of alcohol in
          Maharashtra is subject to state law, including permit and minimum
          age requirements.
        </p>
        <p className="mt-4 text-xs">
          Map data ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            className="underline hover:text-text"
            target="_blank"
            rel="noreferrer"
          >
            OpenStreetMap
          </a>{" "}
          contributors.
        </p>
      </div>
    </footer>
  );
}
