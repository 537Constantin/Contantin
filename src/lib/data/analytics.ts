import type { Insight, TeamMember } from "@/lib/types";

export interface Kpi {
  id: string;
  label: string;
  value: string;
  delta: number;
  spark: number[];
  tone: "accent" | "cyan" | "success" | "warning";
}

export const kpis: Kpi[] = [
  { id: "k1", label: "Erledigte Aufgaben", value: "7.461", delta: 12.4, tone: "accent", spark: [12, 18, 15, 22, 28, 26, 34, 31, 40] },
  { id: "k2", label: "Eingesparte Stunden", value: "638 h", delta: 9.1, tone: "cyan", spark: [40, 44, 52, 49, 58, 63, 61, 70, 78] },
  { id: "k3", label: "Automatisierungsrate", value: "81 %", delta: 4.2, tone: "success", spark: [62, 64, 66, 68, 70, 73, 76, 79, 81] },
  { id: "k4", label: "Ø Antwortzeit", value: "38 Sek.", delta: -22.0, tone: "warning", spark: [120, 96, 88, 74, 65, 58, 49, 42, 38] },
];

/** Tasks handled per day across the team — for the main dashboard chart. */
export const throughput: { label: string; calls: number; tasks: number; tickets: number }[] = [
  { label: "Mo", calls: 38, tasks: 142, tickets: 96 },
  { label: "Di", calls: 52, tasks: 168, tickets: 124 },
  { label: "Mi", calls: 44, tasks: 151, tickets: 110 },
  { label: "Do", calls: 61, tasks: 189, tickets: 142 },
  { label: "Fr", calls: 58, tasks: 174, tickets: 131 },
  { label: "Sa", calls: 22, tasks: 88, tickets: 47 },
  { label: "So", calls: 14, tasks: 61, tickets: 33 },
];

/** Revenue influenced by the AI workforce, in EUR thousands. */
export const revenueSeries: { label: string; value: number }[] = [
  { label: "Jan", value: 182 },
  { label: "Feb", value: 201 },
  { label: "Mär", value: 224 },
  { label: "Apr", value: 248 },
  { label: "Mai", value: 287 },
  { label: "Jun", value: 312 },
];

export const workloadSplit: { label: string; value: number; color: string }[] = [
  { label: "Support", value: 38, color: "var(--color-success)" },
  { label: "Termine & Telefon", value: 24, color: "var(--color-accent)" },
  { label: "Vertrieb", value: 18, color: "var(--color-warning)" },
  { label: "Dokumente", value: 12, color: "var(--color-cyan)" },
  { label: "Analyse", value: 8, color: "var(--color-violet)" },
];

export const insights: Insight[] = [
  {
    id: "in-1",
    title: "Onboarding-Funnel verliert 23 % in Schritt 3",
    category: "growth",
    impact: "high",
    summary: "Im Aktivierungs-Funnel brechen Nutzer überproportional bei der Datenquellen-Verbindung ab.",
    recommendation: "Optionalen „Später verbinden“-Pfad einführen und mit geführtem Setup-Assistenten kombinieren. Erwartete Aktivierung: +9 PP.",
  },
  {
    id: "in-2",
    title: "Cloud-Kosten wachsen schneller als Umsatz",
    category: "cost",
    impact: "medium",
    summary: "Infrastrukturkosten stiegen +31 % QoQ, Umsatz +18 %. Treiber: ungenutzte Staging-Umgebungen.",
    recommendation: "Auto-Scaling-Policy für Staging einführen und Nacht-Shutdown automatisieren. Einsparpotenzial: ~4.200 €/Monat.",
  },
  {
    id: "in-3",
    title: "Support-Spitzen Montagvormittag",
    category: "efficiency",
    impact: "medium",
    summary: "61 % mehr Tickets Mo 8–11 Uhr. Antwortzeiten steigen kurzzeitig auf 90 Sek.",
    recommendation: "Nova für dieses Fenster auf erhöhte Parallelität skalieren und 3 Wissensartikel ergänzen.",
  },
  {
    id: "in-4",
    title: "Vertragsklausel mit erhöhtem Risiko",
    category: "risk",
    impact: "high",
    summary: "Im Rahmenvertrag Nordwind weicht die Haftungsklausel §7 deutlich vom Standard ab.",
    recommendation: "Vor Unterzeichnung durch Rechtsabteilung prüfen lassen. Marcus hat Vergleich mit 4 Referenzverträgen angehängt.",
  },
];

export const team: TeamMember[] = [
  { id: "u-1", name: "Constantin Weber", email: "constantin@workforce-os.app", role: "owner", avatarColor: "#7c6dff", lastActive: "now" },
  { id: "u-2", name: "Lena Hoffmann", email: "lena@workforce-os.app", role: "admin", avatarColor: "#2dd4ef", lastActive: "vor 2 Std." },
  { id: "u-3", name: "Jonas Kraus", email: "jonas@workforce-os.app", role: "member", avatarColor: "#16b674", lastActive: "vor 1 Tag" },
  { id: "u-4", name: "Mara Schulz", email: "mara@workforce-os.app", role: "member", avatarColor: "#e0a106", lastActive: "vor 3 Tagen" },
  { id: "u-5", name: "Extern: Steuerberatung", email: "kanzlei@partner.de", role: "viewer", avatarColor: "#b96bff", lastActive: "vor 1 Woche" },
];
