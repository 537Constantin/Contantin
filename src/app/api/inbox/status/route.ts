import { NextResponse } from "next/server";
import { resolveScope, getMailboxConfig } from "@/lib/mailbox";
import { dbEnabled } from "@/lib/db";
import { cryptoConfigured } from "@/lib/mail-crypto";
import { googleConfigured, microsoftConfigured } from "@/lib/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const googleReady = googleConfigured();
  const microsoftReady = microsoftConfigured();
  if (!dbEnabled) return NextResponse.json({ connected: false, ready: false, googleReady, microsoftReady });
  const scope = await resolveScope();
  if (!scope) return NextResponse.json({ connected: false, ready: cryptoConfigured(), googleReady, microsoftReady });
  const cfg = await getMailboxConfig(scope);
  return NextResponse.json({
    connected: Boolean(cfg),
    ready: cryptoConfigured(),
    googleReady,
    microsoftReady,
    email: cfg?.email ?? null,
    provider: cfg?.provider ?? null,
  });
}
