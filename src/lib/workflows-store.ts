/**
 * User-created workflows. Stored in localStorage (no DB yet) so they survive
 * reloads — same approach as the saved graphs in `graphs.ts`. A workflow is a
 * named chain of steps assigned to one AI employee. Once the persistence layer
 * (Prisma) and triggers (Vercel Cron / webhooks) are wired up, these can be
 * executed for real; for now this is the builder + storage layer.
 */
import type { WorkflowStep, WorkflowStatus } from "@/lib/types";

export type StepType = WorkflowStep["type"]; // "trigger" | "action" | "condition" | "ai"

export interface UserWorkflow {
  id: string;
  name: string;
  description: string;
  /** The AI employee that runs this workflow. */
  employeeId: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

const KEY = "workforce-os:workflows";

/** Human-readable labels for the four step types. */
export const stepTypeLabel: Record<StepType, string> = {
  trigger: "Auslöser",
  ai: "KI-Schritt",
  action: "Aktion",
  condition: "Bedingung",
};

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
