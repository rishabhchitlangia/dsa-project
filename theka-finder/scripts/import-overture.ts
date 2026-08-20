/**
 * Imports Mumbai liquor shops and bars from Overture Maps.
 *
 * Overture's places theme is CDLA-Permissive 2.0, which — like OSM's ODbL —
 * permits storing and redistributing the data with attribution. It carries
 * roughly ten times OpenStreetMap's coverage of Mumbai retail, with street
 * addresses and phone numbers on the large majority of records.
 *
 *   npm run import:overture              # writes data/shops.overture.json
 *   npm run import:overture -- --merge   # merges into data/shops.json
 *   npm run import:overture -- --min-confidence=0.5
 *
 * Reads the public S3 bucket directly with DuckDB over HTTP range requests,
 * so only the relevant row groups are fetched rather than the whole planet.
 *
 * Attribution obligation: anything published from this data must credit
 * Overture Maps Foundation (the site footer does).
 *
 * Note: Overture places carry no opening hours, so every row imports with
 * hours unknown. That is what the community verify flow is for.
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { DuckDBInstance } from "@duckdb/node-api";
import { shopSlug } from "../src/lib/slug";
import { haversineKm } from "../src/lib/geo";
import { MUMBAI_BOUNDS } from "../src/lib/constants";
import { AREAS, findArea, type Area } from "../src/lib/areas";
import { isPlaceLabelNotBusiness } from "../src/lib/placeName";

const RELEASE_GLOB =
  "s3://overturemaps-us-west-2/release/*/theme=places/type=place/*.parquet";

/**
 * Overture category slugs we care about. Chosen explicitly rather than by
 * substring match — "%bar%" also catches barber, milk_bar and salad_bar.
 */
const CATEGORIES = [
  "liquor_store",
  "wine_and_spirits_store",
  "beer_store",
  "bar",
  "pub",
  "cocktail_bar",
  "beer_bar",
  "wine_bar",
  "sports_bar",
  "gastropub",
  "dive_bar",
  "brewery",
  "beer_garden",
] as const;

/** Categories that are bottle shops rather than places you sit and drink. */
const BOTTLE_SHOPS = new Set([
  "liquor_store",
  "wine_and_spirits_store",
  "beer_store",
]);

type Row = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  freeform: string | null;
  postcode: string | null;
  locality: string | null;
  phone: string | null;
  confidence: number;
};

type ImportedShop = {
  slug: string;
  name: string;
  address: string;
  area: string;
  pincode: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  hoursWeekday: null;
  hoursWeekend: null;
  category: "standard";
  source: "overture";
  overtureId: string;
  overtureCategory: string;
  confidence: number;
};

function arg(name: string): string | undefined {
  const found = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return found?.slice(name.length + 3);
}

async function query(minConfidence: number): Promise<Row[]> {
  const instance = await DuckDBInstance.create(":memory:");
  const con = await instance.connect();

  await con.run("INSTALL httpfs; LOAD httpfs;");
  // The sandbox this was written in injects AWS credentials that break
  // anonymous access to a public bucket; an empty secret forces anonymous.
  await con.run(
    "CREATE OR REPLACE SECRET anon (TYPE s3, PROVIDER config, KEY_ID '', SECRET '', REGION 'us-west-2');",
  );
  const proxy = process.env.HTTPS_PROXY?.replace(/^https?:\/\//, "");
  if (proxy) await con.run(`SET http_proxy='${proxy}';`);

  // Newest release only — the glob spans every published release.
  const latest = await con.runAndReadAll(
    `SELECT max(regexp_extract(file, 'release/([^/]+)/', 1)) AS r
     FROM glob('${RELEASE_GLOB}')`,
  );
  const release = latest.getRowObjects()[0]?.r as string;
  if (!release) throw new Error("Could not determine the latest Overture release.");
  console.log(`  release ${release}`);

  const src = `s3://overturemaps-us-west-2/release/${release}/theme=places/type=place/*.parquet`;
  const cats = CATEGORIES.map((c) => `'${c}'`).join(",");

  const result = await con.runAndReadAll(`
    SELECT
      id,
      names.primary                              AS name,
      categories.primary                         AS category,
      bbox.ymin                                  AS lat,
      bbox.xmin                                  AS lng,
      CASE WHEN len(addresses) > 0 THEN addresses[1].freeform END AS freeform,
      CASE WHEN len(addresses) > 0 THEN addresses[1].postcode END AS postcode,
      CASE WHEN len(addresses) > 0 THEN addresses[1].locality END AS locality,
      CASE WHEN len(phones)    > 0 THEN phones[1] END             AS phone,
      confidence
    FROM read_parquet('${src}')
    WHERE bbox.xmin BETWEEN ${MUMBAI_BOUNDS.minLng} AND ${MUMBAI_BOUNDS.maxLng}
      AND bbox.ymin BETWEEN ${MUMBAI_BOUNDS.minLat} AND ${MUMBAI_BOUNDS.maxLat}
      AND categories.primary IN (${cats})
      AND names.primary IS NOT NULL
      AND confidence >= ${minConfidence}
  `);

  return result.getRowObjects() as unknown as Row[];
}

/** Nearest known Mumbai area, used when the locality tag doesn't resolve. */
function nearestArea(lat: number, lng: number): Area {
  let best = AREAS[0];
  let bestKm = Infinity;
  for (const area of AREAS) {
    const km = haversineKm(
      { latitude: lat, longitude: lng },
      { latitude: area.lat, longitude: area.lng },
    );
    if (km < bestKm) [bestKm, best] = [km, area];
  }
  return best;
}

/**
 * The bounding box clips a corner of Thane and Navi Mumbai. Those are real
 * places but not this site's remit, so drop anything whose nearest known
 * Mumbai area is implausibly far away.
 */
const MAX_KM_FROM_KNOWN_AREA = 6;

function normalise(row: Row): ImportedShop | null {
  const name = row.name?.trim();
  if (!name) return null;
  // Some Overture rows are location labels rather than businesses.
  if (isPlaceLabelNotBusiness(name)) return null;

  const lat = Number(row.lat);
  const lng = Number(row.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const area = (row.locality && findArea(row.locality)) || nearestArea(lat, lng);
  const distanceFromArea = haversineKm(
    { latitude: lat, longitude: lng },
    { latitude: area.lat, longitude: area.lng },
  );
  if (distanceFromArea > MAX_KM_FROM_KNOWN_AREA) return null;

  const postcode = row.postcode?.trim() ?? "";
  const pincode = /^\d{6}$/.test(postcode) ? postcode : area.pincodes[0];

  // Drop an address that merely repeats the area; the UI appends it anyway.
  const freeform = row.freeform?.trim() ?? "";
  const address =
    freeform && freeform.toLowerCase() !== area.name.toLowerCase()
      ? freeform
      : area.name;

  return {
    slug: "",
    name,
    address,
    area: area.name,
    pincode,
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lng.toFixed(6)),
    phone: row.phone?.trim() || null,
    // Overture places carry no opening hours at all.
    hoursWeekday: null,
    hoursWeekend: null,
    // Curation stays manual; nothing is auto-promoted.
    category: "standard",
    source: "overture",
    overtureId: row.id,
    overtureCategory: row.category,
    confidence: Number(Number(row.confidence).toFixed(3)),
  };
}

/** Same name within 80m is one place listed twice. */
function dedupe(shops: ImportedShop[]): { kept: ImportedShop[]; dropped: number } {
  const kept: ImportedShop[] = [];
  let dropped = 0;
  for (const shop of shops) {
    const dupe = kept.find(
      (k) =>
        k.name.toLowerCase() === shop.name.toLowerCase() &&
        haversineKm(
          { latitude: k.latitude, longitude: k.longitude },
          { latitude: shop.latitude, longitude: shop.longitude },
        ) < 0.08,
    );
    if (dupe) {
      if (!dupe.phone && shop.phone) dupe.phone = shop.phone;
      if (shop.confidence > dupe.confidence) dupe.confidence = shop.confidence;
      dropped++;
      continue;
    }
    kept.push(shop);
  }
  return { kept, dropped };
}

async function main() {
  const merge = process.argv.includes("--merge");
  // Default to keeping everything. Overture's confidence score reflects how
  // many sources agree on a place, not whether it exists — every Mumbai
  // liquor store below 0.5 still had a name and a street address, so
  // filtering on it discarded real shops. Raise it with --min-confidence
  // if the long tail turns out to be stale.
  const minConfidence = Number(arg("min-confidence") ?? 0);
  const dataDir = path.join(process.cwd(), "data");
  const outFile = arg("out")
    ? path.resolve(arg("out")!)
    : path.join(dataDir, merge ? "shops.json" : "shops.overture.json");

  console.log("Querying Overture Maps for Mumbai liquor shops and bars…");
  console.log(`  minimum confidence ${minConfidence}`);
  const rows = await query(minConfidence);
  console.log(`  ${rows.length} rows in the Mumbai bounding box`);

  const normalised = rows
    .map(normalise)
    .filter((s): s is ImportedShop => s !== null);
  const outsideMumbai = rows.length - normalised.length;

  const { kept, dropped } = dedupe(normalised);

  // Best-quality records first, so slug collisions favour the better row.
  kept.sort((a, b) => b.confidence - a.confidence);

  const seenSlugs = new Map<string, number>();
  for (const shop of kept) {
    const base = shopSlug(shop.name, shop.area);
    const n = seenSlugs.get(base) ?? 0;
    seenSlugs.set(base, n + 1);
    shop.slug = n === 0 ? base : `${base}-${n + 1}`;
  }

  let additions = kept;
  let existingCount = 0;

  if (merge && existsSync(outFile)) {
    const existing = JSON.parse(readFileSync(outFile, "utf8")) as Array<
      Record<string, unknown>
    >;
    existingCount = existing.length;

    const byId = new Set(existing.map((e) => e.overtureId).filter(Boolean));
    const bySlug = new Set(existing.map((e) => e.slug));

    // A place already imported from OSM under a different name should not
    // reappear; match on proximity as well as identity.
    const existingPoints = existing.map((e) => ({
      name: String(e.name ?? "").toLowerCase(),
      latitude: Number(e.latitude),
      longitude: Number(e.longitude),
    }));

    additions = kept.filter((shop) => {
      if (byId.has(shop.overtureId) || bySlug.has(shop.slug)) return false;
      return !existingPoints.some(
        (e) =>
          e.name === shop.name.toLowerCase() &&
          haversineKm(e, shop) < 0.12,
      );
    });

    writeFileSync(
      outFile,
      JSON.stringify([...existing, ...additions], null, 2) + "\n",
    );
  } else {
    writeFileSync(outFile, JSON.stringify(kept, null, 2) + "\n");
  }

  const byCategory = new Map<string, number>();
  for (const s of additions) {
    byCategory.set(s.overtureCategory, (byCategory.get(s.overtureCategory) ?? 0) + 1);
  }
  const bottleShops = additions.filter((s) => BOTTLE_SHOPS.has(s.overtureCategory)).length;

  console.log(`
Overture Maps import
────────────────────
  rows returned          ${rows.length}
  dropped (outside Mumbai) ${outsideMumbai}
  duplicates merged      ${dropped}
  written                ${additions.length}${merge ? ` new (${existingCount} already present)` : ""}

  bottle shops           ${bottleShops}
  bars and pubs          ${additions.length - bottleShops}
  with a phone number    ${additions.filter((s) => s.phone).length}

  by Overture category`);
  for (const [cat, n] of [...byCategory].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${cat.padEnd(24)} ${n}`);
  }
  console.log(`
  → ${path.relative(process.cwd(), outFile)}

  Overture carries no opening hours, so every row imports as hours unknown
  and the site shows "Hours not listed". Everything imports as category
  "standard" — promote to legendary or dive_bar at /admin.

  Data © Overture Maps Foundation, CDLA-Permissive 2.0.`);
}

main().catch((err) => {
  console.error(`\n${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
