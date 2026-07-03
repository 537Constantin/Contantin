/** Client-side inbox types + IMAP provider presets + analysis model. */

export interface MailProvider {
  id: string;
  label: string;
  host: string;
  port: number;
  secure: boolean;
  /** Short hint on how to get an app password. */
  hint: string;
}

export const MAIL_PROVIDERS: MailProvider[] = [
  { id: "gmail", label: "Gmail", host: "imap.gmail.com", port: 993, secure: true,
    hint: "Google-Konto → Sicherheit → App-Passwörter (2-Faktor muss aktiv sein)." },
  { id: "gmx", label: "GMX", host: "imap.gmx.net", port: 993, secure: true,
    hint: "GMX-Postfach → Einstellungen → POP3/IMAP aktivieren." },
  { id: "webde", label: "Web.de", host: "imap.web.de", port: 993, secure: true,
    hint: "Web.de-Postfach → Einstellungen → POP3/IMAP aktivieren." },
  { id: "outlook", label: "Outlook / Microsoft", host: "outlook.office365.com", port: 993, secure: true,
    hint: "Microsoft-Konto → Sicherheit → App-Passwörter." },
  { id: "custom", label: "Andere / eigene Domain", host: "", port: 993, secure: true,
    hint: "IMAP-Server, Port und Zugangsdaten von deinem Anbieter." },
];

export interface InboxMessage {
  uid: number;
  from: string;
  fromAddress: string;
  subject: string;
  date: string;
  seen: boolean;
}

export interface FullMessage extends InboxMessage {
  text: string;
}

// ── AI analysis (matches the requested JSON contract) ──────────────────────
export type Priority = "high" | "medium" | "low";

export interface AnalysisTask {
  task: string;
  deadline: string;
  person: string;
}
export interface AnalysisDate {
  date: string;
  time: string;
  description: string;
}
export interface EmailAnalysis {
  summary: string;
  priority: Priority;
  category: string;
  sentiment: string;
  language: string;
  tasks: AnalysisTask[];
  dates: AnalysisDate[];
  invoiceOrOffer: boolean;
  replySuggestions: {
    professional: string;
    friendly: string;
    short: string;
  };
}

export const PRIORITY_META: Record<Priority, { label: string; cls: string }> = {
  high: { label: "Hoch", cls: "bg-danger/12 text-danger ring-1 ring-danger/25" },
  medium: { label: "Mittel", cls: "bg-warning/14 text-warning ring-1 ring-warning/25" },
  low: { label: "Niedrig", cls: "bg-success/12 text-success ring-1 ring-success/25" },
};
