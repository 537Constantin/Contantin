/**
 * Aufgaben-Katalog für die KI-Mitarbeiter.
 *
 * Idee: Jeder Mitarbeiter hat eine Liste konkreter Aufgaben. Eine Aufgabe wird
 * einmal eingerichtet (Account verbinden + Felder ausfüllen) und kann danach
 * optional automatisiert ("läuft von selbst") werden.
 *
 * NEUE AUFGABE HINZUFÜGEN: Einfach ein weiteres Objekt in `tasks` ergänzen.
 * Pflicht sind `id` (eindeutig), `employeeId` (welcher Mitarbeiter), `title`,
 * `description` und `fields` (was beim Einrichten abgefragt wird). `account`
 * benennt den Dienst, der verbunden werden muss. `automatable` schaltet den
 * "Automatisieren"-Schalter frei.
 *
 * Der pro-Nutzer-Zustand (eingerichtet? automatisiert? eingegebene Werte) wird
 * über store-sync unter dem Kind "task" gespeichert (localStorage + DB).
 */

export type TaskFieldType = "text" | "email" | "password" | "number" | "textarea" | "select";

export interface TaskField {
  /** Eindeutig innerhalb der Aufgabe. */
  id: string;
  label: string;
  type: TaskFieldType;
  placeholder?: string;
  /** Nur bei type: "select". */
  options?: string[];
  required?: boolean;
  /** Kleiner Hilfetext unter dem Feld. */
  help?: string;
}

export interface EmployeeTask {
  id: string;
  /** Verweist auf employees[].id, z. B. "emp-aria". */
  employeeId: string;
  title: string;
  description: string;
  /** Dienst/Konto, das verbunden werden muss (z. B. "Gmail", "HubSpot"). */
  account?: string;
  /** Zeigt den "Automatisieren"-Schalter, wenn true. */
  automatable: boolean;
  /** Wird angezeigt, wenn die Aufgabe automatisiert läuft (z. B. "Täglich 7:00 Uhr"). */
  automationHint?: string;
  /** Felder, die beim Einrichten abgefragt werden. */
  fields: TaskField[];
}

/** Pro-Nutzer-Zustand einer Aufgabe (gespeichert unter dem "task"-Kind). */
export interface UserTask {
  id: string; // = task id
  /** Wurde die Aufgabe schon eingerichtet (auf einem Account)? */
  configured: boolean;
  /** Eingegebene Werte je Feld (fieldId -> Wert). */
  values: Record<string, string>;
  /** Soll die Aufgabe automatisch laufen? Nur sinnvoll wenn configured = true. */
  automated: boolean;
  updatedAt: string;
}

export const tasks: EmployeeTask[] = [
  // ── Aria · Sekretär ───────────────────────────────────────────────────────
  {
    id: "task-aria-inbox",
    employeeId: "emp-aria",
    title: "Posteingang sortieren",
    description:
      "Aria liest neue E-Mails, sortiert sie nach Wichtigkeit und markiert, was deine Aufmerksamkeit braucht.",
    account: "Gmail oder Outlook",
    automatable: true,
    automationHint: "Läuft alle 15 Minuten und sortiert neue Mails automatisch.",
    fields: [
      {
        id: "provider",
        label: "E-Mail-Anbieter",
        type: "select",
        options: ["Gmail", "Outlook", "IMAP (eigene Domain)"],
        required: true,
      },
      { id: "email", label: "E-Mail-Adresse", type: "email", placeholder: "name@firma.de", required: true },
      {
        id: "app_password",
        label: "App-Passwort",
        type: "password",
        placeholder: "Wird sicher gespeichert",
        help: "Bei Gmail/Outlook ein App-Passwort statt deines normalen Passworts erstellen.",
      },
    ],
  },
  {
    id: "task-aria-schedule",
    employeeId: "emp-aria",
    title: "Termine koordinieren",
    description:
      "Aria findet freie Slots in deinem Kalender, schlägt Termine vor und versendet Einladungen.",
    account: "Google Kalender oder Outlook",
    automatable: false,
    fields: [
      {
        id: "calendar",
        label: "Kalender",
        type: "select",
        options: ["Google Kalender", "Outlook Kalender"],
        required: true,
      },
      { id: "working_hours", label: "Arbeitszeiten", type: "text", placeholder: "z. B. Mo–Fr 9–18 Uhr" },
    ],
  },
  {
    id: "task-aria-briefing",
    employeeId: "emp-aria",
    title: "Tägliche Tagesübersicht",
    description:
      "Jeden Morgen eine kurze Übersicht: anstehende Termine, wichtige Mails und offene Aufgaben.",
    automatable: true,
    automationHint: "Wird täglich morgens automatisch erstellt und versendet.",
    fields: [
      { id: "deliver_to", label: "Senden an (E-Mail)", type: "email", placeholder: "name@firma.de", required: true },
      { id: "time", label: "Uhrzeit", type: "text", placeholder: "z. B. 07:30" },
    ],
  },

  // ── Marcus · Berater ──────────────────────────────────────────────────────
  {
    id: "task-marcus-report",
    employeeId: "emp-marcus",
    title: "Wöchentlicher Strategiereport",
    description:
      "Marcus fasst die Woche zusammen, erkennt Trends und gibt konkrete Handlungsempfehlungen.",
    automatable: true,
    automationHint: "Wird jeden Montagmorgen automatisch erstellt.",
    fields: [
      { id: "focus", label: "Schwerpunkt", type: "text", placeholder: "z. B. Umsatz, Marketing, Effizienz" },
      { id: "deliver_to", label: "Senden an (E-Mail)", type: "email", placeholder: "name@firma.de" },
    ],
  },
  {
    id: "task-marcus-kpi",
    employeeId: "emp-marcus",
    title: "KPI-Auswertung",
    description:
      "Marcus analysiert deine wichtigsten Kennzahlen und erklärt, was die Zahlen bedeuten.",
    automatable: false,
    fields: [
      { id: "metrics", label: "Welche Kennzahlen?", type: "textarea", placeholder: "z. B. Umsatz, Neukunden, Churn …" },
    ],
  },

  // ── Nova · Support ────────────────────────────────────────────────────────
  {
    id: "task-nova-tickets",
    employeeId: "emp-nova",
    title: "Support-Tickets beantworten",
    description:
      "Nova beantwortet eingehende Anfragen, löst einfache Fälle selbst und eskaliert den Rest mit Kontext.",
    account: "Helpdesk (Zendesk, Freshdesk …)",
    automatable: true,
    automationHint: "Bearbeitet neue Tickets automatisch, sobald sie eingehen.",
    fields: [
      {
        id: "helpdesk",
        label: "Helpdesk",
        type: "select",
        options: ["Zendesk", "Freshdesk", "Intercom", "E-Mail-Postfach"],
        required: true,
      },
      { id: "api_key", label: "API-Schlüssel / Zugang", type: "password", placeholder: "Wird sicher gespeichert" },
      { id: "tone", label: "Tonalität", type: "text", placeholder: "z. B. freundlich-professionell" },
    ],
  },
  {
    id: "task-nova-faq",
    employeeId: "emp-nova",
    title: "Wissensdatenbank pflegen",
    description:
      "Nova erkennt wiederkehrende Fragen und schlägt neue FAQ-Einträge vor.",
    automatable: false,
    fields: [
      { id: "source", label: "Quelle der Fragen", type: "text", placeholder: "z. B. Support-Postfach" },
    ],
  },

  // ── Leo · Vertrieb ────────────────────────────────────────────────────────
  {
    id: "task-leo-leads",
    employeeId: "emp-leo",
    title: "Neue Leads qualifizieren",
    description:
      "Leo bewertet eingehende Leads nach Potenzial und priorisiert die heißesten zuerst.",
    account: "CRM (HubSpot, Pipedrive …)",
    automatable: true,
    automationHint: "Bewertet neue Leads automatisch beim Eingang.",
    fields: [
      {
        id: "crm",
        label: "CRM",
        type: "select",
        options: ["HubSpot", "Pipedrive", "Salesforce", "Tabelle/CSV"],
        required: true,
      },
      { id: "api_key", label: "API-Schlüssel", type: "password", placeholder: "Wird sicher gespeichert" },
      { id: "criteria", label: "Qualifizierungs-Kriterien", type: "textarea", placeholder: "z. B. Branche, Firmengröße, Budget" },
    ],
  },
  {
    id: "task-leo-followup",
    employeeId: "emp-leo",
    title: "Follow-up-E-Mails versenden",
    description:
      "Leo schreibt personalisierte Follow-ups und sendet sie zum richtigen Zeitpunkt.",
    account: "E-Mail",
    automatable: true,
    automationHint: "Versendet Follow-ups automatisch nach deinem Zeitplan.",
    fields: [
      { id: "email", label: "Absender-Adresse", type: "email", placeholder: "vertrieb@firma.de", required: true },
      { id: "delay", label: "Wann nachfassen?", type: "text", placeholder: "z. B. 3 Tage nach Erstkontakt" },
    ],
  },

  // ── Iris · Analyst ────────────────────────────────────────────────────────
  {
    id: "task-iris-dashboard",
    employeeId: "emp-iris",
    title: "KPI-Dashboard aktualisieren",
    description:
      "Iris hält dein Kennzahlen-Dashboard aktuell und hebt Auffälligkeiten hervor.",
    account: "Datenquelle",
    automatable: true,
    automationHint: "Aktualisiert das Dashboard automatisch jede Nacht.",
    fields: [
      { id: "source", label: "Datenquelle", type: "text", placeholder: "z. B. Stripe, Datenbank, Tabelle" },
      { id: "metrics", label: "Kennzahlen", type: "textarea", placeholder: "z. B. MRR, Churn, Conversion" },
    ],
  },
  {
    id: "task-iris-anomaly",
    employeeId: "emp-iris",
    title: "Anomalie-Wächter",
    description:
      "Iris überwacht deine Zahlen und meldet sofort, wenn etwas ungewöhnlich aussieht.",
    automatable: true,
    automationHint: "Überwacht laufend und meldet Anomalien sofort.",
    fields: [
      { id: "metric", label: "Zu überwachende Kennzahl", type: "text", placeholder: "z. B. Tagesumsatz", required: true },
      { id: "alert_to", label: "Alarm an (E-Mail)", type: "email", placeholder: "name@firma.de" },
    ],
  },
];

export function tasksForEmployee(employeeId: string): EmployeeTask[] {
  return tasks.filter((t) => t.employeeId === employeeId);
}

export function getTask(id: string): EmployeeTask | undefined {
  return tasks.find((t) => t.id === id);
}
