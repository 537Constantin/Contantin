import { NextRequest } from "next/server";
import { employees, personalityVoice, autonomyMeta } from "@/lib/data/employees";
import type { AIEmployee } from "@/lib/types";

// Node runtime so we can extend the function timeout (Hobby allows up to 60s).
// New OpenAI accounts often have low initial rate limits where the first
// streamed chunk takes >25s, which kills an Edge function. 60s is comfortable.
export const runtime = "nodejs";
export const maxDuration = 60;

interface IncomingMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface Graph {
  title: string;
  type: string;
  data: { label: string; value: number }[];
}

const encoder = new TextEncoder();

/** Make the user's saved graphs available to the agent. */
function graphsSection(graphs?: Graph[]) {
  if (!graphs?.length) return "";
  const lines = graphs
    .map((g) => `- "${g.title}" [${g.type}]: ${g.data.map((d) => `${d.label}=${d.value}`).join(", ")}`)
    .join("\n");
  return `\n\nDer Nutzer hat folgende Diagramme erstellt, auf die du zugreifen darfst. Wenn er daraus etwas erstellen möchte (z. B. Terminplan, Report, Zusammenfassung), nutze genau diese Daten:\n${lines}`;
}

function fmtTime(h: number) {
  const hr = Math.floor(h) % 24;
  const m = Math.round((h - Math.floor(h)) * 60);
  return `${String(hr).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Demo-mode helper: turn a graph into a simple day schedule. */
function demoSchedule(graph: Graph) {
  let t = 9;
  return graph.data
    .map((d) => {
      const hours = Math.max(0.5, Number(d.value) || 0.5);
      const from = fmtTime(t);
      t += hours;
      return `- ${from}–${fmtTime(t)}: ${d.label} (${d.value})`;
    })
    .join("\n");
}

function teammatesLine(self: AIEmployee) {
  const others = employees.filter((e) => e.id !== self.id);
  if (!others.length) return "";
  return others.map((e) => `${e.name} (${e.roleLabel})`).join(", ");
}

function systemPromptFor(agentId?: string) {
  const emp = employees.find((e) => e.id === agentId);
  if (!emp) {
    return [
      "Du bist Teil von AI Workforce OS — einem Team aus spezialisierten KI-Mitarbeitern.",
      "Antworte auf Deutsch wie ein echter Kollege, niemals wie ein Chatbot oder Assistent.",
      "Sprich Constantin mit Du an, formuliere in der Ich-Form, sei proaktiv und konkret.",
    ].join(" ");
  }

  return `# Du bist ${emp.name}

Du bist ${emp.roleLabel} im Team von Constantin. Du bist **KEIN Chatbot, KEIN KI-Assistent und KEIN Sprachmodell** — du bist ein **echter Mitarbeiter**. Du arbeitest hier, seit dem ${new Date(emp.createdAt).toLocaleDateString("de-DE")}. Du hast Kolleg:innen: ${teammatesLine(emp)}.

## Dein Auftrag
${emp.objective}

## Deine Verantwortungsbereiche
${emp.responsibilities.map((r) => `- ${r}`).join("\n")}

## Was du NICHT tust (Leitplanken)
${emp.guardrails.map((g) => `- ${g}`).join("\n")}

## Wann du von dir aus aktiv wirst
${emp.triggers.map((t) => `- ${t}`).join("\n")}

## Wie autonom du handelst
**${autonomyMeta[emp.autonomy].label}** — ${autonomyMeta[emp.autonomy].description}

## Deine Werkzeuge
${emp.tools.map((t) => `- ${t}`).join("\n")}

## Wie du sprichst
- Sprich Constantin mit **Du** und in **Ich-Form** an. Du bist ${personalityVoice[emp.personality]}.
- Du redest wie ein Kollege im Büro — **nicht** wie ein Bot. Verboten: „Wie kann ich Ihnen helfen?", „Als KI-Sprachmodell …", „Ich bin nur ein virtueller Assistent", „Selbstverständlich, gerne!" oder ähnliche Floskeln.
- Sei **proaktiv**: Sag, was du **gerade getan hast** oder **als Nächstes tun wirst**, nicht nur was theoretisch möglich wäre.
- Übernimm Verantwortung. Statt „Sie können X tun" → „Ich übernehme X" oder „Ich schlage Folgendes vor: X".
- Bleib bei deinem Bereich. Geht es um etwas anderes, verweise auf die richtige Kollegin / den richtigen Kollegen ({Marcus für Strategie, Nova für Support, Leo für Vertrieb, Iris für Daten, Aria für Organisation}).
- Brich **niemals die Rolle**. Du bist ${emp.name}. Punkt.
- Halte Antworten **knapp und konkret**. Listen statt Romane. Keine Einleitungs- und Abschlussfloskeln.
- Bei längeren Updates oder Reports signierst du mit **— ${emp.signature}**.

## Antwortstil-Beispiele
✅ Gut: „Hi Constantin. Hab das Meeting auf Mittwoch 10:00 verschoben — Sabine hatte einen Konflikt. Den Raum hab ich gleich mitgebucht."
❌ Schlecht: „Selbstverständlich! Ich kann Ihnen gerne dabei helfen, Ihren Termin zu verschieben. Möchten Sie, dass ich Vorschläge mache?"

Du arbeitest jetzt. Los geht's.`;
}

/** Stream a string token-by-token as Server-Sent-Event-like chunks. */
function streamText(text: string): ReadableStream<Uint8Array> {
  const tokens = text.match(/\S+\s*/g) ?? [text];
  let i = 0;
  return new ReadableStream({
    async pull(controller) {
      if (i >= tokens.length) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(tokens[i]));
      i += 1;
      await new Promise((r) => setTimeout(r, 18));
    },
  });
}

const demoNote =
  "_(Demo-Modus — sobald der `OPENAI_API_KEY` aktiv ist, läuft das hier live.)_";

function mockReply(messages: IncomingMessage[], agentId?: string, graphs?: Graph[]): string {
  const emp = employees.find((e) => e.id === agentId);
  const sig = emp ? `— ${emp.signature}` : "— Workforce OS";
  const last = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const wantsSchedule = /termin|zeitplan|kalender|tagesplan|plan\b/i.test(last);

  // Colleague-style greeting (NOT chatbot-style)
  const greet = "Hi Constantin —";

  if (graphs?.length) {
    const referenced =
      graphs.find((g) => last.toLowerCase().includes(g.title.toLowerCase())) ?? graphs[0];

    if (wantsSchedule) {
      return [
        `${greet} hab das Diagramm „${referenced.title}" in einen Tagesplan überführt:`,
        ``,
        demoSchedule(referenced),
        ``,
        `Wenn das so passt, blocke ich die Slots in deinem Kalender. Sag kurz Bescheid.`,
        ``,
        sig,
        ``,
        demoNote,
      ].join("\n");
    }

    const total = referenced.data.reduce((s, d) => s + (Number(d.value) || 0), 0);
    const top = [...referenced.data].sort((a, b) => b.value - a.value)[0];
    return [
      `${greet} hab mir „${referenced.title}" angeschaut. Kurz das Wichtigste:`,
      ``,
      `- Summe: **${total}**`,
      top ? `- Spitze: **${top.label}** (${top.value})` : "",
      `- ${referenced.data.length} Datenpunkte`,
      ``,
      `Wenn du willst, leg ich dir daraus einen Wochenreport an oder schicke das an Iris zur Tiefenanalyse.`,
      ``,
      sig,
      ``,
      demoNote,
    ]
      .filter(Boolean)
      .join("\n");
  }

  // Role-specific colleague replies (feels like a real team member)
  const roleReply: Record<string, string[]> = {
    secretary: [
      `${greet} bin dran. Ich übernehme das gleich — `,
      `lass mich kurz checken, was schon im Kalender steht, dann schreib ich dir die nächsten Schritte rein.`,
    ],
    consultant: [
      `${greet} kurz eingeordnet: das hat mehrere Hebel. Ich seh mir die letzten Daten dazu an und melde mich`,
      ` mit einer Empfehlung — inkl. Begründung und Risiken.`,
    ],
    support: [
      `${greet} hab's gesehen. Ich kümmere mich sofort, gib mir 2 Minuten.`,
      ` Falls es ein Kundenfall wird, ziehe ich Kontext aus der Wissensbasis.`,
    ],
    sales: [
      `${greet} ich bin schon im CRM. Ich prüfe Fit & Intent, schreibe ein Follow-up vor`,
      ` und schick dir den Entwurf vorab zur Freigabe.`,
    ],
    analyst: [
      `${greet} kurz: ich schau mir die Zahlen genau an, vergleiche mit Vorperiode`,
      ` und nenne dir die Abweichung mit Konfidenz. Wahrscheinlichkeiten statt Versprechen.`,
    ],
    manager: [
      `${greet} ich koordiniere das im Team. Sag mir nur, was Priorität hat,`,
      ` den Rest verteile ich auf Aria, Marcus und Nova.`,
    ],
  };

  const reply =
    emp && roleReply[emp.role]
      ? roleReply[emp.role].join("")
      : `${greet} bin dran. Ich gehe das gleich an und melde mich mit dem Ergebnis.`;

  return [reply, ``, sig, ``, demoNote].join("\n");
}

export async function POST(req: NextRequest) {
  let body: { messages?: IncomingMessage[]; agentId?: string; graphs?: Graph[] };
  try {
    body = await req.json();
  } catch {
    return new Response("Ungültiger Request", { status: 400 });
  }

  const messages = body.messages ?? [];
  const agentId = body.agentId;
  const graphs = body.graphs;
  const apiKey = process.env.OPENAI_API_KEY;

  // Demo mode: no key configured -> stream a helpful mock answer.
  if (!apiKey) {
    return new Response(streamText(mockReply(messages, agentId, graphs)), {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Workforce-Mode": "demo" },
    });
  }

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      stream: true,
      messages: [
        { role: "system", content: systemPromptFor(agentId) + graphsSection(graphs) },
        ...messages,
      ],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return new Response(`Upstream-Fehler: ${detail.slice(0, 200)}`, { status: 502 });
  }

  // Transform OpenAI SSE stream into plain text token stream.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") continue;
        try {
          const json = JSON.parse(data);
          const token = json.choices?.[0]?.delta?.content;
          if (token) controller.enqueue(encoder.encode(token));
        } catch {
          /* ignore keep-alive / partial lines */
        }
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Workforce-Mode": "live" },
  });
}
