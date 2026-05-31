/**
 * Workflow execution engine (server-side).
 *
 * Runs a workflow's steps through the AI and returns the produced result. This
 * is the real "the AI executes the workflow" logic, shared by:
 *   - manual runs            (POST /api/workflows/run)
 *   - the scheduler          (GET  /api/workflows/cron, Vercel Cron)
 *   - event webhooks         (POST /api/workflows/event)
 *
 * What it does today: the AI reads the workflow steps (+ any input, e.g. an
 * incoming email) and produces the output the steps describe — a summary, a
 * drafted reply, an analysis, a decision. Optionally the result is emailed via
 * Resend when RESEND_API_KEY is set; otherwise it is returned/stored only.
 *
 * What it intentionally does NOT do yet: take real-world actions on third-party
 * accounts (send from your mailbox, write to Google Calendar/CRM). Those need
 * per-service OAuth connections and are a separate, deliberate step.
 */
import { employees } from "@/lib/data/employees";
import type { UserWorkflow } from "@/lib/workflows-store";

interface RunResult {
  output: string;
  emailSent: boolean;
  mode: "live" | "demo";
}

function stepLabel(type: string): string {
  return type === "trigger" ? "Auslöser" : type === "ai" ? "KI-Schritt" : type === "condition" ? "Bedingung" : "Aktion";
}

/** Build the instruction the AI follows to execute the workflow. */
function buildPrompt(wf: UserWorkflow, input?: string): { system: string; user: string } {
  const emp = employees.find((e) => e.id === wf.employeeId);
  const persona = emp
    ? `Du bist ${emp.name}, ${emp.roleLabel}. ${emp.description}`
    : "Du bist ein KI-Mitarbeiter.";
  const steps = wf.steps
    .map((s, i) => `${i + 1}. [${stepLabel(s.type)}] ${s.label}${s.detail ? ` – ${s.detail}` : ""}`)
    .join("\n");

  const system = [
    persona,
    "Du führst einen automatisierten Workflow aus. Arbeite die Schritte der Reihe nach ab.",
    "Wenn ein Schritt eine Aktion beschreibt (z. B. eine E-Mail senden, eine Zusammenfassung erstellen), führe die inhaltliche Arbeit aus und liefere das fertige Ergebnis (z. B. den fertigen Text).",
    "Antworte strukturiert auf Deutsch. Erfinde keine Fakten, die du nicht hast.",
  ].join(" ");

  const user = [
    `Workflow: „${wf.name}"`,
    wf.description ? `Ziel: ${wf.description}` : "",
    ``,
    `Schritte:`,
    steps,
    input ? `\nEingang / Auslöser-Daten, auf denen du arbeiten sollst:\n"""\n${input.slice(0, 8000)}\n"""` : "",
    ``,
    `Führe den Workflow jetzt aus und gib das Endergebnis aus.`,
  ]
    .filter(Boolean)
    .join("\n");

  return { system, user };
}

/** Ask the model (OpenAI) to execute the workflow; demo fallback if no key. */
async function runAI(system: string, user: string): Promise<{ text: string; mode: "live" | "demo" }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Demo: produce a believable, clearly-labelled result without a model.
    const text = [
      "**Workflow ausgeführt (Demo-Modus).**",
      "",
      "Die einzelnen Schritte wurden der Reihe nach verarbeitet. Sobald ein `OPENAI_API_KEY` hinterlegt ist, erstellt die KI hier das echte Ergebnis (z. B. die fertige Zusammenfassung oder den Antwortentwurf).",
      "",
      user.includes("Eingang") ? "Hinweis: Es wurden Eingangsdaten erkannt und berücksichtigt." : "",
    ]
      .filter(Boolean)
      .join("\n");
    return { text, mode: "demo" };
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OpenAI ${res.status}: ${detail.slice(0, 200)}`);
  }
  const json = await res.json();
  const text = json.choices?.[0]?.message?.content?.trim() || "(kein Ergebnis)";
  return { text, mode: "live" };
}

/** Send the result by email via Resend, if configured. Returns true if sent. */
async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.WORKFLOW_FROM_EMAIL;
  if (!apiKey || !from || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from,
        to,
        subject,
        text: body,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Execute one workflow and (optionally) email the result. */
export async function executeWorkflow(wf: UserWorkflow, input?: string): Promise<RunResult> {
  const { system, user } = buildPrompt(wf, input);
  const { text, mode } = await runAI(system, user);

  let emailSent = false;
  const to = wf.trigger?.notifyEmail?.trim();
  if (to) {
    emailSent = await sendEmail(to, `Workflow „${wf.name}" – Ergebnis`, text);
  }

  return { output: text, emailSent, mode };
}
