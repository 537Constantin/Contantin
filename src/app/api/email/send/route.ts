import { NextRequest, NextResponse } from "next/server";

/**
 * Sends a real email via Resend.
 *
 * POST /api/email/send  { to, subject, text, replyTo? }
 *   -> { ok: true, id } on success
 *   -> { ok: false, error } on failure
 *   -> { ok: false, demo: true, ... } when no RESEND_API_KEY is configured
 *
 * The "from" address defaults to Resend's shared onboarding domain, which only
 * delivers to the address that owns the Resend account. Set RESEND_FROM to a
 * verified domain address to send to anyone.
 */
export const runtime = "nodejs";
export const maxDuration = 30;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { to?: string; subject?: string; text?: string; replyTo?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ungültiger Request" }, { status: 400 });
  }

  const to = (body.to ?? "").trim();
  const subject = (body.subject ?? "").trim();
  const text = (body.text ?? "").trim();
  const replyTo = (body.replyTo ?? "").trim();

  if (!EMAIL_RE.test(to)) {
    return NextResponse.json({ ok: false, error: "Bitte eine gültige Empfänger-Adresse angeben." }, { status: 400 });
  }
  if (!subject || !text) {
    return NextResponse.json({ ok: false, error: "Betreff und Text dürfen nicht leer sein." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      demo: true,
      error:
        "Demo-Modus: Kein RESEND_API_KEY gesetzt. In Vercel hinterlegen, dann wird die E-Mail wirklich verschickt.",
    });
  }

  const from = process.env.RESEND_FROM?.trim() || "SmartStaff <onboarding@resend.dev>";

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
        // Simple HTML version so the mail renders nicely in clients.
        html: `<div style="font-family:-apple-system,Segoe UI,system-ui,sans-serif;font-size:15px;line-height:1.6;color:#111;white-space:pre-wrap">${escapeHtml(
          text,
        )}</div>`,
        ...(replyTo && EMAIL_RE.test(replyTo) ? { reply_to: replyTo } : {}),
      }),
      signal: ctrl.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    const aborted = (err as Error)?.name === "AbortError";
    return NextResponse.json(
      { ok: false, error: aborted ? "Zeitüberschreitung beim Versand." : "Verbindung zu Resend fehlgeschlagen." },
      { status: 502 },
    );
  }
  clearTimeout(timer);

  const json = (await res.json().catch(() => null)) as { id?: string; message?: string } | null;

  if (!res.ok) {
    // Resend's most common first-time error: sending to a non-owner address
    // without a verified domain. Surface a clear, actionable message.
    const msg = json?.message || `Fehler ${res.status}`;
    return NextResponse.json({ ok: false, error: msg }, { status: res.status });
  }

  return NextResponse.json({ ok: true, id: json?.id ?? null });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
