"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { TILE_URL, TILE_ATTRIBUTION, FOCUSED_ZOOM } from "@/lib/constants";

/** Recentres when the caller changes the point (e.g. after an area pick). */
function Recentre({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const last = useRef("");
  useEffect(() => {
    const key = `${lat},${lng}`;
    if (key === last.current) return;
    last.current = key;
    map.setView([lat, lng], Math.max(map.getZoom(), FOCUSED_ZOOM));
    setTimeout(() => map.invalidateSize(), 150);
  }, [lat, lng, map]);
  return null;
}

function ClickToPlace({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onChange(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

export default function PinPickerInner({
  latitude,
  longitude,
  onChange,
}: {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "theka-pin is-selected",
        html: `<span style="background:#b4451f"></span>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      }),
    [],
  );

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={FOCUSED_ZOOM}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={19} />
      <Recentre lat={latitude} lng={longitude} />
      <ClickToPlace onChange={onChange} />
      <Marker
        position={[latitude, longitude]}
        icon={icon}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const { lat, lng } = e.target.getLatLng();
            onChange(lat, lng);
          },
        }}
      />
    </MapContainer>
  );
}
