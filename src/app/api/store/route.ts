/**
 * Persistence for user-created objects (workflows, documents, graphs).
 *
 * - GET  /api/store?kind=workflow      -> { enabled, items }
 * - POST /api/store { kind, items }    -> replaces all items of that kind
 *
 * When no database is configured (or it is unreachable) every response reports
 * `enabled: false`, and the client transparently falls back to localStorage.
 * The client always sends the full list for a kind, so deletions propagate
 * without a separate endpoint.
 */
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db, dbEnabled } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Single shared scope for now. Per-user scoping can be added once auth is
// mandatory (map this to the authenticated user / workspace id).
const SCOPE = "default";
const ALLOWED = new Set(["workflow", "document", "graph"]);

interface Item {
  id: string;
  createdAt?: string;
  [key: string]: unknown;
}

export async function GET(req: NextRequest) {
  const kind = req.nextUrl.searchParams.get("kind") ?? "";
  if (!dbEnabled || !db) return NextResponse.json({ enabled: false, items: [] });
  if (!ALLOWED.has(kind)) return NextResponse.json({ enabled: true, items: [] });
  try {
    const rows = await db.storeItem.findMany({
      where: { scope: SCOPE, kind },
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
      db.storeItem.deleteMany({ where: { scope: SCOPE, kind } }),
      ...valid.map((it) =>
        db!.storeItem.create({
          data: {
            id: `${kind}:${it.id}`, // namespaced so ids never clash across kinds
            scope: SCOPE,
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
