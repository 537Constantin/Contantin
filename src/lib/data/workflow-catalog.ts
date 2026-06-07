/**
 * Ready-to-run workflow catalog.
 *
 * Unlike the old free-text builder (where users could describe steps the app
 * can't actually perform), these are curated workflows that run end-to-end with
 * what the app can really do today: the AI works on the input you provide and
 * returns a finished, usable result (a draft, summary, analysis, …).
 *
 * Each workflow takes one piece of input from the user and produces a
 * deliverable. No external side effects (no real sending/posting) — the result
 * is yours to review and use.
 */
import {
  Reply, Inbox, ClipboardList, LifeBuoy, Send, FileSignature,
  Compass, BarChart3, Megaphone, Languages, type LucideIcon,
} from "lucide-react";
import type { WorkflowStep } from "@/lib/types";

export type WorkflowCategory =
  | "Kommunikation"
  | "Kundenservice"
  | "Vertrieb"
  | "Analyse & Strategie"
  | "Marketing";

export const catalogCategories: WorkflowCategory[] = [
  "Kommunikation",
  "Kundenservice",
  "Vertrieb",
  "Analyse & Strategie",
  "Marketing",
];

export interface CatalogWorkflow {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  /** The AI employee that runs this workflow. */
  employeeId: string;
  icon: LucideIcon;
  /** Label + example for the single input the user provides. */
  inputLabel: string;
  inputPlaceholder: string;
  /** Short description of what you get back. */
  deliverable: string;
  steps: WorkflowStep[];
}

const step = (id: string, type: WorkflowStep["type"], label: string, detail: string): WorkflowStep =>
  ({ id, type, label, detail });

export const workflowCatalog: CatalogWorkflow[] = [
  {
    id: "wf-email-reply",
    name: "Antwort auf E-Mail entwerfen",
    description: "Aus einer eingegangenen E-Mail einen höflichen, fertigen Antwort-Entwurf erstellen.",
    category: "Kommunikation",
    employeeId: "emp-aria",
    icon: Reply,
    inputLabel: "Eingegangene E-Mail",
    inputPlaceholder: "Füge hier die E-Mail ein, auf die geantwortet werden soll …",
    deliverable: "Fertiger Antwort-Entwurf",
    steps: [
      step("s1", "ai", "E-Mail verstehen", "Anliegen & Tonfall erfassen"),
      step("s2", "ai", "Kernpunkte beantworten", "Auf jede Frage eingehen"),
      step("s3", "ai", "Antwort formulieren", "Höflich, klar, passender Ton"),
      step("s4", "action", "Entwurf liefern", "Bereit zum Prüfen & Senden"),
    ],
  },
  {
    id: "wf-inbox-summary",
    name: "Posteingang zusammenfassen",
    description: "Mehrere E-Mails oder Nachrichten zu einer kompakten Übersicht mit Prioritäten und To-Dos bündeln.",
    category: "Kommunikation",
    employeeId: "emp-aria",
    icon: Inbox,
    inputLabel: "E-Mails / Nachrichten",
    inputPlaceholder: "Füge hier mehrere E-Mails oder Nachrichten ein …",
    deliverable: "Zusammenfassung + Prioritäten + To-Dos",
    steps: [
      step("s1", "ai", "Alles lesen", "Jede Nachricht erfassen"),
      step("s2", "ai", "Wichtiges herausziehen", "Kernpunkte je Nachricht"),
      step("s3", "ai", "Nach Priorität ordnen", "Was ist dringend?"),
      step("s4", "action", "Übersicht + To-Dos liefern", "Kompakt und sortiert"),
    ],
  },
  {
    id: "wf-meeting-notes",
    name: "Meeting-Notizen → Protokoll & Aufgaben",
    description: "Rohe Notizen oder ein Transkript in ein sauberes Protokoll mit klarer Aufgabenliste verwandeln.",
    category: "Kommunikation",
    employeeId: "emp-aria",
    icon: ClipboardList,
    inputLabel: "Notizen / Transkript",
    inputPlaceholder: "Füge hier deine rohen Meeting-Notizen oder das Transkript ein …",
    deliverable: "Protokoll + Aufgabenliste (wer / was / bis wann)",
    steps: [
      step("s1", "ai", "Notizen strukturieren", "Themen & Reihenfolge"),
      step("s2", "ai", "Entscheidungen festhalten", "Was wurde beschlossen?"),
      step("s3", "ai", "Aufgaben ableiten", "Wer macht was bis wann"),
      step("s4", "action", "Protokoll + To-Dos liefern", "Sauber formatiert"),
    ],
  },
  {
    id: "wf-text-simplify",
    name: "Text vereinfachen & übersetzen",
    description: "Einen Text klar und verständlich umformulieren – auf Wunsch zusätzlich auf Englisch.",
    category: "Kommunikation",
    employeeId: "emp-nova",
    icon: Languages,
    inputLabel: "Text",
    inputPlaceholder: "Füge hier den Text ein, der vereinfacht werden soll … (für Englisch einfach dazuschreiben)",
    deliverable: "Klare Version (+ optional Englisch)",
    steps: [
      step("s1", "ai", "Text verstehen", "Aussage & Zielgruppe"),
      step("s2", "ai", "Vereinfachen", "Kurz, klar, verständlich"),
      step("s3", "ai", "Optional übersetzen", "Auf Wunsch ins Englische"),
      step("s4", "action", "Ergebnis liefern", "Bereit zur Verwendung"),
    ],
  },
  {
    id: "wf-support-reply",
    name: "Kundenanfrage beantworten",
    description: "Eine Kundenanfrage freundlich und lösungsorientiert beantworten – inkl. Hinweis, ob ein Mensch übernehmen sollte.",
    category: "Kundenservice",
    employeeId: "emp-nova",
    icon: LifeBuoy,
    inputLabel: "Kundenanfrage",
    inputPlaceholder: "Füge hier die Frage oder das Anliegen des Kunden ein …",
    deliverable: "Fertige Support-Antwort (+ Eskalations-Hinweis)",
    steps: [
      step("s1", "ai", "Anliegen erfassen", "Worum geht es genau?"),
      step("s2", "ai", "Lösung formulieren", "Freundlich & konkret"),
      step("s3", "condition", "Braucht es einen Menschen?", "Komplex oder heikel?"),
      step("s4", "action", "Antwort + Hinweis liefern", "Bereit zum Senden"),
    ],
  },
  {
    id: "wf-lead-followup",
    name: "Verkaufs-Follow-up schreiben",
    description: "Aus Lead- oder Gesprächsinfos eine personalisierte Follow-up-E-Mail mit Betreff-Varianten erstellen.",
    category: "Vertrieb",
    employeeId: "emp-leo",
    icon: Send,
    inputLabel: "Lead- / Gesprächsinfos",
    inputPlaceholder: "Wer ist der Kontakt, worum ging es, was war der letzte Stand? …",
    deliverable: "Follow-up-E-Mail + 3 Betreffzeilen",
    steps: [
      step("s1", "ai", "Kontext verstehen", "Kontakt & Stand erfassen"),
      step("s2", "ai", "Aufhänger finden", "Passenden Anknüpfpunkt"),
      step("s3", "ai", "E-Mail + Betreffzeilen schreiben", "Persönlich & überzeugend"),
      step("s4", "action", "Entwurf liefern", "Bereit zum Prüfen & Senden"),
    ],
  },
  {
    id: "wf-offer-text",
    name: "Angebotstext erstellen",
    description: "Aus deinen Eckdaten einen überzeugenden, strukturierten Angebotstext formulieren.",
    category: "Vertrieb",
    employeeId: "emp-leo",
    icon: FileSignature,
    inputLabel: "Eckdaten zum Angebot",
    inputPlaceholder: "Leistung, Umfang, Preis, Kunde, Besonderheiten …",
    deliverable: "Fertiger Angebotstext",
    steps: [
      step("s1", "ai", "Eckdaten ordnen", "Leistung, Umfang, Preis"),
      step("s2", "ai", "Nutzen herausstellen", "Warum dieses Angebot?"),
      step("s3", "ai", "Angebot formulieren", "Klar strukturiert"),
      step("s4", "action", "Angebotstext liefern", "Bereit zur Verwendung"),
    ],
  },
  {
    id: "wf-swot",
    name: "SWOT- & Strategie-Analyse",
    description: "Zu einer Firma oder Situation eine SWOT-Analyse mit konkreten Handlungsempfehlungen erstellen.",
    category: "Analyse & Strategie",
    employeeId: "emp-marcus",
    icon: Compass,
    inputLabel: "Firma / Branche / Situation",
    inputPlaceholder: "Beschreibe Firma, Markt, aktuelle Lage und Ziele …",
    deliverable: "SWOT + 3 konkrete Empfehlungen",
    steps: [
      step("s1", "ai", "Lage analysieren", "Markt & Ausgangspunkt"),
      step("s2", "ai", "SWOT erstellen", "Stärken / Schwächen / Chancen / Risiken"),
      step("s3", "ai", "Empfehlungen ableiten", "Konkret & umsetzbar"),
      step("s4", "action", "Analyse liefern", "Auf einen Blick"),
    ],
  },
  {
    id: "wf-kpi-report",
    name: "Zahlen → verständlicher Report",
    description: "Rohe Kennzahlen in einen klaren Report mit Auffälligkeiten und nächsten Schritten verwandeln.",
    category: "Analyse & Strategie",
    employeeId: "emp-iris",
    icon: BarChart3,
    inputLabel: "Kennzahlen / Daten",
    inputPlaceholder: "Füge hier deine Zahlen ein (z. B. Umsatz, Besucher, Tickets …)",
    deliverable: "Report + Auffälligkeiten + nächste Schritte",
    steps: [
      step("s1", "ai", "Zahlen einordnen", "Was bedeuten die Werte?"),
      step("s2", "ai", "Auffälligkeiten erkennen", "Trends & Ausreißer"),
      step("s3", "ai", "Report schreiben", "Verständlich für alle"),
      step("s4", "action", "Report liefern", "Mit nächsten Schritten"),
    ],
  },
  {
    id: "wf-social-posts",
    name: "Social-Media-Posts erstellen",
    description: "Aus einem Thema mehrere fertige Post-Entwürfe inklusive Hashtags erzeugen.",
    category: "Marketing",
    employeeId: "emp-marcus",
    icon: Megaphone,
    inputLabel: "Thema / Produkt",
    inputPlaceholder: "Worüber soll gepostet werden? Plattform, Zielgruppe, Tonfall …",
    deliverable: "3–5 Post-Entwürfe + Hashtags",
    steps: [
      step("s1", "ai", "Thema erfassen", "Botschaft & Zielgruppe"),
      step("s2", "ai", "Ideen entwickeln", "Verschiedene Blickwinkel"),
      step("s3", "ai", "Posts + Hashtags schreiben", "Fertig zum Posten"),
      step("s4", "action", "Entwürfe liefern", "Mehrere zur Auswahl"),
    ],
  },
];

export function getCatalogWorkflow(id: string) {
  return workflowCatalog.find((w) => w.id === id);
}
