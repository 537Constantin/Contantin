import { NextRequest, NextResponse } from "next/server";
import { resolveScope, saveOAuthMailbox } from "@/lib/mailbox";
import { microsoftConfigured, microsoftExchangeCode, microsoftCallbackUrl } from "@/lib/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Microsoft redirects here with ?code — we swap it for tokens and store them. */
export async function GET(req: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const done = (params: string) => NextResponse.redirect(`${origin}/inbox?${params}`);
  const fail = (msg: string) => done(`mailerror=${encodeURIComponent(msg)}`);

  const url = req.nextUrl;
  const err = url.searchParams.get("error");
  if (err) return fail(err === "access_denied" ? "Zugriff abgelehnt." : `Microsoft-Fehler: ${err}`);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.cookies.get("inbox_oauth_state")?.value;
  if (!code || !state || !cookieState || state !== cookieState) {
    return fail("Sitzung abgelaufen oder ungültig – bitte erneut versuchen.");
  }
  if (!microsoftConfigured()) return fail("Microsoft-Login ist nicht konfiguriert.");

  const scope = await resolveScope();
  if (!scope) return fail("Bitte zuerst anmelden.");

  const tokens = await microsoftExchangeCode(code, microsoftCallbackUrl(origin));
  if (!tokens || !tokens.email) return fail("Anmeldung fehlgeschlagen – kein Zugriff erhalten.");

  const saved = await saveOAuthMailbox(scope, {
    provider: "microsoft",
    email: tokens.email,
    refreshToken: tokens.refreshToken,
    host: "outlook.office365.com",
    port: 993,
  });
  if (!saved) return fail("Verbindung konnte nicht gespeichert werden.");

  const res = done("connected=1");
  res.cookies.delete("inbox_oauth_state");
  return res;
}
