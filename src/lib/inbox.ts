/** Client-side inbox types + IMAP provider presets + analysis model. */

export interface MailProvider {
  id: string;
  label: string;
  host: string;
  port: number;
  secure: boolean;
  /** Label for the password field (normal password vs. app password). */
  passwordLabel: string;
  /** Step-by-step guide shown when this provider is selected. */
  steps: string[];
}

export const MAIL_PROVIDERS: MailProvider[] = [
  {
    id: "gmx", label: "GMX", host: "imap.gmx.net", port: 993, secure: true,
    passwordLabel: "GMX-Passwort",
    steps: [
      "Melde dich bei gmx.net im Browser an.",
      "Öffne Einstellungen → „POP3/IMAP Abruf“.",
      "Aktiviere „POP3 und IMAP Zugriff erlauben“ und speichere.",
      "Unten deine GMX-Adresse und dein normales GMX-Passwort eintragen – fertig.",
    ],
  },
  {
    id: "webde", label: "Web.de", host: "imap.web.de", port: 993, secure: true,
    passwordLabel: "Web.de-Passwort",
    steps: [
      "Melde dich bei web.de im Browser an.",
      "Öffne Einstellungen → „POP3/IMAP Abruf“.",
      "Aktiviere den IMAP-Zugriff und speichere.",
      "Unten deine Web.de-Adresse und dein normales Passwort eintragen.",
    ],
  },
  {
    id: "ionos", label: "IONOS", host: "imap.ionos.de", port: 993, secure: true,
    passwordLabel: "E-Mail-Passwort",
    steps: [
      "IMAP ist bei IONOS-Postfächern standardmäßig aktiv – nichts umzustellen.",
      "Unten deine E-Mail-Adresse und das Passwort deines IONOS-Postfachs eintragen.",
    ],
  },
  {
    id: "gmail", label: "Gmail", host: "imap.gmail.com", port: 993, secure: true,
    passwordLabel: "App-Passwort",
    steps: [
      "Aktiviere die Bestätigung in zwei Schritten in deinem Google-Konto.",
      "Öffne myaccount.google.com/apppasswords.",
      "Erstelle ein App-Passwort (Name: SmartStaff) und kopiere die 16 Zeichen.",
      "Unten deine Gmail-Adresse und das App-Passwort (ohne Leerzeichen) eintragen.",
    ],
  },
  {
    id: "outlook", label: "Outlook", host: "outlook.office365.com", port: 993, secure: true,
    passwordLabel: "App-Passwort",
    steps: [
      "Aktiviere die zweistufige Überprüfung in deinem Microsoft-Konto.",
      "Erstelle unter account.microsoft.com/security ein App-Passwort.",
      "Unten deine Outlook-/Hotmail-Adresse und das App-Passwort eintragen.",
    ],
  },
  {
    id: "custom", label: "Andere / eigene Domain", host: "", port: 993, secure: true,
    passwordLabel: "Passwort",
    steps: [
      "IMAP-Server & Port deines Anbieters eintragen (oft imap.deinanbieter.de, Port 993).",
      "Deine E-Mail-Adresse und das Postfach-Passwort eintragen.",
      "Falls dein Anbieter 2-Faktor nutzt, brauchst du evtl. ein App-Passwort.",
    ],
  },
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
