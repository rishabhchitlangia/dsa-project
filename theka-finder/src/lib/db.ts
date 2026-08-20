import { PrismaClient } from "@/generated/prisma/client";
import { createAdapter } from "./adapter";

// Next.js dev mode re-evaluates modules on every hot reload; without the
// global cache each reload opens a fresh pool and Postgres runs out of
// connections. Standard Prisma-on-Next pattern.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and fill it in.",
    );
  }
  return new PrismaClient({ adapter: createAdapter(connectionString) });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
