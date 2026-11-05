import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/**
 * Production runs on Neon's serverless driver (WebSockets). A plain local
 * Postgres can't speak that protocol, so local URLs use node-postgres instead.
 * Set DATABASE_ADAPTER=pg to force node-postgres for any other self-hosted DB.
 */
export function shouldUsePgAdapter(connectionString: string): boolean {
  if (process.env.DATABASE_ADAPTER === "pg") return true;
  if (process.env.DATABASE_ADAPTER === "neon") return false;
  try {
    return LOCAL_HOSTS.has(new URL(connectionString).hostname);
  } catch {
    return false;
  }
}

/** Create a client with the right driver adapter. Also used by CLI scripts. */
export function createPrismaClient(connectionString: string = process.env.DATABASE_URL!) {
  const adapter = shouldUsePgAdapter(connectionString)
    ? new PrismaPg({ connectionString })
    : new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
