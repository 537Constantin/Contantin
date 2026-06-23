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
  | "analyst"
  | "accountant"
  | "hr"
  | "marketing"
  | "operations";

export type Personality = "professional" | "friendly" | "concise" | "empathetic" | "visionary";

/**
 * How autonomously an employee acts. `suggest` = nur Vorschläge,
 * `approve` = handelt selbst, holt Freigabe für Wichtiges,
 * `autonomous` = handelt ohne Rückfrage in seinem Verantwortungsbereich.
 */
export type Autonomy = "suggest" | "approve" | "autonomous";

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
  /** Wofür dieser Mitarbeiter eingestellt wurde – sein klarer Auftrag. */
  objective: string;
  /** Verantwortungsbereiche – wofür er zuständig ist. */
  responsibilities: string[];
  /** Was er ausdrücklich NICHT tut (Leitplanken). */
  guardrails: string[];
  /** Wann er von sich aus aktiv wird. */
  triggers: string[];
  /** Wie autonom er handelt. */
  autonomy: Autonomy;
  /** Wie er Updates signiert. */
  signature: string;
  /** Was er bereits erledigt hat / im Blick hat — wird im Chat-Empty-State und als Kontext im System-Prompt verwendet. */
  morningBriefing: string[];
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
}

/* ===========================================================================
 * Agent capability system
 * Each AI employee can do a set of *capabilities* — concrete, well-defined
 * jobs (e.g. "tägliche E-Mail-Zusammenfassung"). Each capability declares
 * which integrations and permissions it needs, how it is triggered, and what
 * the user has to configure during setup. A capability can only be activated
 * once all required integrations are connected.
 * =========================================================================== */

export type IntegrationCategory =
  | "communication"
  | "calendar"
  | "crm"
  | "accounting"
  | "telephony"
  | "voice"
  | "marketing"
  | "support"
  | "documents"
  | "banking"
  | "ai";

export type IntegrationAuth = "oauth" | "api_key" | "internal";

export interface Integration {
  id: string;
  name: string;
  provider: string;
  category: IntegrationCategory;
  description: string;
  /** First letter or short code shown when no real logo exists yet. */
  badge: string;
  color: string;
  auth: IntegrationAuth;
  /** ENV variable that powers the live mode for api_key integrations. */
  envVar?: string;
  docsUrl?: string;
  /** A short note that explains what this connection unlocks. */
  unlocks: string;
}

export type CapabilityCategory =
  | "communication"
  | "calendar"
  | "sales"
  | "support"
  | "marketing"
  | "accounting"
  | "hr"
  | "operations"
  | "strategy";

export type TriggerKind = "manual" | "schedule" | "event" | "webhook";

export type Permission =
  | "read_email"
  | "send_email"
  | "read_calendar"
  | "write_calendar"
  | "read_crm"
  | "write_crm"
  | "read_helpdesk"
  | "write_helpdesk"
  | "read_accounting"
  | "write_accounting"
  | "read_banking"
  | "make_calls"
  | "send_sms"
  | "post_social";

export interface SetupInput {
  key: string;
  label: string;
  type: "text" | "email" | "time" | "select" | "number" | "textarea";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
  defaultValue?: string;
}

export interface SetupStep {
  key: string;
  title: string;
  description?: string;
  inputs?: SetupInput[];
}

export interface Capability {
  id: string;
  name: string;
  description: string;
  category: CapabilityCategory;
  /** Default owner role — capabilities can be reassigned by the user. */
  ownerRole: EmployeeRole;
  /** Integration IDs that must be connected before this can be activated. */
  requiredIntegrations: string[];
  /** Permissions the agent will request when the user enables this. */
  permissions: Permission[];
  trigger: TriggerKind;
  /** When trigger = schedule, the default cadence (cron-like description). */
  schedule?: string;
  /** Concrete output the user will get when this runs. */
  output: string;
  /** Configuration the user fills out during setup. */
  setup: SetupStep[];
}

export interface CapabilityState {
  enabled: boolean;
  /** Free-form config captured during setup. */
  config: Record<string, string>;
  /** When the user last successfully ran this (mock for now). */
  lastRunAt?: string;
}

export interface AgentRuntimeState {
  /** Integration IDs the user has connected. */
  connectedIntegrations: string[];
  /** Per-capability activation + config. */
  capabilities: Record<string, CapabilityState>;
}
