import { NextRequest, NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { resolveScope, getMailboxWithPassword } from "@/lib/mailbox";
import type { FullMessage } from "@/lib/inbox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_TEXT = 12000;

export async function GET(req: NextRequest) {
  const scope = await resolveScope();
  if (!scope) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const uid = Number(req.nextUrl.searchParams.get("uid"));
  if (!uid) return NextResponse.json({ error: "Keine Nachricht angegeben." }, { status: 400 });

  const cfg = await getMailboxWithPassword(scope);
  if (!cfg) return NextResponse.json({ error: "not-connected" }, { status: 400 });

  const client = new ImapFlow({
    host: cfg.host, port: cfg.port, secure: cfg.secure,
    auth: { user: cfg.email, pass: cfg.password }, logger: false,
  });

  try {
    await client.connect();
  } catch (err) {
    try { await client.close(); } catch { /* ignore */ }
    return NextResponse.json({ error: `Verbindung fehlgeschlagen: ${(err as Error)?.message?.slice(0, 140) ?? ""}` }, { status: 502 });
  }

  const lock = await client.getMailboxLock("INBOX");
  try {
    const msg = await client.fetchOne(String(uid), { source: true, envelope: true, flags: true }, { uid: true });
    if (!msg || typeof msg === "boolean" || !msg.source) {
      return NextResponse.json({ error: "Nachricht nicht gefunden." }, { status: 404 });
    }
    // Mark as read.
    try { await client.messageFlagsAdd(String(uid), ["\\Seen"], { uid: true }); } catch { /* ignore */ }

    const parsed = await simpleParser(msg.source);
    const env = msg.envelope;
    const from = env?.from?.[0];
    const full: FullMessage = {
      uid,
      from: from?.name || from?.address || "Unbekannt",
      fromAddress: from?.address || "",
      subject: env?.subject || parsed.subject || "(kein Betreff)",
      date: (env?.date instanceof Date ? env.date : parsed.date ?? new Date()).toISOString(),
      seen: true,
      text: (parsed.text || "").trim().slice(0, MAX_TEXT),
    };
    return NextResponse.json({ message: full });
  } finally {
    lock.release();
    try { await client.logout(); } catch { /* ignore */ }
  }
}
