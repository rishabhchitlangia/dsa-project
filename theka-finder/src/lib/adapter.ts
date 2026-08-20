import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

/**
 * Picks a driver adapter from the connection string.
 *
 * Neon is reachable both over the Postgres wire protocol on 5432 and over
 * an HTTP endpoint on 443. We prefer HTTP for Neon: it needs no connection
 * setup, which suits serverless cold starts, and it works on networks that
 * allow only 443.
 *
 * The HTTP driver cannot do interactive transactions. Nothing in this app
 * or its seed script uses them; switch to `PrismaNeon` (WebSocket) if that
 * changes.
 *
 * Migrations always use the wire protocol, so `prisma migrate deploy` needs
 * outbound 5432 regardless of what this returns.
 */
export function createAdapter(connectionString: string) {
  let isNeon = false;
  try {
    isNeon = new URL(connectionString).hostname.endsWith(".neon.tech");
  } catch {
    isNeon = false;
  }

  return isNeon
    ? new PrismaNeonHttp(connectionString, {})
    : new PrismaPg({ connectionString });
}
