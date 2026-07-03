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
  const secure = body.secure !== false;
  const email = (body.email ?? "").trim();
  const password = body.password ?? "";

  if (!host || !EMAIL_RE.test(email) || !password) {
    return NextResponse.json({ ok: false, error: "Bitte Server, E-Mail-Adresse und App-Passwort angeben." }, { status: 400 });
  }

  // Test the login before saving anything.
  const client = new ImapFlow({ host, port, secure, auth: { user: email, pass: password }, logger: false });
  try {
    await client.connect();
    await client.logout();
  } catch (err) {
    try { await client.close(); } catch { /* ignore */ }
    const msg = (err as Error)?.message ?? "";
    const friendly = /auth|login|credential|password/i.test(msg)
      ? "Login fehlgeschlagen – prüfe E-Mail-Adresse und App-Passwort (nicht das normale Passwort)."
      : `Verbindung zum Server fehlgeschlagen: ${msg.slice(0, 140)}`;
    return NextResponse.json({ ok: false, error: friendly }, { status: 400 });
  }

  const saved = await saveMailbox(scope, { host, port, secure, email, password });
  if (!saved) return NextResponse.json({ ok: false, error: "Konnte die Verbindung nicht speichern." }, { status: 500 });

  return NextResponse.json({ ok: true, email });
}
