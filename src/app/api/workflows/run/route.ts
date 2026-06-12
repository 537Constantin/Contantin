/**
 * Run a workflow on demand ("Jetzt ausführen" button).
 *
 * The client sends the workflow (and optional input text) and gets the produced
 * result back. The client also stores the run in its per-user history. This
 * keeps the endpoint simple and works in demo mode (no DB) too.
 */
import { NextRequest, NextResponse } from "next/server";
import { executeWorkflow } from "@/lib/workflow-engine";
import type { UserWorkflow } from "@/lib/workflows-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: { workflow?: UserWorkflow; input?: string; expertise?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const wf = body.workflow;
  if (!wf || !Array.isArray(wf.steps) || wf.steps.length === 0) {
    return NextResponse.json({ error: "bad workflow" }, { status: 400 });
  }

  const expertise = typeof body.expertise === "string" ? body.expertise.slice(0, 14000) : undefined;
  try {
    const result = await executeWorkflow(wf, body.input, expertise);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message ?? "execution failed" },
      { status: 502 },
    );
  }
}
