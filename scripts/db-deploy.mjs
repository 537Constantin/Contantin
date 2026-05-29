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

if (!process.env.DATABASE_URL) {
  console.log("[db-deploy] No DATABASE_URL — skipping schema push (demo mode).");
  process.exit(0);
}

try {
  console.log("[db-deploy] DATABASE_URL detected — applying schema with `prisma db push`…");
  execSync("npx prisma db push --skip-generate --accept-data-loss", { stdio: "inherit" });
  console.log("[db-deploy] Schema is up to date.");
} catch (err) {
  console.warn("[db-deploy] Schema push failed — the app will use local storage until the DB is reachable.");
  console.warn(String(err?.message ?? err));
  process.exit(0); // non-fatal: never block the deploy
}
