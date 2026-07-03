import { NextRequest, NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { resolveScope, saveMailbox } from "@/lib/mailbox";
import { cryptoConfigured } from "@/lib/mail-crypto";
import { dbEnabled } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  if (!dbEnabled) return NextResponse.json({ ok: false, error: "Keine Datenbank verbunden." }, { status: 400 });
  if (!cryptoConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Server nicht bereit: CRON_SECRET (oder MAIL_ENCRYPTION_KEY) muss in Vercel gesetzt sein." },
      { status: 400 },
    );
  }

  const scope = await resolveScope();
  if (!scope) return NextResponse.json({ ok: false, error: "Nicht angemeldet." }, { status: 401 });

  let body: { host?: string; port?: number; secure?: boolean; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ungültiger Request" }, { status: 400 });
  }

  const host = (body.host ?? "").trim();
  const port = Number(body.port) || 993;
  // Port 993 = implicit TLS, port 143 = STARTTLS (secure:false lets ImapFlow
  // upgrade). Derive from the port unless the caller explicitly overrides it.
  const secure = typeof body.secure === "boolean" ? body.secure : port !== 143;
  const email = (body.email ?? "").trim();
  const password = body.password ?? "";

  if (!host || !EMAIL_RE.test(email) || !password) {
    return NextResponse.json({ ok: false, error: "Bitte Server, E-Mail-Adresse und App-Passwort angeben." }, { status: 400 });
  }

  // Test the login before saving anything. Only connect() proves the
  // credentials work — logout() is best-effort and must never fail the check.
  const client = new ImapFlow({
    host, port, secure,
    auth: { user: email, pass: password },
    logger: false,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    // Some servers reject the ID command; disabling it avoids a hard failure.
    clientInfo: { name: "SmartStaff", version: "1.0" },
  });
  try {
    await client.connect();
  } catch (err) {
    try { await client.close(); } catch { /* ignore */ }
    const e = err as { message?: string; code?: string; responseText?: string };
    const raw = [e?.responseText, e?.message, e?.code].filter(Boolean).join(" ").trim();
    const friendly = /auth|login|credential|password|invalid|denied/i.test(raw)
      ? "Login fehlgeschlagen – prüfe E-Mail-Adresse und App-Passwort (nicht das normale Passwort). Bei Gmail/GMX/Web.de muss IMAP im Postfach aktiviert und ein App-Passwort verwendet werden."
      : `Verbindung zum Server fehlgeschlagen (${host}:${port}). Details: ${raw.slice(0, 200) || "keine Meldung"}`;
    return NextResponse.json({ ok: false, error: friendly }, { status: 400 });
  }
  // Auth succeeded — tidy up the test connection without letting it throw.
  try { await client.logout(); } catch { try { await client.close(); } catch { /* ignore */ } }

  const saved = await saveMailbox(scope, { host, port, secure, email, password });
  if (!saved) return NextResponse.json({ ok: false, error: "Konnte die Verbindung nicht speichern." }, { status: 500 });

  return NextResponse.json({ ok: true, email });
}
