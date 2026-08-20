/**
 * Imports Mumbai liquor shops and bars from OpenStreetMap via Overpass.
 *
 * Why OSM and not Google Places: OSM data is ODbL licensed, which permits
 * storing and redistributing it with attribution. Google's Maps Platform
 * terms allow storing only `place_id` indefinitely and lat/lng for 30 days —
 * names, addresses, phone numbers and hours may not be warehoused at all,
 * which is exactly what this app's Shop table does.
 *
 *   npm run import:osm              # writes data/shops.osm.json
 *   npm run import:osm -- --merge   # merges into data/shops.json
 *   npm run import:osm -- --out=path.json
 *
 * Attribution obligation: anything published from this data must credit
 * "© OpenStreetMap contributors" (already in the site footer).
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { parseOpeningHours } from "../src/lib/osmHours";
import { shopSlug } from "../src/lib/slug";
import { haversineKm } from "../src/lib/geo";
import { MUMBAI_BOUNDS } from "../src/lib/constants";
import { AREAS, findArea, type Area } from "../src/lib/areas";
import { isPlaceLabelNotBusiness } from "../src/lib/placeName";

/**
 * Public Overpass instances, tried in order. They are volunteer-run and
 * frequently overloaded or briefly unreachable, so this rotates and backs
 * off rather than failing on the first refusal.
 */
const MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.osm.ch/api/interpreter",
];

const ATTEMPTS_PER_MIRROR = 3;

/** OSM tags worth pulling. Bars and pubs are candidates for the dive-bar list. */
const QUERY = `[out:json][timeout:180];
(
  node["shop"~"^(alcohol|wine|beverages)$"](${MUMBAI_BOUNDS.minLat},${MUMBAI_BOUNDS.minLng},${MUMBAI_BOUNDS.maxLat},${MUMBAI_BOUNDS.maxLng});
  way["shop"~"^(alcohol|wine|beverages)$"](${MUMBAI_BOUNDS.minLat},${MUMBAI_BOUNDS.minLng},${MUMBAI_BOUNDS.maxLat},${MUMBAI_BOUNDS.maxLng});
  node["amenity"~"^(bar|pub|biergarten)$"](${MUMBAI_BOUNDS.minLat},${MUMBAI_BOUNDS.minLng},${MUMBAI_BOUNDS.maxLat},${MUMBAI_BOUNDS.maxLng});
  way["amenity"~"^(bar|pub|biergarten)$"](${MUMBAI_BOUNDS.minLat},${MUMBAI_BOUNDS.minLng},${MUMBAI_BOUNDS.maxLat},${MUMBAI_BOUNDS.maxLng});
);
out center tags;`;

type OsmElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type ImportedShop = {
  name: string;
  address: string;
  area: string;
  pincode: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  hoursWeekday: string | null;
  hoursWeekend: string | null;
  category: "standard";
  source: "osm";
  osmId: string;
  /** OSM tag this came from, so curation can filter bars from bottle shops. */
  osmKind: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchFromOverpass(): Promise<OsmElement[]> {
  let lastError = "";

  for (const mirror of MIRRORS) {
    for (let attempt = 1; attempt <= ATTEMPTS_PER_MIRROR; attempt++) {
      const host = new URL(mirror).host;
      process.stdout.write(`  ${host} (try ${attempt}/${ATTEMPTS_PER_MIRROR})… `);
      try {
        const res = await fetch(mirror, {
          method: "POST",
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            // Overpass asks clients to identify themselves.
            "user-agent": "theka-finder/0.1 (Mumbai liquor shop locator)",
          },
          body: new URLSearchParams({ data: QUERY }).toString(),
          signal: AbortSignal.timeout(190_000),
        });

        if (!res.ok) {
          console.log(`HTTP ${res.status}`);
          lastError = `HTTP ${res.status} from ${host}`;
          await sleep(attempt * 3000);
          continue;
        }

        const json = (await res.json()) as { elements?: OsmElement[] };
        const elements = json.elements ?? [];

        // Some mirrors answer 200 from an empty or half-loaded database.
        if (elements.length === 0) {
          console.log("0 elements — mirror looks empty, skipping");
          lastError = `${host} returned an empty dataset`;
          break;
        }

        console.log(`${elements.length} elements`);
        return elements;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(msg.slice(0, 60));
        lastError = msg;
        await sleep(attempt * 3000);
      }
    }
  }

  throw new Error(
    `Every Overpass mirror failed. Last error: ${lastError}\n` +
      `Overpass instances are volunteer-run; waiting a few minutes and re-running usually works.`,
  );
}

/** Nearest known Mumbai area to a point, used when tags carry no suburb. */
function nearestArea(lat: number, lng: number): Area {
  let best = AREAS[0];
  let bestKm = Infinity;
  for (const area of AREAS) {
    const km = haversineKm(
      { latitude: lat, longitude: lng },
      { latitude: area.lat, longitude: area.lng },
    );
    if (km < bestKm) {
      bestKm = km;
      best = area;
    }
  }
  return best;
}

function buildAddress(tags: Record<string, string>, area: string): string {
  const areaKey = area.trim().toLowerCase();
  const parts = [
    tags["addr:housename"],
    [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" "),
    tags["addr:neighbourhood"],
  ]
    .filter((p): p is string => Boolean(p && p.trim()))
    // Drop any segment that just repeats the area; the UI appends it.
    .filter((p) => p.trim().toLowerCase() !== areaKey);

  return parts.join(", ").trim();
}

function normalise(el: OsmElement): ImportedShop | null {
  const tags = el.tags ?? {};
  const name = tags.name?.trim();
  // A listing nobody can name is not useful on a locator.
  if (!name) return null;
  if (isPlaceLabelNotBusiness(name)) return null;

  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  if (
    lat < MUMBAI_BOUNDS.minLat || lat > MUMBAI_BOUNDS.maxLat ||
    lng < MUMBAI_BOUNDS.minLng || lng > MUMBAI_BOUNDS.maxLng
  ) {
    return null;
  }

  // Prefer an area the tags name; fall back to the nearest centroid.
  const tagged =
    tags["addr:suburb"] ??
    tags["addr:neighbourhood"] ??
    tags["addr:city_district"] ??
    tags["addr:district"];
  const area = (tagged && findArea(tagged)) || nearestArea(lat, lng);

  const pincode = /^\d{6}$/.test(tags["addr:postcode"] ?? "")
    ? tags["addr:postcode"]
    : area.pincodes[0];

  const hours = parseOpeningHours(tags.opening_hours);
  const address = buildAddress(tags, area.name);

  return {
    name,
    address: address || area.name,
    area: area.name,
    pincode,
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lng.toFixed(6)),
    phone: tags.phone ?? tags["contact:phone"] ?? null,
    hoursWeekday: hours.weekday,
    hoursWeekend: hours.weekend,
    // Curation is manual by design: nothing is auto-promoted to legendary
    // or dive_bar. `osmKind` is there so bars can be reviewed in bulk.
    category: "standard",
    source: "osm",
    osmId: `${el.type}/${el.id}`,
    osmKind: tags.shop ? `shop=${tags.shop}` : `amenity=${tags.amenity}`,
  };
}

/** Same name within 60 m is the same place mapped twice. */
function dedupe(shops: ImportedShop[]): { kept: ImportedShop[]; dropped: number } {
  const kept: ImportedShop[] = [];
  let dropped = 0;

  for (const shop of shops) {
    const duplicate = kept.find(
      (k) =>
        k.name.toLowerCase() === shop.name.toLowerCase() &&
        haversineKm(
          { latitude: k.latitude, longitude: k.longitude },
          { latitude: shop.latitude, longitude: shop.longitude },
        ) < 0.06,
    );
    if (duplicate) {
      // Keep whichever record carries more information.
      if (!duplicate.hoursWeekday && shop.hoursWeekday) {
        duplicate.hoursWeekday = shop.hoursWeekday;
        duplicate.hoursWeekend = shop.hoursWeekend;
      }
      if (!duplicate.phone && shop.phone) duplicate.phone = shop.phone;
      dropped++;
      continue;
    }
    kept.push(shop);
  }

  return { kept, dropped };
}

/** Slugs must be unique; disambiguate collisions with a numeric suffix. */
function assignSlugs(shops: ImportedShop[]): Array<ImportedShop & { slug: string }> {
  const seen = new Map<string, number>();
  return shops.map((shop) => {
    const base = shopSlug(shop.name, shop.area);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return { ...shop, slug: count === 0 ? base : `${base}-${count + 1}` };
  });
}

async function main() {
  const args = process.argv.slice(2);
  const merge = args.includes("--merge");
  const outArg = args.find((a) => a.startsWith("--out="));
  const dataDir = path.join(process.cwd(), "data");
  const outFile = outArg
    ? path.resolve(outArg.slice("--out=".length))
    : path.join(dataDir, merge ? "shops.json" : "shops.osm.json");

  console.log("Querying Overpass for Mumbai alcohol shops and bars…");
  const elements = await fetchFromOverpass();

  const normalised = elements
    .map(normalise)
    .filter((s): s is ImportedShop => s !== null);
  const unnamed = elements.length - normalised.length;

  const { kept, dropped } = dedupe(normalised);
  let shops = assignSlugs(kept);

  let mergedExisting = 0;
  if (merge && existsSync(outFile)) {
    const existing = JSON.parse(readFileSync(outFile, "utf8")) as Array<
      Record<string, unknown>
    >;
    // Curated entries win: an import must never overwrite hand-set
    // categories, hours or the legendary/dive_bar lists.
    const byOsmId = new Map(
      existing.filter((e) => e.osmId).map((e) => [e.osmId as string, e]),
    );
    const bySlug = new Map(existing.map((e) => [e.slug as string, e]));

    const additions = shops.filter(
      (s) => !byOsmId.has(s.osmId) && !bySlug.has(s.slug),
    );
    mergedExisting = existing.length;
    writeFileSync(
      outFile,
      JSON.stringify([...existing, ...additions], null, 2) + "\n",
    );
    shops = additions as typeof shops;
  } else {
    writeFileSync(outFile, JSON.stringify(shops, null, 2) + "\n");
  }

  const withHours = shops.filter((s) => s.hoursWeekday || s.hoursWeekend).length;
  const withPhone = shops.filter((s) => s.phone).length;
  const withAddress = shops.filter((s) => s.address && !AREAS.some((a) => a.name === s.address)).length;
  const byKind = new Map<string, number>();
  for (const s of shops) byKind.set(s.osmKind, (byKind.get(s.osmKind) ?? 0) + 1);

  console.log(`
OpenStreetMap import
────────────────────
  elements returned    ${elements.length}
  skipped (no name)    ${unnamed}
  duplicates merged    ${dropped}
  written              ${shops.length}${merge ? ` new (${mergedExisting} already present)` : ""}

  with opening hours   ${withHours}  (${Math.round((withHours / Math.max(1, shops.length)) * 100)}%)
  with a phone number  ${withPhone}
  with a street address${String(withAddress).padStart(4)}

  by OSM tag`);
  for (const [kind, n] of [...byKind].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${kind.padEnd(20)} ${n}`);
  }
  console.log(`
  → ${path.relative(process.cwd(), outFile)}

  Shops with no hours are stored as unknown, not guessed; the site shows
  "Hours not listed" for them. Everything imports as category "standard" —
  promote to legendary or dive_bar by hand. Entries tagged amenity=bar or
  amenity=pub are the dive-bar candidates.

  Data © OpenStreetMap contributors, ODbL.`);
}

main().catch((err) => {
  console.error(`\n${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
