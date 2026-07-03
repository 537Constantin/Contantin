import { NextRequest, NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { resolveScope, getImapConnection } from "@/lib/mailbox";
import type { InboxMessage } from "@/lib/inbox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const scope = await resolveScope();
  if (!scope) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const cfg = await getImapConnection(scope);
  if (!cfg) return NextResponse.json({ error: "not-connected" }, { status: 400 });

  const limit = Math.min(40, Math.max(5, Number(req.nextUrl.searchParams.get("limit")) || 20));

  const client = new ImapFlow({
    host: cfg.host, port: cfg.port, secure: cfg.secure,
    auth: cfg.accessToken ? { user: cfg.email, accessToken: cfg.accessToken } : { user: cfg.email, pass: cfg.pass! },
    logger: false, connectionTimeout: 15000, greetingTimeout: 15000,
  });

  try {
    await client.connect();
  } catch (err) {
    try { await client.close(); } catch { /* ignore */ }
    return NextResponse.json({ error: `Verbindung fehlgeschlagen: ${(err as Error)?.message?.slice(0, 140) ?? ""}` }, { status: 502 });
  }

  const messages: InboxMessage[] = [];
  const lock = await client.getMailboxLock("INBOX");
  try {
    const total = client.mailbox && typeof client.mailbox !== "boolean" ? client.mailbox.exists : 0;
    if (total > 0) {
      const start = Math.max(1, total - limit + 1);
      for await (const msg of client.fetch(`${start}:*`, { envelope: true, flags: true, uid: true })) {
        const env = msg.envelope;
        const from = env?.from?.[0];
        messages.push({
          uid: msg.uid,
          from: from?.name || from?.address || "Unbekannt",
          fromAddress: from?.address || "",
          subject: env?.subject || "(kein Betreff)",
          date: (env?.date instanceof Date ? env.date : new Date()).toISOString(),
          seen: msg.flags?.has("\\Seen") ?? false,
        });
      }
    }
  } finally {
    lock.release();
    try { await client.logout(); } catch { /* ignore */ }
  }

  messages.reverse(); // newest first
  return NextResponse.json({ messages });
}
