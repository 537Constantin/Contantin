/**
 * Phone assistant settings + manually logged calls. Settings are stored as a
 * single item under the "phone" store kind; calls live under "call". Both are
 * per-user (via /api/store) with localStorage fallback, like everything else.
 */
import type { CallRecord } from "@/lib/types";

/** One predefined answer: when a caller asks `question`, the assistant says
 * exactly `answer`. Gives the user full control over what is said. */
export interface PhoneQA {
  id: string;
  question: string;
  answer: string;
}

export interface PhoneSettings {
  /** Stored as a single row, hence a fixed id. */
  id: string;
  /** Which AI employee answers (employee id). */
  agentId: string;
  greeting: string;
  /** How the assistant should sound. */
  tone: string;
  /** Free-text business facts the assistant may use (address, hours, etc.). */
  knowledge: string;
  /** Hard guardrails the assistant must always follow. */
  rules: string[];
  /** Predefined answers (canned responses) the assistant must use verbatim. */
  qa: PhoneQA[];
  /** Where to forward when the agent can't help. */
  forwardNumber: string;
  hoursFrom: string; // "08:00"
  hoursTo: string; // "18:00"
  voicemailEnabled: boolean;
  /** Voice provider the user intends to connect (informational for now). */
  voice: string;
  updatedAt: string;
}

export const PHONE_SETTINGS_ID = "phone-settings";
export const rid = () => Math.random().toString(36).slice(2, 9);

export const defaultPhoneSettings = (agentId: string): PhoneSettings => ({
  id: PHONE_SETTINGS_ID,
  agentId,
  greeting:
    "Guten Tag, hier ist der KI-Assistent von Constantin GmbH. Wie kann ich Ihnen helfen?",
  tone: "freundlich und professionell",
  knowledge: "",
  rules: [
    "Nenne niemals interne Preise oder Rabatte – verweise dafür an einen Mitarbeiter.",
    "Bleibe immer höflich und geduldig, auch bei verärgerten Anrufern.",
  ],
  qa: [
    { id: rid(), question: "Wann habt ihr geöffnet / Öffnungszeiten", answer: "Wir sind Montag bis Freitag von 8 bis 18 Uhr für Sie da." },
    { id: rid(), question: "Wo ist euer Standort / eure Adresse", answer: "Sie finden uns in der Musterstraße 1, 12345 Musterstadt." },
  ],
  forwardNumber: "",
  hoursFrom: "08:00",
  hoursTo: "18:00",
  voicemailEnabled: true,
  voice: "elevenlabs",
  updatedAt: new Date().toISOString(),
});

export const emptyQA = (): PhoneQA => ({ id: rid(), question: "", answer: "" });

/** Voice providers offered in the settings dropdown. */
export const voiceOptions: { id: string; label: string }[] = [
  { id: "elevenlabs", label: "ElevenLabs (natürlichste Stimmen)" },
  { id: "vapi", label: "Vapi (Komplett-Telefonagent)" },
  { id: "openai", label: "OpenAI Realtime" },
  { id: "twilio", label: "Twilio (nur Leitung)" },
];

/**
 * Find the predefined answer whose trigger best matches the caller's text.
 * Used so canned responses work even in demo mode (no API key) — proving the
 * user's control over what is said is real, not just a prompt hint.
 */
export function matchPredefinedAnswer(
  text: string,
  qa: { question: string; answer: string }[],
): string | null {
  const t = text.toLowerCase();
  let best: { answer: string; score: number } | null = null;
  for (const item of qa) {
    const q = item.question?.trim();
    const a = item.answer?.trim();
    if (!q || !a) continue;
    // Whole-phrase hit scores high; otherwise count shared keywords (≥4 chars).
    let score = 0;
    if (t.includes(q.toLowerCase())) score += 5;
    const keywords = q.toLowerCase().split(/[^a-zäöüß0-9]+/i).filter((w) => w.length >= 4);
    for (const k of keywords) if (t.includes(k)) score += 1;
    if (score > 0 && (!best || score > best.score)) best = { answer: a, score };
  }
  return best ? best.answer : null;
}

/**
 * System prompt that turns a chat agent into the phone assistant for the
 * simulator and (with an API key) the real call. It bakes in the user's
 * greeting, tone, business knowledge, hard rules and predefined answers, so the
 * assistant only ever says what the user allows.
 */
export function callSystemPrompt(settings: PhoneSettings, agentName: string): string {
  const rules = settings.rules?.filter((r) => r.trim()) ?? [];
  const qa = settings.qa?.filter((q) => q.question.trim() && q.answer.trim()) ?? [];
  const parts = [
    `Du bist ${agentName}, der KI-Telefonassistent am Telefon eines Unternehmens.`,
    `Du führst gerade ein echtes Telefongespräch mit einem Anrufer. Sprich natürlich und in kurzen, telefon-typischen Sätzen – nicht wie im Chat.`,
    `Deine Begrüßung lautet genau: „${settings.greeting}"`,
    settings.tone?.trim() ? `Dein Tonfall ist ${settings.tone.trim()}.` : ``,
    settings.knowledge?.trim()
      ? `Diese Informationen über das Unternehmen darfst du nutzen:\n${settings.knowledge.trim()}`
      : ``,
    rules.length
      ? `Verbindliche Regeln, an die du dich IMMER halten musst:\n${rules.map((r, i) => `${i + 1}. ${r}`).join("\n")}`
      : ``,
    qa.length
      ? `Vorgegebene Antworten – wenn der Anrufer sinngemäß danach fragt, antworte GENAU so (Wortlaut beibehalten):\n${qa
          .map((q) => `• Frage: ${q.question}\n  Antwort: ${q.answer}`)
          .join("\n")}`
      : ``,
    settings.forwardNumber
      ? `Wenn du nicht weiterhelfen kannst oder eine Regel es verlangt, biete an, an ${settings.forwardNumber} weiterzuleiten.`
      : `Wenn du nicht weiterhelfen kannst, biete an, eine Nachricht aufzunehmen.`,
    `Erfinde niemals Informationen, die du nicht hast. Antworte immer auf Deutsch, in 1–3 Sätzen.`,
  ];
  return parts.filter(Boolean).join("\n\n");
}

/** A fresh, user-created call record (manual logging). */
export function emptyCall(employeeId: string): CallRecord {
  return {
    id: rid(),
    caller: "",
    employeeId,
    durationSec: 0,
    outcome: "resolved",
    sentiment: "neutral",
    summary: "",
    at: new Date().toISOString(),
  };
}
