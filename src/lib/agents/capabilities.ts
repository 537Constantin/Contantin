import type { Capability, CapabilityCategory } from "@/lib/types";

/**
 * Catalog of concrete jobs an AI employee can do. Each capability is gated by
 * its `requiredIntegrations` — the UI prevents activation until the user has
 * connected all of them.
 *
 * IMPORTANT: This is the *contract* layer. The actual backend execution
 * (Gmail API call, Lexoffice invoice creation, …) gets wired up per
 * integration once the user provides credentials. Until then the activation
 * flow, gating and configuration are all real.
 */

/** Any connected mailbox (OAuth or IMAP) satisfies inbox-reading needs. */
const INBOX_ANY: string[] = ["gmail", "outlook", "imap_smtp"];
/** Any connected calendar satisfies calendar needs. */
const CAL_ANY: string[] = ["google_calendar", "outlook_calendar"];
/** Any sending channel — own mailbox or transactional service. */
const SEND_ANY: string[] = ["resend", "gmail", "outlook", "imap_smtp"];

export const capabilities: Capability[] = [
  // ============== KOMMUNIKATION & SEKRETARIAT (Aria) ====================
  {
    id: "email_triage",
    name: "E-Mails priorisieren & kategorisieren",
    description:
      "Sortiert neue E-Mails nach Wichtigkeit, weist Labels zu und markiert, was deinen Blick braucht.",
    category: "communication",
    ownerRole: "secretary",
    requiredIntegrations: [INBOX_ANY, "openai"],
    permissions: ["read_email"],
    trigger: "event",
    output: "Inbox mit Labels, ein Stapel mit deinen Top-Prioritäten.",
    setup: [
      {
        key: "rules",
        title: "Triage-Regeln",
        description: "Wonach soll priorisiert werden?",
        inputs: [
          {
            key: "priorityRule",
            label: "Vorrang gewähren bei",
            type: "select",
            options: [
              { value: "vip_contacts", label: "VIP-Kontakte" },
              { value: "money_words", label: "Geld-/Rechnungsthemen" },
              { value: "client_keyword", label: "Schlüsselwörter" },
            ],
            required: true,
          },
          {
            key: "vipList",
            label: "VIP-E-Mail-Adressen (kommagetrennt)",
            type: "textarea",
            placeholder: "ceo@kunde.de, partner@beispiel.de",
          },
        ],
      },
    ],
  },
  {
    id: "email_daily_summary",
    name: "Tägliche Posteingangs-Zusammenfassung",
    description:
      "Liest alle neuen E-Mails seit dem letzten Briefing und schickt dir eine Zusammenfassung per Mail.",
    category: "communication",
    ownerRole: "secretary",
    requiredIntegrations: [INBOX_ANY, SEND_ANY, "openai"],
    permissions: ["read_email", "send_email"],
    trigger: "schedule",
    schedule: "Werktags 07:00",
    output: "E-Mail mit den wichtigsten Themen, Action-Items und To-dos.",
    setup: [
      {
        key: "recipient",
        title: "Wer bekommt das Briefing?",
        inputs: [
          {
            key: "to",
            label: "Empfänger-E-Mail",
            type: "email",
            placeholder: "constantin@deinefirma.de",
            required: true,
          },
          {
            key: "time",
            label: "Uhrzeit",
            type: "time",
            defaultValue: "07:00",
            required: true,
          },
          {
            key: "days",
            label: "Tage",
            type: "select",
            options: [
              { value: "weekdays", label: "Mo–Fr" },
              { value: "daily", label: "Täglich" },
            ],
            defaultValue: "weekdays",
          },
        ],
      },
    ],
  },
  {
    id: "email_draft_replies",
    name: "Antworten vorbereiten",
    description:
      "Schreibt für Routine-Mails Antwort-Entwürfe in deinem Ton und legt sie als Entwurf in dein Postfach.",
    category: "communication",
    ownerRole: "secretary",
    requiredIntegrations: [INBOX_ANY, "openai"],
    permissions: ["read_email", "send_email"],
    trigger: "event",
    output: "Entwürfe im Postfach — du musst nur noch lesen & senden.",
    setup: [
      {
        key: "tone",
        title: "Schreibstil",
        inputs: [
          {
            key: "style",
            label: "Stil",
            type: "select",
            options: [
              { value: "formal", label: "Formell, Sie-Form" },
              { value: "warm", label: "Warm, Du-Form" },
              { value: "concise", label: "Knapp & sachlich" },
            ],
            defaultValue: "warm",
            required: true,
          },
          {
            key: "signature",
            label: "Signatur",
            type: "textarea",
            placeholder: "Viele Grüße\nConstantin Weber",
          },
        ],
      },
    ],
  },
  {
    id: "calendar_book_meetings",
    name: "Termine planen & verschieben",
    description:
      "Findet Slots, bucht Termine, löst Konflikte automatisch und benachrichtigt alle Beteiligten.",
    category: "calendar",
    ownerRole: "secretary",
    requiredIntegrations: [CAL_ANY, INBOX_ANY, "openai"],
    permissions: ["read_calendar", "write_calendar", "send_email"],
    trigger: "event",
    output: "Termine im Kalender, Einladungen verschickt, Konflikte gelöst.",
    setup: [
      {
        key: "rules",
        title: "Buchungsregeln",
        inputs: [
          {
            key: "workingHours",
            label: "Arbeitszeiten",
            type: "select",
            options: [
              { value: "9_18", label: "09:00 – 18:00" },
              { value: "8_17", label: "08:00 – 17:00" },
              { value: "10_19", label: "10:00 – 19:00" },
            ],
            defaultValue: "9_18",
            required: true,
          },
          {
            key: "bufferMin",
            label: "Pufferzeit zwischen Terminen (Min.)",
            type: "number",
            defaultValue: "15",
          },
        ],
      },
    ],
  },
  {
    id: "calendar_reminders",
    name: "Erinnerungen versenden",
    description: "Schickt rechtzeitig Erinnerungen für anstehende Termine.",
    category: "calendar",
    ownerRole: "secretary",
    requiredIntegrations: [CAL_ANY, SEND_ANY],
    permissions: ["read_calendar", "send_email"],
    trigger: "schedule",
    schedule: "Täglich 17:00 für nächsten Tag",
    output: "E-Mail-Erinnerungen an alle Teilnehmer.",
    setup: [
      {
        key: "policy",
        title: "Erinnerungspolitik",
        inputs: [
          {
            key: "leadTime",
            label: "Vorlaufzeit",
            type: "select",
            options: [
              { value: "1d", label: "1 Tag vorher" },
              { value: "2h", label: "2 Stunden vorher" },
              { value: "both", label: "Beides" },
            ],
            defaultValue: "both",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "meeting_prep",
    name: "Meeting-Vorbereitung",
    description:
      "Liest die Einladung, holt Kontext aus E-Mails und CRM, schreibt dir vor jedem Meeting eine Kurz-Vorbereitung mit Zielen, Teilnehmern und Knackpunkten.",
    category: "communication",
    ownerRole: "secretary",
    requiredIntegrations: [CAL_ANY, INBOX_ANY, "openai"],
    permissions: ["read_calendar", "read_email"],
    trigger: "schedule",
    schedule: "60 Min vor jedem Meeting",
    output: "Briefing-Notiz mit Agenda, Teilnehmer-Kontext und Knackpunkten.",
    setup: [
      {
        key: "scope",
        title: "Umfang",
        inputs: [
          {
            key: "minDuration",
            label: "Nur ab Meeting-Länge (Min.)",
            type: "number",
            defaultValue: "30",
          },
        ],
      },
    ],
  },
  {
    id: "meeting_summary",
    name: "Meeting-Protokoll erstellen",
    description:
      "Aus hochgeladenem Transkript oder Notizen ein strukturiertes Protokoll mit Entscheidungen und Action Items erzeugen und verteilen.",
    category: "communication",
    ownerRole: "secretary",
    requiredIntegrations: ["openai", SEND_ANY],
    permissions: ["send_email"],
    trigger: "manual",
    output: "Strukturiertes Protokoll mit Entscheidungen und Aufgaben.",
    setup: [
      {
        key: "distribution",
        title: "Verteiler",
        inputs: [
          {
            key: "recipients",
            label: "Standardempfänger (kommagetrennt)",
            type: "textarea",
            placeholder: "team@deinefirma.de",
          },
        ],
      },
    ],
  },

  // ============== VERTRIEB (Leo) ========================================
  {
    id: "lead_scoring",
    name: "Leads bewerten (Fit & Intent)",
    description:
      "Bewertet neue Leads mit einem 0–100-Score, schreibt Insights ins CRM und alarmiert bei heißen Leads.",
    category: "sales",
    ownerRole: "sales",
    requiredIntegrations: ["hubspot", "openai"],
    permissions: ["read_crm", "write_crm"],
    trigger: "event",
    output: "CRM-Eintrag mit Score, Begründung und Empfehlung.",
    setup: [
      {
        key: "thresholds",
        title: "Schwellenwerte",
        inputs: [
          {
            key: "hotThreshold",
            label: "„Heißer Lead“ ab Score",
            type: "number",
            defaultValue: "80",
            required: true,
          },
          {
            key: "alertChannel",
            label: "Benachrichtigung an",
            type: "select",
            options: [
              { value: "email", label: "E-Mail" },
              { value: "slack", label: "Slack" },
            ],
            defaultValue: "email",
          },
        ],
      },
    ],
  },
  {
    id: "follow_up_sequences",
    name: "Follow-up-Sequenzen",
    description:
      "Schreibt und versendet personalisierte Follow-ups auf Basis des CRM-Kontexts.",
    category: "sales",
    ownerRole: "sales",
    requiredIntegrations: ["hubspot", SEND_ANY, "openai"],
    permissions: ["read_crm", "write_crm", "send_email"],
    trigger: "schedule",
    schedule: "Tag 3, 7, 14 nach letztem Kontakt",
    output: "Versendete, personalisierte Follow-up-Mails.",
    setup: [
      {
        key: "cadence",
        title: "Kadenz",
        inputs: [
          {
            key: "days",
            label: "Follow-up nach Tagen",
            type: "text",
            defaultValue: "3,7,14",
          },
          {
            key: "stopAfter",
            label: "Stoppen nach (Anzahl)",
            type: "number",
            defaultValue: "3",
          },
        ],
      },
    ],
  },
  {
    id: "proposal_draft",
    name: "Angebote vorbereiten",
    description:
      "Erstellt Angebote aus deiner Preisliste und CRM-Daten, legt sie als Entwurf ab.",
    category: "sales",
    ownerRole: "sales",
    requiredIntegrations: ["hubspot", "openai"],
    permissions: ["read_crm", "write_crm"],
    trigger: "manual",
    output: "Angebots-Entwurf bereit zur Freigabe.",
    setup: [
      {
        key: "pricing",
        title: "Preisliste",
        inputs: [
          {
            key: "pricelistUrl",
            label: "Link zur Preisliste (z. B. Google Doc)",
            type: "text",
            required: true,
          },
          {
            key: "maxDiscount",
            label: "Max. Rabatt ohne Freigabe (%)",
            type: "number",
            defaultValue: "10",
          },
        ],
      },
    ],
  },
  {
    id: "pipeline_report_weekly",
    name: "Wöchentlicher Pipeline-Report",
    description:
      "Analysiert die Pipeline und liefert dir freitags einen Bericht mit Trends und Risiken.",
    category: "sales",
    ownerRole: "sales",
    requiredIntegrations: ["hubspot", "openai", SEND_ANY],
    permissions: ["read_crm", "send_email"],
    trigger: "schedule",
    schedule: "Freitag 16:00",
    output: "Pipeline-Report per E-Mail.",
    setup: [
      {
        key: "delivery",
        title: "Auslieferung",
        inputs: [
          { key: "to", label: "Empfänger", type: "email", required: true },
        ],
      },
    ],
  },

  // ============== KUNDENSERVICE (Nova) ==================================
  {
    id: "ticket_triage",
    name: "Tickets klassifizieren & priorisieren",
    description:
      "Nimmt neue Tickets entgegen, kategorisiert sie, weist sie zu und markiert SLA-Risiken.",
    category: "support",
    ownerRole: "support",
    requiredIntegrations: ["zendesk", "openai"],
    permissions: ["read_helpdesk", "write_helpdesk"],
    trigger: "event",
    output: "Tickets mit Kategorie, Priorität und Vorschlag.",
    setup: [
      {
        key: "categories",
        title: "Kategorien",
        inputs: [
          {
            key: "list",
            label: "Erlaubte Kategorien (kommagetrennt)",
            type: "textarea",
            defaultValue: "Rechnung, Lieferung, Produktfehler, Sonstiges",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "ticket_auto_reply",
    name: "FAQ-Antworten automatisch",
    description:
      "Beantwortet Standardfragen aus der Wissensbasis sofort, eskaliert nur Komplexes.",
    category: "support",
    ownerRole: "support",
    requiredIntegrations: ["zendesk", "openai"],
    permissions: ["read_helpdesk", "write_helpdesk"],
    trigger: "event",
    output: "Direkte Antwort mit Quellenangabe; sonst Eskalation.",
    setup: [
      {
        key: "confidence",
        title: "Konfidenz",
        inputs: [
          {
            key: "minConfidence",
            label: "Antworten ab Konfidenz (0–100)",
            type: "number",
            defaultValue: "80",
          },
        ],
      },
    ],
  },
  {
    id: "sentiment_alerts",
    name: "Beschwerden eskalieren",
    description:
      "Erkennt negatives Sentiment und alarmiert sofort mit voll vorbereitetem Kontext.",
    category: "support",
    ownerRole: "support",
    requiredIntegrations: ["zendesk", "openai", "slack"],
    permissions: ["read_helpdesk", "write_helpdesk"],
    trigger: "event",
    output: "Slack-Alert + vorbereitete Antwort.",
    setup: [
      {
        key: "channel",
        title: "Slack-Channel",
        inputs: [
          {
            key: "channel",
            label: "Channel",
            type: "text",
            placeholder: "#support-eskalation",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "kb_maintenance",
    name: "Wissensbasis pflegen",
    description:
      "Findet Themen, die immer wieder anfragt werden, schlägt neue Artikel vor.",
    category: "support",
    ownerRole: "support",
    requiredIntegrations: ["zendesk", "notion", "openai"],
    permissions: ["read_helpdesk"],
    trigger: "schedule",
    schedule: "Freitag 15:00",
    output: "Vorgeschlagene Artikel im Notion-Entwurfsordner.",
    setup: [
      {
        key: "notion",
        title: "Notion-Ablage",
        inputs: [
          {
            key: "pageId",
            label: "Notion-Seiten-ID",
            type: "text",
            required: true,
          },
        ],
      },
    ],
  },

  // ============== BUCHHALTUNG (Felix) ===================================
  {
    id: "invoice_create",
    name: "Rechnungen erstellen",
    description: "Erstellt Rechnungen aus Aufträgen und legt sie in Lexoffice ab.",
    category: "accounting",
    ownerRole: "accountant",
    requiredIntegrations: ["lexoffice", "openai"],
    permissions: ["read_accounting", "write_accounting"],
    trigger: "event",
    output: "Rechnung in Lexoffice, bereit zum Versand.",
    setup: [
      {
        key: "defaults",
        title: "Standard-Werte",
        inputs: [
          {
            key: "paymentTerms",
            label: "Zahlungsziel (Tage)",
            type: "number",
            defaultValue: "14",
            required: true,
          },
          {
            key: "vat",
            label: "USt-Satz (%)",
            type: "number",
            defaultValue: "19",
          },
        ],
      },
    ],
  },
  {
    id: "invoice_send",
    name: "Rechnungen versenden",
    description: "Schickt fertige Rechnungen direkt an die Kunden.",
    category: "accounting",
    ownerRole: "accountant",
    requiredIntegrations: ["lexoffice", SEND_ANY],
    permissions: ["read_accounting", "send_email"],
    trigger: "event",
    output: "Versendete Rechnung mit Tracking.",
    setup: [
      {
        key: "template",
        title: "Vorlage",
        inputs: [
          {
            key: "subject",
            label: "Betreff-Vorlage",
            type: "text",
            defaultValue: "Rechnung {{number}} von {{company}}",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "payment_monitor",
    name: "Zahlungseingänge überwachen",
    description: "Gleicht Banking-Umsätze mit offenen Rechnungen ab.",
    category: "accounting",
    ownerRole: "accountant",
    requiredIntegrations: ["banking_finapi", "lexoffice"],
    permissions: ["read_banking", "read_accounting", "write_accounting"],
    trigger: "schedule",
    schedule: "Werktags 09:00 und 16:00",
    output: "Auto-Abgleich + Liste der Ausstände.",
    setup: [
      {
        key: "tolerance",
        title: "Toleranz",
        inputs: [
          {
            key: "amountTolerance",
            label: "Betragstoleranz (€)",
            type: "number",
            defaultValue: "1",
          },
        ],
      },
    ],
  },
  {
    id: "dunning",
    name: "Mahnungen vorbereiten",
    description:
      "Erstellt Mahnstufen 1–3 auf Basis der Fälligkeiten — du musst nur freigeben.",
    category: "accounting",
    ownerRole: "accountant",
    requiredIntegrations: ["lexoffice", SEND_ANY],
    permissions: ["read_accounting", "write_accounting", "send_email"],
    trigger: "schedule",
    schedule: "Werktags 11:00",
    output: "Mahnungs-Entwürfe je Stufe.",
    setup: [
      {
        key: "stages",
        title: "Mahnstufen",
        inputs: [
          {
            key: "stage1Days",
            label: "Mahnung 1 nach Tagen",
            type: "number",
            defaultValue: "7",
          },
          {
            key: "stage2Days",
            label: "Mahnung 2 nach Tagen",
            type: "number",
            defaultValue: "14",
          },
          {
            key: "stage3Days",
            label: "Mahnung 3 nach Tagen",
            type: "number",
            defaultValue: "30",
          },
        ],
      },
    ],
  },
  {
    id: "monthly_finance_report",
    name: "Monatsbericht Finanzen",
    description:
      "Liefert dir am Monatsanfang den Vormonat: Umsatz, Marge, offene Posten, Trends.",
    category: "accounting",
    ownerRole: "accountant",
    requiredIntegrations: ["lexoffice", "banking_finapi", "openai", SEND_ANY],
    permissions: ["read_accounting", "read_banking", "send_email"],
    trigger: "schedule",
    schedule: "1. Werktag im Monat 07:00",
    output: "Finanzbericht per E-Mail.",
    setup: [
      {
        key: "delivery",
        title: "Empfänger",
        inputs: [
          { key: "to", label: "Empfänger", type: "email", required: true },
        ],
      },
    ],
  },

  // ============== HR (Hannah) ===========================================
  {
    id: "cv_screening",
    name: "Lebensläufe vorsortieren",
    description:
      "Bewertet eingehende Bewerbungen anhand deiner Anforderungen und sortiert sie ein.",
    category: "hr",
    ownerRole: "hr",
    requiredIntegrations: ["openai"],
    permissions: [],
    trigger: "event",
    output: "Bewertete Bewerbungen mit Begründung.",
    setup: [
      {
        key: "criteria",
        title: "Anforderungen",
        inputs: [
          {
            key: "mustHave",
            label: "Pflicht-Kompetenzen",
            type: "textarea",
            placeholder: "z. B. Node.js, 3+ Jahre Erfahrung, Deutsch",
            required: true,
          },
          {
            key: "niceHave",
            label: "Nice-to-have",
            type: "textarea",
          },
        ],
      },
    ],
  },
  {
    id: "interview_scheduling",
    name: "Bewerbungsgespräche terminieren",
    description:
      "Findet Slots, koordiniert mit den Beteiligten, schickt Einladungen automatisch.",
    category: "hr",
    ownerRole: "hr",
    requiredIntegrations: [CAL_ANY, INBOX_ANY],
    permissions: ["read_calendar", "write_calendar", "send_email"],
    trigger: "manual",
    output: "Termin gebucht, Einladung verschickt.",
    setup: [
      {
        key: "interviewers",
        title: "Standard-Interviewer",
        inputs: [
          {
            key: "list",
            label: "E-Mails der Interviewer",
            type: "textarea",
            placeholder: "marcus@firma.de, leo@firma.de",
          },
        ],
      },
    ],
  },
  {
    id: "onboarding",
    name: "Onboarding starten",
    description:
      "Legt Onboarding-Aufgaben an und schickt dem neuen Mitarbeiter eine Willkommens-Mail.",
    category: "hr",
    ownerRole: "hr",
    requiredIntegrations: [SEND_ANY, CAL_ANY],
    permissions: ["send_email", "write_calendar"],
    trigger: "manual",
    output: "Onboarding-Plan + erste Termine eingerichtet.",
    setup: [
      {
        key: "plan",
        title: "Standardplan",
        inputs: [
          {
            key: "steps",
            label: "Schritte (eine pro Zeile)",
            type: "textarea",
            defaultValue:
              "Willkommens-Mail senden\nLaptop bestellen\nKick-off-Termin mit dem Team\nZugänge anlegen",
          },
        ],
      },
    ],
  },
  {
    id: "vacation_management",
    name: "Urlaubsanträge verwalten",
    description: "Sammelt Anträge, prüft Überschneidungen, schlägt Freigaben vor.",
    category: "hr",
    ownerRole: "hr",
    requiredIntegrations: [INBOX_ANY, CAL_ANY],
    permissions: ["read_email", "read_calendar", "write_calendar"],
    trigger: "event",
    output: "Übersicht offener Anträge und Konflikte.",
    setup: [
      {
        key: "policy",
        title: "Richtlinien",
        inputs: [
          {
            key: "noticeDays",
            label: "Mindest-Vorlaufzeit (Tage)",
            type: "number",
            defaultValue: "14",
          },
        ],
      },
    ],
  },

  // ============== MARKETING (Mia) =======================================
  {
    id: "social_post_draft",
    name: "Social-Media-Posts entwerfen",
    description:
      "Erstellt Post-Entwürfe für LinkedIn / X auf Basis deiner Themen oder News.",
    category: "marketing",
    ownerRole: "marketing",
    requiredIntegrations: ["openai"],
    permissions: ["post_social"],
    trigger: "manual",
    output: "Post-Entwürfe zur Freigabe.",
    setup: [
      {
        key: "topics",
        title: "Themenfokus",
        inputs: [
          {
            key: "topics",
            label: "Standardthemen (kommagetrennt)",
            type: "textarea",
            placeholder: "KI im Mittelstand, Produktivität, Automation",
            required: true,
          },
          {
            key: "tone",
            label: "Tonalität",
            type: "select",
            options: [
              { value: "expert", label: "Experte" },
              { value: "casual", label: "Locker" },
              { value: "founder", label: "Founder-Story" },
            ],
            defaultValue: "expert",
          },
        ],
      },
    ],
  },
  {
    id: "social_post_schedule",
    name: "Social-Posts planen & veröffentlichen",
    description:
      "Plant freigegebene Posts ein und veröffentlicht sie zur Zielzeit.",
    category: "marketing",
    ownerRole: "marketing",
    requiredIntegrations: ["linkedin"],
    permissions: ["post_social"],
    trigger: "schedule",
    schedule: "Pro Post — gewünschte Zeit",
    output: "Posts veröffentlicht, Statistik 24h später.",
    setup: [
      {
        key: "channels",
        title: "Kanäle",
        inputs: [
          {
            key: "primary",
            label: "Primärer Kanal",
            type: "select",
            options: [
              { value: "linkedin", label: "LinkedIn (Firmenseite)" },
              { value: "x_twitter", label: "X" },
            ],
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "newsletter_create",
    name: "Newsletter erstellen",
    description:
      "Bündelt Inhalte der Woche zu einem Newsletter-Entwurf in Mailchimp.",
    category: "marketing",
    ownerRole: "marketing",
    requiredIntegrations: ["mailchimp", "openai"],
    permissions: ["send_email"],
    trigger: "schedule",
    schedule: "Donnerstag 14:00",
    output: "Newsletter-Entwurf in Mailchimp, ready zum Versand.",
    setup: [
      {
        key: "audience",
        title: "Audience",
        inputs: [
          {
            key: "audienceId",
            label: "Mailchimp-Audience-ID",
            type: "text",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "competitor_monitor",
    name: "Wettbewerber überwachen",
    description:
      "Beobachtet Posts, Webseiten-Änderungen und Preise von Wettbewerbern.",
    category: "marketing",
    ownerRole: "marketing",
    requiredIntegrations: ["openai"],
    permissions: [],
    trigger: "schedule",
    schedule: "Montag 09:00",
    output: "Wettbewerber-Briefing mit Änderungen der Woche.",
    setup: [
      {
        key: "competitors",
        title: "Wettbewerber",
        inputs: [
          {
            key: "list",
            label: "URLs / Namen (eine pro Zeile)",
            type: "textarea",
            required: true,
          },
        ],
      },
    ],
  },

  // ============== STRATEGIE & FÜHRUNG (Marcus / Iris) ===================
  {
    id: "daily_brief",
    name: "Tägliches Briefing für die Führung",
    description:
      "Konsolidiert KPIs, offene Themen und Risiken zu einem 1-Minute-Briefing.",
    category: "strategy",
    ownerRole: "consultant",
    requiredIntegrations: ["openai", SEND_ANY],
    permissions: ["send_email"],
    trigger: "schedule",
    schedule: "Werktags 07:30",
    output: "1-Minute-Briefing per Mail.",
    setup: [
      {
        key: "recipient",
        title: "Empfänger",
        inputs: [
          { key: "to", label: "Empfänger", type: "email", required: true },
        ],
      },
    ],
  },
  {
    id: "weekly_report",
    name: "Wochenbericht der KPIs",
    description:
      "Bewertet die wichtigsten Kennzahlen, erklärt Veränderungen, zeigt Risiken.",
    category: "strategy",
    ownerRole: "analyst",
    requiredIntegrations: ["openai", SEND_ANY],
    permissions: ["send_email"],
    trigger: "schedule",
    schedule: "Montag 07:00",
    output: "Wochenbericht per E-Mail.",
    setup: [
      {
        key: "kpis",
        title: "KPI-Auswahl",
        inputs: [
          {
            key: "list",
            label: "KPI-Liste (eine pro Zeile)",
            type: "textarea",
            defaultValue:
              "Umsatz\nNeue Kunden\nMRR\nSupport-Antwortzeit\nCash-Position",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "anomaly_alerts",
    name: "KPI-Anomalien erkennen",
    description:
      "Schlägt Alarm, wenn ein KPI auffällig vom Trend abweicht.",
    category: "strategy",
    ownerRole: "analyst",
    requiredIntegrations: ["openai", "slack"],
    permissions: [],
    trigger: "schedule",
    schedule: "Stündlich",
    output: "Slack-Alert mit Erklärung und Vorschlag.",
    setup: [
      {
        key: "thresholds",
        title: "Empfindlichkeit",
        inputs: [
          {
            key: "sigma",
            label: "Schwelle (in Std.-Abweichungen)",
            type: "number",
            defaultValue: "2",
          },
        ],
      },
    ],
  },
  {
    id: "decision_brief",
    name: "Entscheidungsvorlage erstellen",
    description:
      "Bereitet ein Thema mit Optionen, Empfehlung und Risiken auf — du entscheidest.",
    category: "strategy",
    ownerRole: "consultant",
    requiredIntegrations: ["openai"],
    permissions: [],
    trigger: "manual",
    output: "Entscheidungsvorlage mit Empfehlung.",
    setup: [],
  },
];

export const capabilityCategoryLabel: Record<CapabilityCategory, string> = {
  communication: "Kommunikation & Sekretariat",
  calendar: "Kalender & Termine",
  sales: "Vertrieb",
  support: "Kundenservice",
  marketing: "Marketing",
  accounting: "Buchhaltung & Finanzen",
  hr: "Personalwesen",
  operations: "Operations",
  strategy: "Strategie & Führung",
};

export const triggerLabel: Record<import("@/lib/types").TriggerKind, string> = {
  manual: "Manuell ausgelöst",
  schedule: "Zeitplan",
  event: "Ereignis",
  webhook: "Webhook",
};

export function getCapability(id: string) {
  return capabilities.find((c) => c.id === id);
}

export function capabilitiesForRole(role: import("@/lib/types").EmployeeRole) {
  return capabilities.filter((c) => c.ownerRole === role);
}
