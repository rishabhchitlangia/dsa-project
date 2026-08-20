import { MUMBAI_BOUNDS } from "./constants";

const EARTH_RADIUS_KM = 6371;

export type LatLng = { latitude: number; longitude: number };

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in km. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Bounding box for a radius, used to let Postgres discard most rows on an
 * index before we compute exact distances in JS.
 */
export function boundingBox(center: LatLng, radiusKm: number) {
  const latDelta = radiusKm / 111.32;
  // Longitude degrees shrink toward the poles; guard against cos -> 0.
  const cosLat = Math.max(0.01, Math.cos(toRad(center.latitude)));
  const lngDelta = radiusKm / (111.32 * cosLat);
  return {
    minLat: center.latitude - latDelta,
    maxLat: center.latitude + latDelta,
    minLng: center.longitude - lngDelta,
    maxLng: center.longitude + lngDelta,
  };
}

export function isInMumbai(point: LatLng): boolean {
  return (
    point.latitude >= MUMBAI_BOUNDS.minLat &&
    point.latitude <= MUMBAI_BOUNDS.maxLat &&
    point.longitude >= MUMBAI_BOUNDS.minLng &&
    point.longitude <= MUMBAI_BOUNDS.maxLng
  );
}

/** "800 m" / "2.4 km" / "12 km" — short enough for a card. */
export function formatDistance(km: number): string {
  if (!Number.isFinite(km) || km < 0) return "";
  if (km < 1) return `${Math.round(km * 1000 / 50) * 50} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/**
 * "12 Hill Road, Bandra West" — but never "Bandra West, Bandra West".
 *
 * Many OpenStreetMap entries carry no street address, so the importer falls
 * back to the area name; others tag `addr:neighbourhood` with the same name
 * as the area. Both would otherwise print the area twice.
 */
export function formatLocation(address: string, area: string): string {
  const areaKey = area.trim().toLowerCase();

  const parts = address
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p && p.toLowerCase() !== areaKey);

  return parts.length > 0 ? `${parts.join(", ")}, ${area}` : area;
}
