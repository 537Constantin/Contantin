import { NextResponse } from "next/server";
import { resolveScope, getMailboxConfig } from "@/lib/mailbox";
import { dbEnabled } from "@/lib/db";
import { cryptoConfigured } from "@/lib/mail-crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!dbEnabled) return NextResponse.json({ connected: false, ready: false });
  const scope = await resolveScope();
  if (!scope) return NextResponse.json({ connected: false, ready: cryptoConfigured() });
  const cfg = await getMailboxConfig(scope);
  return NextResponse.json({ connected: Boolean(cfg), ready: cryptoConfigured(), email: cfg?.email ?? null });
}
