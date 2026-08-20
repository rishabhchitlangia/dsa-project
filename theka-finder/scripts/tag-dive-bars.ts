/**
 * Provisionally tags dive bars from the imported data.
 *
 *   npm run tag:dive-bars -- --dry-run   # show what would change
 *   npm run tag:dive-bars                # apply
 *   npm run tag:dive-bars -- --undo      # put them all back to standard
 *
 * This is a heuristic, not curation. The Legendary and Dive Bar lists are
 * meant to be picked by hand; this exists only so the section isn't empty
 * before that work happens. Every row it touches can be changed at /admin,
 * and --undo reverses the lot.
 *
 * The signal is Mumbai's naming convention: a permit room is almost always
 * called "<Something> Bar & Restaurant". That phrase distinguishes an uncle
 * bar from a cocktail bar or gastropub far better than any category tag —
 * Overture labels only two places in the whole city `dive_bar`.
 *
 * It writes both data/shops.json and the database, so a reseed does not
 * silently undo the tagging.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { createAdapter } from "../src/lib/adapter";

try {
  process.loadEnvFile(path.join(process.cwd(), ".env"));
} catch {
  // Ambient environment.
}

/** "X Bar & Restaurant", "Restaurant and Bar", "X Family Bar". */
const UNCLE_BAR_NAME =
  /(bar\s*(&|and|\+)\s*restaurant)|(restaurant\s*(&|and|\+)\s*bar)|(family\s*(bar|restaurant))|(permit\s*room)/i;

/** Categories a permit room could plausibly be filed under. */
const PLAUSIBLE = new Set(["bar", "pub", "beer_bar", "dive_bar"]);
const PLAUSIBLE_OSM = new Set(["amenity=bar", "amenity=pub"]);

/** Explicitly upmarket — never an uncle bar, whatever it is called. */
const NEVER = new Set([
  "cocktail_bar",
  "gastropub",
  "brewery",
  "beer_garden",
  "sports_bar",
  "wine_bar",
]);

type Shop = {
  slug: string;
  name: string;
  area: string;
  category: string;
  overtureCategory?: string;
  osmKind?: string;
};

function shouldTag(shop: Shop): boolean {
  const cat = shop.overtureCategory ?? "";
  if (NEVER.has(cat)) return false;

  // Overture's own dive_bar label, where it exists, is authoritative.
  if (cat === "dive_bar") return true;

  const plausible =
    PLAUSIBLE.has(cat) || PLAUSIBLE_OSM.has(shop.osmKind ?? "");
  return plausible && UNCLE_BAR_NAME.test(shop.name);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const undo = process.argv.includes("--undo");

  const file = path.join(process.cwd(), "data", "shops.json");
  const shops = JSON.parse(readFileSync(file, "utf8")) as Shop[];

  // Selected by the rule alone, not by current state, so re-running after a
  // partial failure still reconciles the database with the file.
  const targets = undo
    ? shops.filter((s) => s.category === "dive_bar")
    : shops.filter(shouldTag);

  const nextCategory = undo ? "standard" : "dive_bar";

  console.log(
    undo
      ? `Reverting ${targets.length} dive bars to standard`
      : `Tagging ${targets.length} of ${shops.length} shops as dive bars`,
  );

  const byArea = new Map<string, number>();
  for (const s of targets) byArea.set(s.area, (byArea.get(s.area) ?? 0) + 1);
  for (const [area, n] of [...byArea].sort((a, b) => b[1] - a[1]).slice(0, 8)) {
    console.log(`  ${area.padEnd(20)} ${n}`);
  }
  console.log("\n  examples:");
  for (const s of targets.slice(0, 8)) {
    console.log(`    ${s.name.slice(0, 44).padEnd(46)} ${s.area}`);
  }

  if (dryRun) {
    console.log("\n  --dry-run: nothing written.");
    return;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set.");
  const prisma = new PrismaClient({ adapter: createAdapter(connectionString) });

  try {
    let updated = 0;
    // Single-row updates rather than updateMany: Prisma runs updateMany in a
    // transaction, and the Neon HTTP driver has none. Batched so 200+ rows
    // don't open 200 requests at once.
    const BATCH = 20;
    for (let i = 0; i < targets.length; i += BATCH) {
      const batch = targets.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        batch.map((s) =>
          prisma.shop.update({
            where: { slug: s.slug },
            data: { category: nextCategory as "dive_bar" | "standard" },
          }),
        ),
      );
      updated += results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) console.warn(`  ${failed} rows in this batch failed`);
    }

    const counts = await prisma.shop.groupBy({
      by: ["category"],
      _count: { _all: true },
    });
    // Only now update the file, so a database failure doesn't leave the two
    // out of step.
    for (const s of targets) s.category = nextCategory;
    writeFileSync(file, JSON.stringify(shops, null, 2) + "\n");

    console.log(`\n  ${updated} rows updated in the database`);
    for (const c of counts) console.log(`  ${c.category.padEnd(10)} ${c._count._all}`);
    console.log(`
  This is a heuristic, not curation. Change any of them at /admin, or run
  \`npm run tag:dive-bars -- --undo\` to revert the lot.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(`\n${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
