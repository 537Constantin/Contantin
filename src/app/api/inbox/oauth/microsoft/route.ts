import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { resolveScope } from "@/lib/mailbox";
import { microsoftConfigured, microsoftAuthUrl, microsoftCallbackUrl } from "@/lib/oauth";
import { cryptoConfigured } from "@/lib/mail-crypto";
import { dbEnabled } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Kicks off the Microsoft OAuth consent flow. */
export async function GET(req: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const fail = (msg: string) => NextResponse.redirect(`${origin}/inbox?mailerror=${encodeURIComponent(msg)}`);

  if (!dbEnabled) return fail("Keine Datenbank verbunden.");
  if (!cryptoConfigured()) return fail("Server nicht bereit: CRON_SECRET (oder MAIL_ENCRYPTION_KEY) fehlt.");
  if (!microsoftConfigured()) return fail("Microsoft-Login ist nicht konfiguriert (MICROSOFT_OAUTH_CLIENT_ID/SECRET fehlen).");

  const scope = await resolveScope();
  if (!scope) return fail("Bitte zuerst anmelden.");

  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = microsoftCallbackUrl(origin);
  const res = NextResponse.redirect(microsoftAuthUrl(redirectUri, state));
  res.cookies.set("inbox_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
