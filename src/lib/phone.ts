/**
 * Phone assistant settings + manually logged calls. Settings are stored as a
 * single item under the "phone" store kind; calls live under "call". Both are
 * per-user (via /api/store) with localStorage fallback, like everything else.
 */
import type { CallRecord } from "@/lib/types";

export interface PhoneSettings {
  /** Stored as a single row, hence a fixed id. */
  id: string;
  /** Which AI employee answers (employee id). */
  agentId: string;
  greeting: string;
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

export const defaultPhoneSettings = (agentId: string): PhoneSettings => ({
  id: PHONE_SETTINGS_ID,
  agentId,
  greeting:
    "Guten Tag, hier ist der KI-Assistent von Constantin GmbH. Wie kann ich Ihnen helfen?",
  forwardNumber: "",
  hoursFrom: "08:00",
  hoursTo: "18:00",
  voicemailEnabled: true,
  voice: "elevenlabs",
  updatedAt: new Date().toISOString(),
});

/** Voice providers offered in the settings dropdown. */
export const voiceOptions: { id: string; label: string }[] = [
  { id: "elevenlabs", label: "ElevenLabs (natürlichste Stimmen)" },
  { id: "vapi", label: "Vapi (Komplett-Telefonagent)" },
  { id: "openai", label: "OpenAI Realtime" },
  { id: "twilio", label: "Twilio (nur Leitung)" },
];

/**
 * System prompt that turns a chat agent into the phone assistant for the
 * simulator, so the simulated call reflects the user's actual settings.
 */
export function callSystemPrompt(settings: PhoneSettings, agentName: string): string {
  return [
    `Du bist ${agentName}, der KI-Telefonassistent am Telefon eines Unternehmens.`,
    `Du führst gerade ein Telefongespräch mit einem Anrufer. Sprich natürlich, höflich und kurz – wie am Telefon, nicht wie im Chat.`,
    `Deine Begrüßung lautet: „${settings.greeting}"`,
    settings.forwardNumber
      ? `Wenn du nicht weiterhelfen kannst, biete an, an ${settings.forwardNumber} weiterzuleiten.`
      : `Wenn du nicht weiterhelfen kannst, biete an, eine Nachricht aufzunehmen.`,
    settings.voicemailEnabled
      ? `Außerhalb der Geschäftszeiten (${settings.hoursFrom}–${settings.hoursTo}) nimmst du eine Voicemail auf.`
      : ``,
    `Antworte immer auf Deutsch. Halte Antworten auf 1–3 Sätze.`,
  ]
    .filter(Boolean)
    .join(" ");
}

export const rid = () => Math.random().toString(36).slice(2, 9);

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
