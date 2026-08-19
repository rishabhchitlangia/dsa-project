/**
 * Seeds shops from data/shops.json (falling back to data/shops.sample.json).
 *
 * Idempotent: shops are upserted on `slug`, so re-running updates existing
 * rows rather than duplicating them. Reviews are never touched — reseeding
 * will not wipe community content.
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedFileSchema } from "../src/lib/validation";
import { shopSlug } from "../src/lib/slug";

try {
  process.loadEnvFile(path.join(process.cwd(), ".env"));
} catch {
  // Rely on the ambient environment (CI, Vercel, etc.).
}

const DATA_DIR = path.join(process.cwd(), "data");

function resolveDataFile(): string {
  const preferred = path.join(DATA_DIR, "shops.json");
  const importOutput = path.join(DATA_DIR, "shops.osm.json");
  if (existsSync(preferred)) return preferred;
  if (existsSync(importOutput)) return importOutput;
  throw new Error(
    `No seed data found. Expected ${preferred}.\n` +
      `Run \`npm run import:osm -- --merge\` to fetch shops from OpenStreetMap.`,
  );
}

/** Areas are validated against the local dataset so search never misses. */
function knownAreas(): Set<string> {
  const areas = JSON.parse(
    readFileSync(path.join(DATA_DIR, "mumbai-areas.json"), "utf8"),
  ) as Array<{ name: string; aliases: string[] }>;
  const set = new Set<string>();
  for (const a of areas) {
    set.add(a.name.toLowerCase());
    for (const alias of a.aliases) set.add(alias.toLowerCase());
  }
  return set;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.");
  }

  const file = resolveDataFile();
  console.log(`Seeding from ${path.relative(process.cwd(), file)}`);

  const raw: unknown = JSON.parse(readFileSync(file, "utf8"));
  const parsed = seedFileSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("Seed data failed validation:\n");
    for (const issue of parsed.error.issues) {
      console.error(`  [${issue.path.join(".")}] ${issue.message}`);
    }
    process.exitCode = 1;
    return;
  }

  const shops = parsed.data;
  const areas = knownAreas();
  const unknownAreas = [
    ...new Set(
      shops.map((s) => s.area).filter((a) => !areas.has(a.toLowerCase())),
    ),
  ];
  if (unknownAreas.length > 0) {
    console.warn(
      `Warning: not in mumbai-areas.json, so area search won't find them: ${unknownAreas.join(", ")}`,
    );
  }

  const slugs = shops.map((s) => s.slug ?? shopSlug(s.name, s.area));
  const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (dupes.length > 0) {
    throw new Error(
      `Duplicate shop slugs in seed data: ${[...new Set(dupes)].join(", ")}. ` +
        `Add an explicit "slug" to disambiguate.`,
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const now = new Date();
    let created = 0;
    let updated = 0;

    for (const [i, shop] of shops.entries()) {
      const slug = slugs[i];
      const fields = {
        name: shop.name,
        address: shop.address,
        area: shop.area,
        pincode: shop.pincode,
        latitude: shop.latitude,
        longitude: shop.longitude,
        phone: shop.phone ?? null,
        hoursWeekday: shop.hoursWeekday,
        hoursWeekend: shop.hoursWeekend,
        category: shop.category,
        source: shop.source,
        osmId: shop.osmId ?? null,
        // Seeded rows are trusted; only public submissions start pending.
        status: "approved" as const,
        verifiedToday: shop.verifiedToday,
        verifiedAt: shop.verifiedToday ? now : null,
      };

      // Match on the OSM id first so a renamed shop updates in place
      // rather than becoming a second row under a new slug.
      const existing = shop.osmId
        ? await prisma.shop.findFirst({
            where: { OR: [{ osmId: shop.osmId }, { slug }] },
            select: { id: true },
          })
        : await prisma.shop.findUnique({ where: { slug }, select: { id: true } });

      if (existing) {
        await prisma.shop.update({ where: { id: existing.id }, data: { slug, ...fields } });
      } else {
        await prisma.shop.create({ data: { slug, ...fields } });
      }
      if (existing) updated++;
      else created++;
    }

    const counts = await prisma.shop.groupBy({
      by: ["category"],
      _count: { _all: true },
    });

    console.log(`\n  ${created} created, ${updated} updated`);
    for (const c of counts) {
      console.log(`  ${c.category.padEnd(10)} ${c._count._all}`);
    }
    console.log(`  total      ${await prisma.shop.count()}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
