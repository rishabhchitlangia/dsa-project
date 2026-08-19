"use client";

import dynamic from "next/dynamic";
import type { ShopMapProps } from "./ShopMap";

/**
 * Leaflet touches `window` at import time, so the map can never be server
 * rendered. This wrapper is the only place that knows that.
 */
const ShopMap = dynamic(() => import("./ShopMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-2">
      <span className="text-sm text-muted">Loading map…</span>
    </div>
  ),
});

export function MapPanel(props: ShopMapProps) {
  return <ShopMap {...props} />;
}
