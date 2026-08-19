import path from "node:path";
import { defineConfig, env } from "prisma/config";

// Prisma 7 no longer auto-loads .env. Node 22's loadEnvFile does the job
// without adding dotenv as a dependency. In hosted environments (Vercel,
// Neon) DATABASE_URL is already in the process env and there is no file.
try {
  process.loadEnvFile(path.join(process.cwd(), ".env"));
} catch {
  // No .env file — rely on the ambient environment.
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
