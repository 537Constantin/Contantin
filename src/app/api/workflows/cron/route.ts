/**
 * Scheduled workflow runner — invoked by Vercel Cron (see vercel.json).
 *
 * Finds every active workflow whose trigger is a schedule matching the current
 * cadence, executes it, and stores the result in that user's run history.
 * Requires a database (to find workflows across users) and, for real AI output,
 * an OPENAI_API_KEY. Without them it safely does nothing / writes demo results.
 *
 * Protected by CRON_SECRET: Vercel Cron sends it as a Bearer token.
 */
import { NextRequest, NextResponse } from "next/server";
import { executeWorkflow } from "@/lib/workflow-engine";
import { getAllItems, appendItem } from "@/lib/server-store";
import { dbEnabled } from "@/lib/db";
import type { UserWorkflow, WorkflowRun, Schedule } from "@/lib/workflows-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const rid = () => Math.random().toString(36).slice(2, 9);

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // not configured -> allow (e.g. local testing)
  const header = req.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!dbEnabled) return NextResponse.json({ ok: true, ran: 0, note: "no database configured" });

  // ?cadence=hourly|daily|weekly (Vercel Cron entries pass this); default daily.
  const cadence = (req.nextUrl.searchParams.get("cadence") as Schedule) || "daily";

  const workflows = await getAllItems<UserWorkflow>("workflow");
  const due = workflows.filter(
    ({ data }) =>
      data?.status === "live" &&
      data?.trigger?.type === "schedule" &&
      (data.trigger.schedule ?? "daily") === cadence,
  );

  let ran = 0;
  for (const { scope, data: wf } of due) {
    try {
      const result = await executeWorkflow(wf);
      const run: WorkflowRun = {
        id: rid(),
        workflowId: wf.id,
        workflowName: wf.name,
        status: "success",
        triggeredBy: "schedule",
        output: result.output,
        emailSent: result.emailSent,
        createdAt: new Date().toISOString(),
      };
      await appendItem(scope, "run", run);
      ran += 1;
    } catch {
      const run: WorkflowRun = {
        id: rid(),
        workflowId: wf.id,
        workflowName: wf.name,
        status: "error",
        triggeredBy: "schedule",
        output: "Ausführung fehlgeschlagen.",
        createdAt: new Date().toISOString(),
      };
      await appendItem(scope, "run", run);
    }
  }

  return NextResponse.json({ ok: true, cadence, matched: due.length, ran });
}
