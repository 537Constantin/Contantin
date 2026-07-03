import { NextResponse } from "next/server";
import { resolveScope, deleteMailbox } from "@/lib/mailbox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const scope = await resolveScope();
  if (!scope) return NextResponse.json({ ok: false }, { status: 401 });
  await deleteMailbox(scope);
  return NextResponse.json({ ok: true });
}
