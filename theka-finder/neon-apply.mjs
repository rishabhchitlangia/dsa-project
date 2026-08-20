import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
process.loadEnvFile(".env");
const sql = neon(process.env.DATABASE_URL);
const DIR = "prisma/migrations";
const applied = new Set(
  (await sql`SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL`)
    .map((r) => r.migration_name));
for (const dir of readdirSync(DIR).filter(d => existsSync(path.join(DIR, d, "migration.sql"))).sort()) {
  if (applied.has(dir)) { console.log(`  = ${dir}`); continue; }
  const body = readFileSync(path.join(DIR, dir, "migration.sql"), "utf8");
  const statements = body.split(";").map(s => s.trim())
    .filter(s => s && !s.split("\n").every(l => l.trim().startsWith("--")));
  for (const s of statements) await sql.query(s);
  await sql`INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, started_at, applied_steps_count)
            VALUES (${randomUUID()}, ${createHash("sha256").update(body).digest("hex")}, now(), ${dir}, now(), ${statements.length})`;
  console.log(`  + ${dir} (${statements.length} statements)`);
}
const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name='Shop' AND column_name IN ('overtureId','osmId')`;
const vals = await sql`SELECT unnest(enum_range(NULL::"ShopSource"))::text AS v`;
console.log("\nid columns:", cols.map(c=>c.column_name).join(", "));
console.log("ShopSource values:", vals.map(v=>v.v).join(", "));
