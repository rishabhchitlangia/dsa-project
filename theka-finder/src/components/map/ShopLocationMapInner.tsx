"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { TILE_URL, TILE_ATTRIBUTION, FOCUSED_ZOOM } from "@/lib/constants";

const PIN_COLORS: Record<string, string> = {
  standard: "#b4451f",
  legendary: "#8b5cf6",
  dive_bar: "#e0a13c",
};

function Invalidate() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export default function ShopLocationMapInner({
  latitude,
  longitude,
  name,
  category,
}: {
  latitude: number;
  longitude: number;
  name: string;
  category: string;
}) {
  const icon = L.divIcon({
    className: "theka-pin",
    html: `<span style="background:${PIN_COLORS[category] ?? PIN_COLORS.standard}"></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  });

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={FOCUSED_ZOOM + 1}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={19} />
      <Invalidate />
      <Marker position={[latitude, longitude]} icon={icon} title={name} />
    </MapContainer>
  );
}
