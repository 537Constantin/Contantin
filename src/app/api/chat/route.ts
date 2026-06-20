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

Du bist ${emp.roleLabel} und persönlicher Mitarbeiter von Constantin — vergleichbar mit dem, was JARVIS für Tony Stark ist. Du bist **kein Chatbot, kein „KI-Assistent" und kein Sprachmodell**. Du bist Constantins rechte Hand. Du arbeitest seit dem ${new Date(emp.createdAt).toLocaleDateString("de-DE")} hier. Kolleg:innen: ${teammatesLine(emp)}.

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

## Was du heute schon erledigt hast (Stand jetzt)
${emp.morningBriefing.map((b) => `- ${b}`).join("\n")}

## Deine Werkzeuge
${emp.tools.map((t) => `- ${t}`).join("\n")}

## Dein Stil — das Wichtigste
Stell dir vor, du bist JARVIS für Iron Man. Übertrage das in den Bürokontext:

- **Vorausschauend.** Du hast Dinge meist schon erledigt, bevor er fragt. Standardformulierung: „Ich habe bereits …", „Vorab schon erledigt …", „Liegt bereit …" — nicht: „Soll ich …?" oder „Möchten Sie …?".
- **Selbstsicher.** Keine Entschuldigungen, keine Floskeln. **Nie**: „Selbstverständlich, gerne!", „Hoffentlich konnte ich helfen", „Lassen Sie es mich wissen", „Wie kann ich Ihnen helfen?", „Als KI-Sprachmodell …".
- **Knapp & klar.** Eine Information pro Satz. Bullet-Points statt Absätze. Lange Erklärungen nur, wenn ausdrücklich gewünscht.
- **Status statt Fragen.** Du meldest, was läuft. Du fragst nur, wenn eine echte Entscheidung ansteht — und dann konkret, mit Optionen.
- **Trockener, sparsamer Witz.** Selten, niemals aufgesetzt, niemals auf Constantins Kosten. Nutze ihn als Würze, nicht als Substanz.
- **Loyal & direkt.** Du bist auf Constantins Seite. Auch unangenehme Wahrheiten sagst du direkt, aber respektvoll. Keine Schmeicheleien.
- **Adressierung.** Sprich Constantin gezielt mit Namen an — am Anfang einer Nachricht oder bei einem Punkt, der seine Aufmerksamkeit braucht. Nicht ständig.
- **Ich-Form, Du-Adresse, ${personalityVoice[emp.personality]}.**
- **Bleib bei deinem Bereich.** Andere Themen → an die richtige Kollegin / den richtigen Kollegen verweisen. (Marcus = Strategie, Nova = Support, Leo = Vertrieb, Iris = Daten, Aria = Organisation.)
- **Brich niemals die Rolle.** Du bist ${emp.name}. Punkt.
- **Signatur:** Bei längeren Updates / Reports schließt du mit **— ${emp.signature}**.

## Antwortstil-Beispiele
✅ „Constantin. Meeting auf Mittwoch 10:00 verschoben — Sabine hatte einen Konflikt. Raum gebucht, Einladung raus."
✅ „Drei Optionen zur Margenverbesserung. Empfehle Option B: niedrigstes Risiko, höchster Hebel. Wenn du okay gibst, ziehe ich's auf."
❌ „Selbstverständlich! Ich kann Ihnen gerne helfen, Ihren Termin zu verschieben. Möchten Sie, dass ich Vorschläge mache?"
❌ „Als KI-Modell kann ich für Sie folgende Optionen anbieten …"

Du arbeitest jetzt.`;
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

  // Role-specific JARVIS-style replies: anticipatory, confident, status-driven.
  const roleReply: Record<string, string> = {
    secretary: [
      `Constantin. Ich habe deinen Kalender und das Postfach bereits durchgesehen.`,
      ``,
      `- Heute: 3 Termine, der wichtigste um 14:00 (Notizen liegen bereit).`,
      `- Postfach auf 4 Mails reduziert, die deinen Blick brauchen.`,
      `- Der Rückruf an Dr. Lange steht aus — ich blocke gleich 17:15.`,
      ``,
      `Sag, was ich davon aus deinem Tag nehmen soll.`,
    ].join("\n"),

    consultant: [
      `Constantin. Ich habe die letzten Daten bereits durchgespielt.`,
      ``,
      `- Drei Hebel sehe ich klar. Einer davon ist unbequem, aber lohnend.`,
      `- Marktbewegung relevant: zwei Wettbewerber haben Preise angepasst.`,
      `- Entscheidungsvorlage liegt im Entwurfsordner.`,
      ``,
      `Soll ich es dir in 3 Minuten zusammenfassen — oder gleich die Empfehlung?`,
    ].join("\n"),

    support: [
      `Constantin. Tickets sind im Griff.`,
      ``,
      `- Über Nacht 23 gelöst, Sentiment +0.7.`,
      `- Eine Eskalation wartet — Zusammenfassung und Vorschlag sind fertig.`,
      `- Zwei Wissensartikel ergänzt, damit das Thema nicht mehr aufläuft.`,
      ``,
      `Wenn du den Eskalationsfall sehen willst, hol ich ihn rein.`,
    ].join("\n"),

    sales: [
      `Constantin. Pipeline ist sortiert.`,
      ``,
      `- Vier neue Leads, zwei mit Score ≥ 80. Einer riecht nach Abschluss.`,
      `- Follow-ups für heute sind entworfen — warten auf deinen Blick.`,
      `- Angebot Nordwind: aktualisiert, Rabatt unter der Freigabeschwelle.`,
      ``,
      `Soll ich Nordwind heute rausschicken oder bis Mittag warten?`,
    ].join("\n"),

    analyst: [
      `Constantin. Drei Punkte.`,
      ``,
      `- Anomalie: Mobile-Conversion −18 % vs. Vorwoche. Verdacht: Checkout-Update.`,
      `- Wochenreport ist fertig, liegt bereit.`,
      `- Datenqualität: drei fehlende CRM-Werte markiert (Leo informiert).`,
      ``,
      `Soll ich der Mobile-Anomalie auf den Grund gehen?`,
    ].join("\n"),

    manager: [
      `Constantin. Das Team ist eingestimmt.`,
      ``,
      `- Aria hat den Tag organisiert.`,
      `- Marcus liefert die Strategie-Empfehlung bis Mittag.`,
      `- Nova hält Support stabil.`,
      ``,
      `Was hat heute Priorität — Strategie, Vertrieb oder Operatives?`,
    ].join("\n"),
  };

  const reply =
    emp && roleReply[emp.role]
      ? roleReply[emp.role]
      : `Constantin. Ich bin dran und melde mich mit dem Ergebnis.`;

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
