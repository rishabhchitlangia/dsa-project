import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

// Next.js dev mode re-evaluates modules on every hot reload; without the
// global cache each reload opens a fresh pool and Postgres runs out of
// connections. Standard Prisma-on-Next pattern.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Neon is reachable two ways: the normal Postgres wire protocol on 5432,
 * and an HTTP endpoint on 443. We use the HTTP driver for Neon because it
 * needs no connection setup — a good fit for serverless, where every
 * request may be a cold start — and because some networks allow only 443.
 *
 * The HTTP driver cannot do interactive transactions. Nothing in this app
 * uses them; if that changes, switch to `PrismaNeon` (WebSocket) here.
 *
 * Migrations always use the wire protocol, so `prisma migrate deploy` must
 * run somewhere with outbound 5432.
 */
function isNeon(connectionString: string): boolean {
  try {
    return new URL(connectionString).hostname.endsWith(".neon.tech");
  } catch {
    return false;
  }
}

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and fill it in.",
    );
  }

  const adapter = isNeon(connectionString)
    ? new PrismaNeonHttp(connectionString, {})
    : new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
