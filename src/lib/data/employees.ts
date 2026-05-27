import type { AIEmployee, EmployeeRole, Personality } from "@/lib/types";

export const roleMeta: Record<
  EmployeeRole,
  { label: string; blurb: string; color: string; defaultSkills: string[]; defaultTools: string[] }
> = {
  secretary: {
    label: "KI-Sekretär",
    blurb: "Telefon, Termine, Postfach & Tagesorganisation",
    color: "#7c6dff",
    defaultSkills: ["Terminplanung", "Anrufannahme", "E-Mail-Triage", "Erinnerungen"],
    defaultTools: ["Kalender", "Telefonie", "E-Mail", "Aufgaben"],
  },
  consultant: {
    label: "KI-Unternehmensberater",
    blurb: "Analyse, Strategie & Optimierungsvorschläge",
    color: "#2dd4ef",
    defaultSkills: ["SWOT-Analyse", "Prozessoptimierung", "Reporting", "Benchmarking"],
    defaultTools: ["Analytics", "Dokumente", "Web-Recherche"],
  },
  support: {
    label: "KI-Kundensupport",
    blurb: "Tickets, Live-Chat & Wissensdatenbank",
    color: "#16b674",
    defaultSkills: ["Ticket-Bearbeitung", "FAQ", "Eskalation", "Tonalität"],
    defaultTools: ["Helpdesk", "Wissensbasis", "E-Mail", "Chat"],
  },
  sales: {
    label: "KI-Vertriebsmitarbeiter",
    blurb: "Leads qualifizieren, Follow-ups & Angebote",
    color: "#e0a106",
    defaultSkills: ["Lead-Scoring", "Outreach", "Follow-up", "Angebotserstellung"],
    defaultTools: ["CRM", "E-Mail", "Kalender"],
  },
  manager: {
    label: "KI-Manager",
    blurb: "Koordiniert Agenten, Prioritäten & Eskalationen",
    color: "#b96bff",
    defaultSkills: ["Priorisierung", "Delegation", "Statusberichte", "Eskalation"],
    defaultTools: ["Aufgaben", "Workflows", "Analytics"],
  },
  analyst: {
    label: "KI-Analyst",
    blurb: "KPIs, Datenanalyse & Forecasts",
    color: "#ef4658",
    defaultSkills: ["KPI-Tracking", "Forecasting", "Datenvisualisierung", "Anomalieerkennung"],
    defaultTools: ["Analytics", "Datenquellen", "Dokumente"],
  },
};

export const personalityMeta: Record<Personality, string> = {
  professional: "Professionell & präzise",
  friendly: "Freundlich & nahbar",
  concise: "Knapp & effizient",
  empathetic: "Empathisch & geduldig",
  visionary: "Visionär & strategisch",
};

export const employees: AIEmployee[] = [
  {
    id: "emp-aria",
    name: "Aria",
    role: "secretary",
    roleLabel: roleMeta.secretary.label,
    avatarColor: roleMeta.secretary.color,
    status: "active",
    personality: "friendly",
    description:
      "Aria nimmt Anrufe entgegen, koordiniert Termine über alle Kalender und hält dein Postfach auf Null. Sie spricht natürlich und eskaliert nur, wenn es nötig ist.",
    skills: ["Anrufannahme", "Terminplanung", "E-Mail-Triage", "Live-Transkription", "Erinnerungen"],
    tools: ["Kalender", "Telefonie", "E-Mail", "Aufgaben"],
    model: "gpt-4o",
    performance: 96,
    tasksCompleted: 1284,
    tasksOpen: 7,
    interactions: 412,
    hoursSaved: 86,
    createdAt: "2025-11-02T09:00:00.000Z",
  },
  {
    id: "emp-marcus",
    name: "Marcus",
    role: "consultant",
    roleLabel: roleMeta.consultant.label,
    avatarColor: roleMeta.consultant.color,
    status: "active",
    personality: "visionary",
    description:
      "Marcus durchleuchtet Prozesse, erkennt Engpässe und liefert umsetzbare Strategien mit Charts und Prognosen. Dein strategischer Sparringspartner rund um die Uhr.",
    skills: ["SWOT-Analyse", "Prozessoptimierung", "Reporting", "Forecasting", "Benchmarking"],
    tools: ["Analytics", "Dokumente", "Web-Recherche"],
    model: "claude-opus-4-7",
    performance: 92,
    tasksCompleted: 348,
    tasksOpen: 3,
    interactions: 96,
    hoursSaved: 140,
    createdAt: "2025-11-10T09:00:00.000Z",
  },
  {
    id: "emp-nova",
    name: "Nova",
    role: "support",
    roleLabel: roleMeta.support.label,
    avatarColor: roleMeta.support.color,
    status: "active",
    personality: "empathetic",
    description:
      "Nova beantwortet Kundenanfragen in Sekunden, löst 78 % der Tickets eigenständig und eskaliert komplexe Fälle mit vollständigem Kontext an dein Team.",
    skills: ["Ticket-Bearbeitung", "Live-Chat", "FAQ", "Eskalation", "Mehrsprachigkeit"],
    tools: ["Helpdesk", "Wissensbasis", "E-Mail", "Chat"],
    model: "gpt-4o-mini",
    performance: 89,
    tasksCompleted: 5021,
    tasksOpen: 24,
    interactions: 1830,
    hoursSaved: 320,
    createdAt: "2025-10-21T09:00:00.000Z",
  },
  {
    id: "emp-leo",
    name: "Leo",
    role: "sales",
    roleLabel: roleMeta.sales.label,
    avatarColor: roleMeta.sales.color,
    status: "idle",
    personality: "professional",
    description:
      "Leo qualifiziert eingehende Leads, schreibt personalisierte Follow-ups und erstellt Angebote. Er übergibt heiße Deals zum richtigen Zeitpunkt an den Vertrieb.",
    skills: ["Lead-Scoring", "Outreach", "Follow-up", "Angebotserstellung", "CRM-Pflege"],
    tools: ["CRM", "E-Mail", "Kalender"],
    model: "gpt-4o",
    performance: 84,
    tasksCompleted: 712,
    tasksOpen: 11,
    interactions: 248,
    hoursSaved: 64,
    createdAt: "2025-11-18T09:00:00.000Z",
  },
  {
    id: "emp-iris",
    name: "Iris",
    role: "analyst",
    roleLabel: roleMeta.analyst.label,
    avatarColor: roleMeta.analyst.color,
    status: "training",
    personality: "concise",
    description:
      "Iris überwacht deine KPIs in Echtzeit, erkennt Anomalien und erstellt automatisch Wochenreports. Aktuell lernt sie deine Finanzdatenquellen kennen.",
    skills: ["KPI-Tracking", "Forecasting", "Datenvisualisierung", "Anomalieerkennung"],
    tools: ["Analytics", "Datenquellen", "Dokumente"],
    model: "claude-sonnet-4-6",
    performance: 71,
    tasksCompleted: 96,
    tasksOpen: 2,
    interactions: 41,
    hoursSaved: 28,
    createdAt: "2026-01-08T09:00:00.000Z",
  },
];

export function getEmployee(id: string) {
  return employees.find((e) => e.id === id);
}

export function employeeName(id: string) {
  return employees.find((e) => e.id === id)?.name ?? "Unbekannt";
}
