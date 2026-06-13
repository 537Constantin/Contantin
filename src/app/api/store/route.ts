/**
 * Persistence for user-created objects (workflows, documents, graphs).
 *
 * - GET  /api/store?kind=workflow      -> { enabled, items }
 * - POST /api/store { kind, items }    -> replaces all items of that kind
 *
 * Data is scoped per signed-in user (via Clerk), so every account only ever
 * sees its own workflows/documents/graphs. Without auth configured the app
 * uses a single shared scope (demo mode). When no database is configured (or it
 * is unreachable) every response reports `enabled: false`, and the client
 * transparently falls back to localStorage. The client always sends the full
 * list for a kind, so deletions propagate without a separate endpoint.
 */
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db, dbEnabled } from "@/lib/db";
import { clerkEnabled } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["workflow", "document", "graph", "call", "phone", "run", "specialization", "employee", "member"]);

interface Item {
  id: string;
  createdAt?: string;
  [key: string]: unknown;
}

/**
 * The storage bucket for the current request.
 * - auth on  -> "user:<id>" (each account isolated)
 * - auth off -> "default"  (demo mode, single shared bucket)
 * Returns null when auth is on but no user is present (defense in depth; the
 * middleware already blocks unauthenticated requests to this route).
 */
async function resolveScope(): Promise<string | null> {
  if (!clerkEnabled) return "default";
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId ? `user:${userId}` : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const kind = req.nextUrl.searchParams.get("kind") ?? "";
  if (!dbEnabled || !db) return NextResponse.json({ enabled: false, items: [] });
  if (!ALLOWED.has(kind)) return NextResponse.json({ enabled: true, items: [] });

  const scope = await resolveScope();
  if (!scope) return NextResponse.json({ enabled: true, items: [] });

  try {
    const rows = await db.storeItem.findMany({
      where: { scope, kind },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ enabled: true, items: rows.map((r) => r.data) });
  } catch {
    // DB unreachable -> tell the client to use its local copy.
    return NextResponse.json({ enabled: false, items: [] });
  }
}

export async function POST(req: NextRequest) {
  if (!dbEnabled || !db) return NextResponse.json({ enabled: false });

  const scope = await resolveScope();
  if (!scope) return NextResponse.json({ enabled: true, ok: false });

  let body: { kind?: string; items?: Item[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const kind = String(body.kind ?? "");
  const items = Array.isArray(body.items) ? body.items : null;
  if (!ALLOWED.has(kind) || !items) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const valid = items.filter((it) => it && typeof it.id === "string");
  try {
    await db.$transaction([
      db.storeItem.deleteMany({ where: { scope, kind } }),
      ...valid.map((it) =>
        db!.storeItem.create({
          data: {
            // Primary key includes the scope so two users can keep items with
            // the same (random) client id without colliding.
            id: `${scope}:${kind}:${it.id}`,
            scope,
            kind,
            data: it as unknown as Prisma.InputJsonValue,
            createdAt: it.createdAt ? new Date(it.createdAt) : new Date(),
          },
        }),
      ),
    ]);
    return NextResponse.json({ enabled: true, ok: true, count: valid.length });
  } catch {
    // Don't surface as an error: the client keeps its local copy regardless.
    return NextResponse.json({ enabled: true, ok: false });
  }
}
