import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { resolveScope, getSmtpConnection } from "@/lib/mailbox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Sends a reply from the user's own connected mailbox via SMTP. */
export async function POST(req: NextRequest) {
  const scope = await resolveScope();
  if (!scope) return NextResponse.json({ ok: false, error: "Nicht angemeldet." }, { status: 401 });

  let body: { to?: string; subject?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ungültiger Request" }, { status: 400 });
  }

  const to = (body.to ?? "").trim();
  const subject = (body.subject ?? "").trim() || "(kein Betreff)";
  const text = (body.text ?? "").trim();
  if (!EMAIL_RE.test(to)) return NextResponse.json({ ok: false, error: "Keine gültige Empfängeradresse." }, { status: 400 });
  if (!text) return NextResponse.json({ ok: false, error: "Die Antwort ist leer." }, { status: 400 });

  const cfg = await getSmtpConnection(scope);
  if (!cfg) return NextResponse.json({ ok: false, error: "not-connected" }, { status: 400 });

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.accessToken
      ? { type: "OAuth2", user: cfg.email, accessToken: cfg.accessToken }
      : { user: cfg.email, pass: cfg.pass! },
  });

  try {
    await transporter.sendMail({ from: cfg.email, to, subject, text });
  } catch (err) {
    const msg = (err as Error)?.message ?? "";
    const friendly = /auth|login|credential|5\.7|535/i.test(msg)
      ? "Versand abgelehnt – dein Postfach erlaubt evtl. keinen SMTP-Versand oder braucht ein App-Passwort."
      : `Versand fehlgeschlagen: ${msg.slice(0, 160)}`;
    return NextResponse.json({ ok: false, error: friendly }, { status: 502 });
  }

  return NextResponse.json({ ok: true, from: cfg.email });
}
