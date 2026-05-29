/**
 * Applies the Prisma schema to the database during build — but only when a
 * DATABASE_URL is configured. In demo mode (no DB) it does nothing, so the
 * build always succeeds with zero database setup.
 *
 * Failures here are intentionally non-fatal: if the schema can't be applied,
 * the deploy still goes through and the app falls back to localStorage at
 * runtime until the database is reachable.
 */
import { execSync } from "node:child_process";

// Accept whichever name the host injects (Neon: DATABASE_URL, Vercel Postgres:
// POSTGRES_PRISMA_URL, …).
const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  "";

if (!url) {
  console.log("[db-deploy] No database URL — skipping schema push (demo mode).");
  process.exit(0);
}

try {
  console.log("[db-deploy] Database URL detected — applying schema with `prisma db push`…");
  // Prisma's schema reads env("DATABASE_URL"); pass the resolved url under that
  // name so the push works regardless of which variable the host set.
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
  console.log("[db-deploy] Schema is up to date.");
} catch (err) {
  console.warn("[db-deploy] Schema push failed — the app will use local storage until the DB is reachable.");
  console.warn(String(err?.message ?? err));
  process.exit(0); // non-fatal: never block the deploy
}
