import type { Workflow } from "@/lib/types";

const days = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

export const workflows: Workflow[] = [
  {
    id: "wf-lead",
    name: "Lead Nurture",
    description: "Neue Leads automatisch qualifizieren, anreichern und mit personalisierten Follow-ups bespielen.",
    status: "live",
    runs: 1842,
    successRate: 97,
    updatedAt: days(1),
    steps: [
      { id: "s1", type: "trigger", label: "Neuer Lead im CRM", detail: "Webhook von Formular oder Import" },
      { id: "s2", type: "ai", label: "Lead bewerten", detail: "Leo scort Fit & Intent (0–100)" },
      { id: "s3", type: "condition", label: "Score ≥ 70?", detail: "Verzweigung nach Priorität" },
      { id: "s4", type: "action", label: "Follow-up senden", detail: "Personalisierte E-Mail-Sequenz" },
      { id: "s5", type: "action", label: "Slack-Notiz an Vertrieb", detail: "Bei heißen Leads sofort" },
    ],
  },
  {
    id: "wf-support",
    name: "Support Triage",
    description: "Eingehende Tickets klassifizieren, beantworten oder mit Kontext eskalieren.",
    status: "live",
    runs: 9210,
    successRate: 94,
    updatedAt: days(0),
    steps: [
      { id: "s1", type: "trigger", label: "Neues Ticket", detail: "E-Mail, Chat oder Webformular" },
      { id: "s2", type: "ai", label: "Intent & Sentiment", detail: "Nova kategorisiert das Anliegen" },
      { id: "s3", type: "condition", label: "Lösbar aus Wissensbasis?", detail: "Confidence-Schwelle 0.8" },
      { id: "s4", type: "action", label: "Antwort senden", detail: "Mit Quellenangabe" },
      { id: "s5", type: "action", label: "Eskalation", detail: "An menschliches Team mit Zusammenfassung" },
    ],
  },
  {
    id: "wf-invoice",
    name: "Dokumenten-Routing",
    description: "Hochgeladene Dokumente erkennen, kategorisieren, zusammenfassen und ablegen.",
    status: "paused",
    runs: 432,
    successRate: 99,
    updatedAt: days(3),
    steps: [
      { id: "s1", type: "trigger", label: "Datei hochgeladen", detail: "PDF / DOCX / Bild" },
      { id: "s2", type: "ai", label: "OCR & Klassifikation", detail: "Iris erkennt Dokumenttyp" },
      { id: "s3", type: "ai", label: "Zusammenfassung", detail: "Kernaussagen + Tags" },
      { id: "s4", type: "action", label: "Im richtigen Ordner ablegen", detail: "Automatische Kategorie" },
    ],
  },
  {
    id: "wf-report",
    name: "Wöchentlicher KPI-Report",
    description: "Jeden Montag KPIs aus allen Quellen sammeln, analysieren und als Report verschicken.",
    status: "live",
    runs: 28,
    successRate: 100,
    updatedAt: days(2),
    steps: [
      { id: "s1", type: "trigger", label: "Zeitplan: Mo 07:00", detail: "Cron" },
      { id: "s2", type: "action", label: "Datenquellen abfragen", detail: "Umsatz, Support, Pipeline" },
      { id: "s3", type: "ai", label: "Analyse & Anomalien", detail: "Iris erstellt Insights" },
      { id: "s4", type: "action", label: "Report versenden", detail: "PDF an Leitung + Dashboard" },
    ],
  },
  {
    id: "wf-onboard",
    name: "Kunden-Onboarding",
    description: "Neue Kunden willkommen heißen, Setup-Aufgaben anlegen und Check-ins planen.",
    status: "draft",
    runs: 0,
    successRate: 0,
    updatedAt: days(5),
    steps: [
      { id: "s1", type: "trigger", label: "Deal gewonnen", detail: "CRM-Status = Closed Won" },
      { id: "s2", type: "action", label: "Willkommens-Sequenz", detail: "E-Mail + Ressourcen" },
      { id: "s3", type: "action", label: "Onboarding-Aufgaben", detail: "Iris & Aria koordinieren" },
    ],
  },
];

export function getWorkflow(id: string) {
  return workflows.find((w) => w.id === id);
}
