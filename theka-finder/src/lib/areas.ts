import areasData from "../../data/mumbai-areas.json";
import { MUMBAI_CENTER } from "./constants";

export type Area = {
  name: string;
  pincodes: string[];
  aliases: string[];
  lat: number;
  lng: number;
};

export const AREAS: Area[] = areasData as Area[];

const normalise = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ");

export type AreaMatch = {
  area: Area;
  /** How the query matched — used to rank results. */
  via: "pincode" | "name" | "alias" | "partial";
};

/**
 * Resolves a free-text query ("bandra", "400050", "khar west") to a Mumbai
 * area. Entirely local — no geocoding service, no API key, no rate limit.
 */
export function findAreas(query: string, limit = 6): AreaMatch[] {
  const q = normalise(query);
  if (!q) return [];

  const matches: AreaMatch[] = [];
  const seen = new Set<string>();

  const push = (area: Area, via: AreaMatch["via"]) => {
    if (seen.has(area.name)) return;
    seen.add(area.name);
    matches.push({ area, via });
  };

  // Pincodes are unambiguous, so they win.
  if (/^\d{3,6}$/.test(q)) {
    for (const area of AREAS) {
      if (area.pincodes.some((p) => p.startsWith(q))) push(area, "pincode");
    }
    return matches.slice(0, limit);
  }

  for (const area of AREAS) {
    if (normalise(area.name) === q) push(area, "name");
  }
  for (const area of AREAS) {
    if (area.aliases.some((a) => normalise(a) === q)) push(area, "alias");
  }
  for (const area of AREAS) {
    const haystack = [area.name, ...area.aliases].map(normalise);
    if (haystack.some((h) => h.includes(q) || q.includes(h))) {
      push(area, "partial");
    }
  }

  return matches.slice(0, limit);
}

/** Best single match, or null. */
export function findArea(query: string): Area | null {
  return findAreas(query, 1)[0]?.area ?? null;
}

/** Centre the map on a query, falling back to central Mumbai. */
export function centerFor(query: string | null | undefined): [number, number] {
  if (!query) return MUMBAI_CENTER;
  const area = findArea(query);
  return area ? [area.lat, area.lng] : MUMBAI_CENTER;
}

/** Suggestions for the search box. */
export function suggestAreas(query: string, limit = 6): Area[] {
  if (!query.trim()) return [];
  return findAreas(query, limit).map((m) => m.area);
}
