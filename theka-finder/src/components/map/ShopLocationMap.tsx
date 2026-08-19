"use client";

import dynamic from "next/dynamic";

/** Single-pin map for a shop page. Client-only, like every Leaflet view. */
const Inner = dynamic(() => import("./ShopLocationMapInner"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-surface-2" />,
});

export function ShopLocationMap(props: {
  latitude: number;
  longitude: number;
  name: string;
  category: string;
}) {
  return <Inner {...props} />;
}
