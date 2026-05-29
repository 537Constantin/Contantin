/**
 * Prisma client — optional, like every other integration in this app.
 *
 * When DATABASE_URL is set, `db` is a real PrismaClient and `dbEnabled` is true.
 * When it is absent (demo mode) the client is never constructed, so importing
 * this module is always safe and nothing tries to open a connection.
 */
import { PrismaClient } from "@prisma/client";

// Accept whichever name the host injects (Neon uses DATABASE_URL, Vercel
// Postgres uses POSTGRES_PRISMA_URL, etc.) so setup "just works".
const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  "";

export const dbEnabled = Boolean(databaseUrl);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db: PrismaClient | null = dbEnabled
  ? globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: databaseUrl })
  : null;

// Reuse the instance across hot reloads / serverless invocations in dev.
if (dbEnabled && db && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
