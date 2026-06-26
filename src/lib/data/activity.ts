import type { ActivityEvent, Task } from "@/lib/types";

const mins = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export const activity: ActivityEvent[] = [
  {
    id: "act-1",
    kind: "meeting",
    employeeId: "emp-aria",
    title: "Kalender-Konflikt aufgelöst & Termin gebucht",
    detail: "Demo mit Sabine Berger auf Di 14:00 verschoben — Raum reserviert.",
    at: mins(4),
  },
  {
    id: "act-2",
    kind: "insight",
    employeeId: "emp-marcus",
    title: "Optimierungspotenzial erkannt",
    detail: "Onboarding-Funnel: 23 % Absprung in Schritt 3 — Vorschlag erstellt.",
    at: mins(18),
  },
  {
    id: "act-3",
    kind: "email",
    employeeId: "emp-nova",
    title: "12 Support-Tickets gelöst",
    detail: "Ø Antwortzeit 38 Sek. — 2 Fälle an Team eskaliert.",
    at: mins(31),
  },
  {
    id: "act-4",
    kind: "workflow",
    employeeId: "emp-leo",
    title: "Workflow „Lead Nurture“ ausgeführt",
    detail: "8 neue Leads qualifiziert, 3 Follow-ups versendet.",
    at: mins(52),
  },
  {
    id: "act-5",
    kind: "document",
    employeeId: "emp-iris",
    title: "Q1-Report zusammengefasst",
    detail: "42-seitiges PDF auf 6 Kernaussagen verdichtet.",
    at: mins(74),
  },
  {
    id: "act-6",
    kind: "meeting",
    employeeId: "emp-aria",
    title: "Meeting-Protokoll erstellt",
    detail: "Strategie-Sync — 5 Action Items zugewiesen.",
    at: mins(120),
  },
  {
    id: "act-7",
    kind: "task",
    employeeId: "emp-leo",
    title: "Angebot versandt",
    detail: "Angebot #2025-0488 an Nordwind GmbH — 14.500 €.",
    at: mins(166),
  },
];

export const tasks: Task[] = [
  { id: "t-1", title: "Vertrag Nordwind GmbH prüfen", employeeId: "emp-marcus", priority: "high", state: "in_progress", due: mins(-90) },
  { id: "t-2", title: "Rückruf an Dr. Lange", employeeId: "emp-aria", priority: "urgent", state: "todo", due: mins(-30) },
  { id: "t-3", title: "Onboarding-Funnel A/B-Test aufsetzen", employeeId: "emp-marcus", priority: "medium", state: "todo", due: mins(-1440) },
  { id: "t-4", title: "Wissensbasis: 6 Artikel aktualisieren", employeeId: "emp-nova", priority: "low", state: "review", due: mins(-2880) },
  { id: "t-5", title: "Pipeline-Review vorbereiten", employeeId: "emp-leo", priority: "high", state: "todo", due: mins(-600) },
  { id: "t-6", title: "Wochenreport Finanzen", employeeId: "emp-iris", priority: "medium", state: "in_progress", due: mins(-300) },
  { id: "t-7", title: "Kalender entrümpeln & Slots blocken", employeeId: "emp-aria", priority: "low", state: "done", due: mins(120) },
];

