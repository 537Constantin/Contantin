import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { Prisma } from "@prisma/client";
import { db, dbEnabled } from "@/lib/db";
import type { CalendarEvent } from "@/lib/calendar";

/**
 * Reminder cron: finds timed events starting within the next LEAD_MIN minutes
 * and sends a web-push reminder to that user's devices. Deduped via "push_sent"
 * rows. Timezone-correct: each device stores its IANA tz on subscription.
 *
 * Secured by CRON_SECRET (Authorization: Bearer <secret> OR ?secret=<secret>).
 * Trigger it every few minutes from an external cron (e.g. cron-job.org),
 * because Vercel's free plan only allows a daily cron. Free of charge.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const LEAD_MIN = 15;

interface Sub {
  id: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  tz: string;
}

function authed(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  if (req.headers.get("authorization") === `Bearer ${secret}`) return true;
  if (req.nextUrl.searchParams.get("secret") === secret) return true;
  return false;
}

/** Offset (ms) of a timezone at a given UTC instant. */
function tzOffsetMs(utcMs: number, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const m: Record<string, string> = {};
  for (const p of dtf.formatToParts(new Date(utcMs))) m[p.type] = p.value;
  const asUTC = Date.UTC(+m.year, +m.month - 1, +m.day, +m.hour, +m.minute, +m.second);
  return asUTC - utcMs;
}

/** UTC ms for a wall-clock date+time in a given timezone. */
function zonedToUtcMs(dateISO: string, time: string, timeZone: string): number {
  const [y, mo, d] = dateISO.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, (mo || 1) - 1, d || 1, hh || 0, mm || 0);
  return guess - tzOffsetMs(guess, timeZone);
}

async function run(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!dbEnabled || !db) return NextResponse.json({ ok: false, reason: "no-db" });
  if (!pub || !priv) return NextResponse.json({ ok: false, reason: "no-vapid" });

  webpush.setVapidDetails("mailto:notifications@smartstaff.app", pub, priv);

  const now = Date.now();
  const windowEnd = now + LEAD_MIN * 60 * 1000;

  const [subRows, eventRows, sentRows] = await Promise.all([
    db.storeItem.findMany({ where: { kind: "push" } }),
    db.storeItem.findMany({ where: { kind: "event" } }),
    db.storeItem.findMany({ where: { kind: "push_sent" } }),
  ]);

  const subsByScope = new Map<string, Sub[]>();
  for (const r of subRows) {
    const list = subsByScope.get(r.scope) ?? [];
    list.push(r.data as unknown as Sub);
    subsByScope.set(r.scope, list);
  }
  const eventsByScope = new Map<string, CalendarEvent[]>();
  for (const r of eventRows) {
    const list = eventsByScope.get(r.scope) ?? [];
    list.push(r.data as unknown as CalendarEvent);
    eventsByScope.set(r.scope, list);
  }
  const alreadySent = new Set(sentRows.map((r) => r.id));

  let sent = 0;
  for (const [scope, subs] of subsByScope) {
    if (!subs.length) continue;
    const tz = subs[0]?.tz || "Europe/Berlin";
    const events = eventsByScope.get(scope) ?? [];

    for (const ev of events) {
      if (ev.allDay || !ev.start || !ev.date) continue;
      const startMs = zonedToUtcMs(ev.date, ev.start, tz);
      if (startMs < now || startMs > windowEnd) continue;

      const sentId = `${scope}:push_sent:${ev.id}`;
      if (alreadySent.has(sentId)) continue;

      const minsTo = Math.max(0, Math.round((startMs - now) / 60000));
      const payload = JSON.stringify({
        title: ev.title,
        body: `Beginnt ${minsTo <= 1 ? "gleich" : `in ${minsTo} Min`} · ${ev.start}${ev.location ? ` · ${ev.location}` : ""}`,
        url: "/calendar",
        tag: ev.id,
      });

      for (const sub of subs) {
        try {
          await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload);
        } catch (err) {
          const code = (err as { statusCode?: number })?.statusCode;
          if (code === 404 || code === 410) {
            await db.storeItem
              .deleteMany({ where: { scope, kind: "push", id: `${scope}:push:${sub.id}` } })
              .catch(() => {});
          }
        }
      }

      await db.storeItem
        .create({
          data: {
            id: sentId,
            scope,
            kind: "push_sent",
            data: { eventId: ev.id, at: new Date().toISOString() } as unknown as Prisma.InputJsonValue,
            createdAt: new Date(),
          },
        })
        .catch(() => {});
      sent++;
    }
  }

  // Housekeeping: drop dedupe markers older than 2 days.
  await db.storeItem
    .deleteMany({ where: { kind: "push_sent", createdAt: { lt: new Date(now - 2 * 24 * 3600 * 1000) } } })
    .catch(() => {});

  return NextResponse.json({ ok: true, sent });
}

export async function GET(req: NextRequest) {
  return run(req);
}
export async function POST(req: NextRequest) {
  return run(req);
}
