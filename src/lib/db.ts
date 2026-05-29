/**
 * Prisma client — optional, like every other integration in this app.
 *
 * When DATABASE_URL is set, `db` is a real PrismaClient and `dbEnabled` is true.
 * When it is absent (demo mode) the client is never constructed, so importing
 * this module is always safe and nothing tries to open a connection.
 */
import { PrismaClient } from "@prisma/client";

export const dbEnabled = Boolean(process.env.DATABASE_URL);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db: PrismaClient | null = dbEnabled
  ? globalForPrisma.prisma ?? new PrismaClient()
  : null;

// Reuse the instance across hot reloads / serverless invocations in dev.
if (dbEnabled && db && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
