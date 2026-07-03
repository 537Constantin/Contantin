import { NextResponse } from "next/server";
import { resolveScope, getMailboxConfig } from "@/lib/mailbox";
import { dbEnabled } from "@/lib/db";
import { cryptoConfigured } from "@/lib/mail-crypto";
import { googleConfigured } from "@/lib/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const googleReady = googleConfigured();
  if (!dbEnabled) return NextResponse.json({ connected: false, ready: false, googleReady });
  const scope = await resolveScope();
  if (!scope) return NextResponse.json({ connected: false, ready: cryptoConfigured(), googleReady });
  const cfg = await getMailboxConfig(scope);
  return NextResponse.json({
    connected: Boolean(cfg),
    ready: cryptoConfigured(),
    googleReady,
    email: cfg?.email ?? null,
    provider: cfg?.provider ?? null,
  });
}
