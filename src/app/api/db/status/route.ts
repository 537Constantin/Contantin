/** Reports whether a database is configured and reachable (for the settings UI). */
import { NextResponse } from "next/server";
import { db, dbEnabled } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!dbEnabled || !db) return NextResponse.json({ configured: false, connected: false });
  try {
    // Query the actual table so "connected" means ready-to-use (reachable AND
    // the schema has been applied), not merely that the server responds.
    await db.storeItem.count();
    return NextResponse.json({ configured: true, connected: true });
  } catch {
    return NextResponse.json({ configured: true, connected: false });
  }
}
