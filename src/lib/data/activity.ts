import type { ActivityEvent, CallRecord, Task } from "@/lib/types";

const mins = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export const activity: ActivityEvent[] = [
  {
    id: "act-1",
    kind: "call",
    employeeId: "emp-aria",
    title: "Anruf angenommen & Termin gebucht",
    detail: "Frau Berger, Bestandskundin — Demo für Di 14:00 eingetragen.",
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

export const calls: CallRecord[] = [
  {
    id: "call-1",
    caller: "Sabine Berger",
    employeeId: "emp-aria",
    durationSec: 184,
    outcome: "scheduled",
    sentiment: "positive",
    summary: "Interesse an Enterprise-Plan. Demo für Dienstag 14:00 gebucht, Unterlagen per Mail zugesagt.",
    at: mins(4),
  },
  {
    id: "call-2",
    caller: "Unbekannt (+49 30 …)",
    employeeId: "emp-aria",
    durationSec: 42,
    outcome: "voicemail",
    sentiment: "neutral",
    summary: "Kurze Anfrage zu Öffnungszeiten — automatisch beantwortet, kein Rückruf nötig.",
    at: mins(46),
  },
  {
    id: "call-3",
    caller: "Dr. Markus Lange",
    employeeId: "emp-aria",
    durationSec: 311,
    outcome: "forwarded",
    sentiment: "neutral",
    summary: "Technische Detailfrage zur API. An das Engineering-Team weitergeleitet, Kontext angehängt.",
    at: mins(130),
  },
  {
    id: "call-4",
    caller: "Nordwind GmbH",
    employeeId: "emp-aria",
    durationSec: 268,
    outcome: "resolved",
    sentiment: "positive",
    summary: "Rückfrage zum Angebot geklärt, Zahlungsziel bestätigt. Kunde zufrieden.",
    at: mins(280),
  },
];
