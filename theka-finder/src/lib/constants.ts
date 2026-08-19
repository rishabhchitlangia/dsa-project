/** Mumbai bounding box — everything in this app is scoped to the city. */
export const MUMBAI_BOUNDS = {
  minLat: 18.85,
  maxLat: 19.32,
  minLng: 72.75,
  maxLng: 73.02,
} as const;

/** Map default view: roughly central Mumbai, zoomed to show the island city. */
export const MUMBAI_CENTER: [number, number] = [19.055, 72.86];
export const DEFAULT_ZOOM = 12;
export const FOCUSED_ZOOM = 14;

/**
 * Tile source. OpenStreetMap's public tiles need no key, which keeps MVP
 * testing free. Their usage policy discourages production traffic, so this
 * is the single constant to change when swapping to another free tile host.
 * https://operations.osmfoundation.org/policies/tiles/
 */
export const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** How many shops a single search returns. */
export const DEFAULT_RESULT_LIMIT = 30;
export const MAX_RESULT_LIMIT = 100;

/** Search radius steps in km, widened until enough shops are found. */
export const SEARCH_RADII_KM = [2, 5, 10, 25];

export const CATEGORY_LABELS = {
  standard: "Theka",
  legendary: "Legendary",
  dive_bar: "Dive Bar",
} as const;
