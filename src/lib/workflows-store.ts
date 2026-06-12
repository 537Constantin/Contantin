/**
 * User-created workflows. Stored in localStorage (no DB yet) so they survive
 * reloads — same approach as the saved graphs in `graphs.ts`. A workflow is a
 * named chain of steps assigned to one AI employee. Once the persistence layer
 * (Prisma) and triggers (Vercel Cron / webhooks) are wired up, these can be
 * executed for real; for now this is the builder + storage layer.
 */
import type { WorkflowStep, WorkflowStatus } from "@/lib/types";

export type StepType = WorkflowStep["type"]; // "trigger" | "action" | "condition" | "ai"

export type TriggerType = "manual" | "schedule" | "event";
export type Schedule = "hourly" | "daily" | "weekly";

export interface WorkflowTrigger {
  type: TriggerType;
  /** When type === "schedule". */
  schedule?: Schedule;
  /** Optional: send the run result to this email address (needs RESEND_API_KEY). */
  notifyEmail?: string;
  /** Secret token for the event webhook (so only holders of the URL can fire it). */
  token?: string;
}

export interface UserWorkflow {
  id: string;
  name: string;
  description: string;
  /** The AI employee that runs this workflow. */
  employeeId: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  /** How/when this workflow runs. Older records may not have it (defaults to manual). */
  trigger?: WorkflowTrigger;
  /** Free-text instruction for user-created catalog buttons (drives execution). */
  instruction?: string;
  /** Catalog-display fields for user-created buttons. */
  category?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  deliverable?: string;
  createdAt: string;
  updatedAt: string;
}

/** One execution of a workflow, stored per-user under the "run" kind. */
export interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName: string;
  status: "success" | "error";
  triggeredBy: TriggerType;
  /** Optional input the workflow ran on (e.g. an incoming email body). */
  input?: string;
  /** The result the AI produced. */
  output: string;
  /** Whether the result came from the real model ("live") or the demo fallback. */
  mode?: "live" | "demo";
  /** Whether a result email was actually sent (vs. demo). */
  emailSent?: boolean;
  createdAt: string;
}

const KEY = "workforce-os:workflows";

/** Human-readable labels for the four step types. */
export const stepTypeLabel: Record<StepType, string> = {
  trigger: "Auslöser",
  ai: "KI-Schritt",
  action: "Aktion",
  condition: "Bedingung",
};

export const triggerLabel: Record<TriggerType, string> = {
  manual: "Manuell (Knopfdruck)",
  schedule: "Zeitplan",
  event: "Ereignis (Webhook)",
};

export const scheduleLabel: Record<Schedule, string> = {
  hourly: "Stündlich",
  daily: "Täglich (morgens)",
  weekly: "Wöchentlich (Montag)",
};

export const defaultTrigger = (): WorkflowTrigger => ({ type: "manual" });

export function loadUserWorkflows(): UserWorkflow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as UserWorkflow[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUserWorkflows(list: UserWorkflow[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable — ignore */
  }
}

/** Compact, prompt-friendly description an AI employee can act on. */
export function workflowToPrompt(wf: UserWorkflow): string {
  const lines = wf.steps.map((s, i) => `${i + 1}. [${stepTypeLabel[s.type]}] ${s.label}${s.detail ? ` – ${s.detail}` : ""}`);
  return [
    `Führe den folgenden Workflow Schritt für Schritt aus und erkläre bei jedem Schritt, was du tust:`,
    ``,
    `Workflow: „${wf.name}"`,
    wf.description ? `Ziel: ${wf.description}` : "",
    ``,
    `Schritte:`,
    ...lines,
  ]
    .filter(Boolean)
    .join("\n");
}
