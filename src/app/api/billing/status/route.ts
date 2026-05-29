import { NextResponse } from "next/server";
import { isStripeLive } from "@/lib/billing";

/**
 * Lets client components know whether live payments are configured, so the UI
 * can show a "Demo-Modus" vs. "Live" indicator without exposing any secrets.
 */
export async function GET() {
  return NextResponse.json({ live: isStripeLive() });
}
