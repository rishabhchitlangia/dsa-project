"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
} from "react-leaflet";
import {
  TILE_URL,
  TILE_ATTRIBUTION,
  MUMBAI_CENTER,
  DEFAULT_ZOOM,
  FOCUSED_ZOOM,
} from "@/lib/constants";
import type { ShopSummary } from "@/types/shop";

const PIN_COLORS: Record<string, string> = {
  standard: "#b4451f",
  legendary: "#8b5cf6",
  dive_bar: "#e0a13c",
};

/**
 * Leaflet's default marker images are resolved relative to the CSS file and
 * break under bundlers, so every pin here is a themed div icon instead.
 */
function pinIcon(category: string, selected: boolean) {
  return L.divIcon({
    className: `theka-pin${selected ? " is-selected" : ""}`,
    html: `<span style="background:${PIN_COLORS[category] ?? PIN_COLORS.standard}"></span>`,
    iconSize: selected ? [32, 32] : [26, 26],
    iconAnchor: selected ? [16, 32] : [13, 26],
    popupAnchor: [0, -26],
  });
}

/** Keeps the Leaflet viewport in step with React state. */
function ViewController({
  center,
  shops,
  selectedSlug,
}: {
  center: [number, number] | null;
  shops: ShopSummary[];
  selectedSlug: string | null;
}) {
  const map = useMap();
  const lastCenter = useRef<string>("");

  useEffect(() => {
    if (selectedSlug) {
      const shop = shops.find((s) => s.slug === selectedSlug);
      if (shop) {
        map.setView([shop.latitude, shop.longitude], Math.max(map.getZoom(), FOCUSED_ZOOM), {
          animate: true,
        });
      }
      return;
    }

    if (!center) return;
    const key = center.join(",");
    if (key === lastCenter.current) return;
    lastCenter.current = key;

    // Fit every result when there is more than one, so the user sees the
    // spread rather than a single pin filling the screen.
    if (shops.length > 1) {
      const bounds = L.latLngBounds(
        shops.map((s) => [s.latitude, s.longitude] as [number, number]),
      );
      bounds.extend(center);
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: FOCUSED_ZOOM });
    } else {
      map.setView(center, shops.length === 1 ? FOCUSED_ZOOM : DEFAULT_ZOOM);
    }
  }, [center, shops, selectedSlug, map]);

  return null;
}

/**
 * Leaflet measures its container on mount. Inside a flex/grid layout that
 * measurement can happen before the final size is known, leaving grey
 * tiles until the next resize — so we re-invalidate once laid out.
 */
function ResizeFix() {
  const map = useMap();
  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const raf = requestAnimationFrame(invalidate);
    const timer = setTimeout(invalidate, 250);
    const observer = new ResizeObserver(invalidate);
    observer.observe(map.getContainer());
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [map]);
  return null;
}

export type ShopMapProps = {
  shops: ShopSummary[];
  center: [number, number] | null;
  userLocation: [number, number] | null;
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
};

export default function ShopMap({
  shops,
  center,
  userLocation,
  selectedSlug,
  onSelect,
}: ShopMapProps) {
  const initialCenter = useMemo(
    () => center ?? userLocation ?? MUMBAI_CENTER,
    // Only the first render matters; ViewController drives it afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <MapContainer
      center={initialCenter}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className="h-full w-full"
      // Leaflet's default attribution prefix is a Leaflet ad; the tile
      // attribution below is the one that is actually required.
      attributionControl
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={19} />
      <ResizeFix />
      <ViewController center={center} shops={shops} selectedSlug={selectedSlug} />

      {userLocation && (
        <CircleMarker
          center={userLocation}
          radius={7}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: "#2563eb",
            fillOpacity: 1,
          }}
        >
          <Popup>You are here</Popup>
        </CircleMarker>
      )}

      {shops.map((shop) => (
        <Marker
          key={shop.slug}
          position={[shop.latitude, shop.longitude]}
          icon={pinIcon(shop.category, shop.slug === selectedSlug)}
          eventHandlers={{ click: () => onSelect(shop.slug) }}
        >
          <Popup>
            <a
              href={`/shop/${shop.slug}`}
              className="block max-w-[15rem] no-underline"
            >
              <strong className="block text-sm text-text">{shop.name}</strong>
              <span className="mt-0.5 block text-xs text-muted">{shop.area}</span>
              <span
                className={`mt-1.5 inline-block text-xs font-medium ${
                  shop.status.state === "open" ? "text-open" : "text-muted"
                }`}
              >
                {shop.status.label}
              </span>
              <span className="mt-1 block text-xs font-medium text-accent">
                View details →
              </span>
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
