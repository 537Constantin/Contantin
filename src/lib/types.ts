/**
 * Domain types for AI Workforce OS.
 * Mirrors the Prisma schema in prisma/schema.prisma so the UI layer and the
 * (future) persistence layer share a single mental model.
 */

export type EmployeeStatus = "active" | "idle" | "training" | "offline";

export type EmployeeRole =
  | "secretary"
  | "consultant"
  | "support"
  | "sales"
  | "manager"
  | "analyst";

export type Personality = "professional" | "friendly" | "concise" | "empathetic" | "visionary";

export interface AIEmployee {
  id: string;
  name: string;
  role: EmployeeRole;
  roleLabel: string;
  avatarColor: string;
  status: EmployeeStatus;
  personality: Personality;
  description: string;
  skills: string[];
  tools: string[];
  model: string;
  /** 0–100 health/efficiency score */
  performance: number;
  tasksCompleted: number;
  tasksOpen: number;
  /** Conversations / interactions handled this period */
  interactions: number;
  /** Hours of human work saved this period */
  hoursSaved: number;
  createdAt: string;
}

export type ActivityKind =
  | "call"
  | "email"
  | "meeting"
  | "document"
  | "task"
  | "workflow"
  | "insight";

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  employeeId: string;
  title: string;
  detail: string;
  at: string;
}

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskState = "todo" | "in_progress" | "review" | "done";

export interface Task {
  id: string;
  title: string;
  employeeId: string;
  priority: TaskPriority;
  state: TaskState;
  due: string;
}

export type WorkflowStatus = "live" | "paused" | "draft";

export interface WorkflowStep {
  id: string;
  type: "trigger" | "action" | "condition" | "ai";
  label: string;
  detail: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  runs: number;
  successRate: number;
  steps: WorkflowStep[];
  updatedAt: string;
}

export type DocStatus = "processed" | "processing" | "needs_review";

export interface DocumentItem {
  id: string;
  name: string;
  type: "pdf" | "docx" | "xlsx" | "image" | "audio";
  category: string;
  sizeKb: number;
  status: DocStatus;
  summary: string;
  tags: string[];
  owner: string;
  uploadedAt: string;
}

export interface CallRecord {
  id: string;
  caller: string;
  employeeId: string;
  durationSec: number;
  outcome: "resolved" | "scheduled" | "forwarded" | "voicemail";
  sentiment: "positive" | "neutral" | "negative";
  summary: string;
  at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
  avatarColor: string;
  lastActive: string;
}

export interface Insight {
  id: string;
  title: string;
  category: "growth" | "efficiency" | "risk" | "cost";
  impact: "high" | "medium" | "low";
  summary: string;
  recommendation: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Optional file attached to a user message. `text` is the readable content
   * (null for binary files that are attached only as a reference). */
  attachment?: { name: string; sizeKb: number; text: string | null };
}
