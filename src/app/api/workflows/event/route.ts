/**
 * Event trigger webhook — fires a workflow "when something happens".
 *
 * An external service (e.g. an email-forwarding/automation tool, a form, Zapier)
 * POSTs here with the workflow id, its secret token, and the input payload
 * (e.g. the incoming email text). The matching workflow is executed on that
 * input and the result is stored in the owner's run history.
 *
 *   POST /api/workflows/event
 *   { "workflowId": "...", "token": "...", "input": "..." }
 *
 * This is the bridge that lets real events ("E-Mail kommt an") drive a workflow.
 * Connecting an actual mailbox to call this URL is the remaining setup step.
 */
import { NextRequest, NextResponse } from "next/server";
import { executeWorkflow } from "@/lib/workflow-engine";
import { getAllItems, appendItem } from "@/lib/server-store";
import { dbEnabled } from "@/lib/db";
import type { UserWorkflow, WorkflowRun } from "@/lib/workflows-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const rid = () => Math.random().toString(36).slice(2, 9);

export async function POST(req: NextRequest) {
  if (!dbEnabled) {
    return NextResponse.json({ error: "no database configured" }, { status: 503 });
  }

  let body: { workflowId?: string; token?: string; input?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!body.workflowId || !body.token) {
    return NextResponse.json({ error: "workflowId and token required" }, { status: 400 });
  }

  const workflows = await getAllItems<UserWorkflow>("workflow");
  const match = workflows.find(({ data }) => data?.id === body.workflowId);

  // Same generic error whether not found or wrong token, so the endpoint can't
  // be used to probe which workflow ids exist.
  if (!match || match.data.trigger?.token !== body.token) {
    return NextResponse.json({ error: "not found or invalid token" }, { status: 404 });
  }
  if (match.data.status !== "live") {
    return NextResponse.json({ error: "workflow is not active" }, { status: 409 });
  }

  try {
    const result = await executeWorkflow(match.data, body.input);
    const run: WorkflowRun = {
      id: rid(),
      workflowId: match.data.id,
      workflowName: match.data.name,
      status: "success",
      triggeredBy: "event",
      input: body.input?.slice(0, 2000),
      output: result.output,
      emailSent: result.emailSent,
      createdAt: new Date().toISOString(),
    };
    await appendItem(match.scope, "run", run);
    return NextResponse.json({ ok: true, output: result.output, emailSent: result.emailSent });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 502 });
  }
}
