"use client";

import { useCallback, useState } from "react";
import { MapPanel } from "@/components/map/MapPanel";
import { ShopCard } from "@/components/shop/ShopCard";
import { LocationSearch } from "@/components/search/LocationSearch";
import { MUMBAI_CENTER } from "@/lib/constants";
import type { ShopSummary } from "@/types/shop";

type SearchResponse = {
  shops: ShopSummary[];
  center: [number, number] | null;
  resolvedArea: string | null;
};

type View = "list" | "map";

export function HomeExplorer({ initial }: { initial: SearchResponse }) {
  const [shops, setShops] = useState(initial.shops);
  const [center, setCenter] = useState(initial.center);
  const [resolvedArea, setResolvedArea] = useState(initial.resolvedArea);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Mobile shows one pane at a time; desktop shows both side by side.
  const [view, setView] = useState<View>("list");

  const run = useCallback(async (params: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`/api/shops?${qs}`);
      if (!res.ok) throw new Error(String(res.status));
      const data: SearchResponse = await res.json();
      setShops(data.shops);
      setCenter(data.center);
      setResolvedArea(data.resolvedArea);
      setSelected(null);
    } catch {
      setError("Couldn't load shops just now. Check your connection and retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  const onSearch = useCallback(
    (q: string) => {
      setQuery(q);
      setUserLocation(null);
      run(q ? { q } : {});
    },
    [run],
  );

  const onUseLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setLocationError("This browser can't share your location. Search an area instead.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(point);
        setQuery("");
        setLocating(false);
        run({ lat: String(point[0]), lng: String(point[1]) });
      },
      (err) => {
        setLocating(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Location is blocked. Search a neighbourhood or pincode instead."
            : "Couldn't get your location. Try searching an area.",
        );
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, [run]);

  const heading = resolvedArea
    ? `Near ${resolvedArea}`
    : userLocation
      ? "Near you"
      : query
        ? `Results for “${query}”`
        : "Thekas across Mumbai";

  return (
    <div className="mx-auto max-w-6xl px-4 py-5">
      <div className="mb-5">
        <h1 className="font-display text-3xl tracking-wide text-text sm:text-4xl">
          Find a theka near you
        </h1>
        <p className="mt-1 text-sm text-muted">
          Shops across Mumbai — where they are, when they&apos;re open, and
          what regulars actually say.
        </p>
      </div>

      <LocationSearch
        onSearch={onSearch}
        onUseLocation={onUseLocation}
        locating={locating}
        locationError={locationError}
      />

      {/* Pane switcher — mobile only. */}
      <div
        className="mt-4 flex rounded-card border border-border bg-surface-2 p-1 lg:hidden"
        role="tablist"
      >
        {(["list", "map"] as View[]).map((v) => (
          <button
            key={v}
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className={`flex-1 rounded-[10px] py-2 text-sm font-medium capitalize transition-colors ${
              view === v ? "bg-surface text-text shadow-sm" : "text-muted"
            }`}
          >
            {v === "list" ? `List (${shops.length})` : "Map"}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* List */}
        <section
          className={`${view === "list" ? "block" : "hidden"} lg:block`}
          aria-label="Search results"
        >
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-text">{heading}</h2>
            <span className="text-xs text-muted">
              {loading ? "Searching…" : `${shops.length} shop${shops.length === 1 ? "" : "s"}`}
            </span>
          </div>

          {error && (
            <div className="rounded-card border border-warn/40 bg-warn-soft p-4 text-sm text-warn">
              {error}
            </div>
          )}

          {!error && shops.length === 0 && !loading && (
            <div className="rounded-card border border-border bg-surface p-6 text-center">
              <p className="text-sm font-medium text-text">Nothing here yet</p>
              <p className="mt-1 text-sm text-muted">
                Try a nearby neighbourhood, or a pincode like 400050.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {shops.map((shop) => (
              <ShopCard
                key={shop.slug}
                shop={shop}
                selected={selected === shop.slug}
                onHover={setSelected}
              />
            ))}
          </div>
        </section>

        {/* Map */}
        <section
          className={`${view === "map" ? "block" : "hidden"} lg:block`}
          aria-label="Map of results"
        >
          <div className="h-[65vh] overflow-hidden rounded-card border border-border lg:sticky lg:top-20 lg:h-[calc(100vh-7rem)]">
            <MapPanel
              shops={shops}
              center={center ?? MUMBAI_CENTER}
              userLocation={userLocation}
              selectedSlug={selected}
              onSelect={setSelected}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
