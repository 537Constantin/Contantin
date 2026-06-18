import { NextRequest } from "next/server";
import { employees } from "@/lib/data/employees";

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

function systemPromptFor(agentId?: string) {
  const emp = employees.find((e) => e.id === agentId);
  if (!emp) {
    return "Du bist AI Workforce OS, ein Team aus spezialisierten KI-Mitarbeitern. Antworte professionell, präzise und auf Deutsch. Hilf bei Organisation, Support, Beratung und Automatisierung.";
  }
  return `Du bist ${emp.name}, ein ${emp.roleLabel} bei AI Workforce OS. ${emp.description} Deine Fähigkeiten: ${emp.skills.join(", ")}. Antworte ${emp.personality === "concise" ? "knapp und effizient" : emp.personality === "empathetic" ? "empathisch und geduldig" : emp.personality === "friendly" ? "freundlich und nahbar" : emp.personality === "visionary" ? "strategisch und visionär" : "professionell und präzise"} auf Deutsch.`;
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
  "Hinweis: Ohne `OPENAI_API_KEY` antworte ich im Demo-Modus. Mit hinterlegtem Schlüssel erstelle ich daraus vollwertige Terminpläne, Reports und mehr.";

function mockReply(messages: IncomingMessage[], agentId?: string, graphs?: Graph[]): string {
  const emp = employees.find((e) => e.id === agentId);
  const who = emp ? `${emp.name}, dein ${emp.roleLabel}` : "dein AI-Workforce-Team";
  const last = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const wantsSchedule = /termin|zeitplan|kalender|tagesplan|plan\b/i.test(last);

  if (graphs?.length) {
    const referenced =
      graphs.find((g) => last.toLowerCase().includes(g.title.toLowerCase())) ?? graphs[0];
    const head = `Hier ist ${who}. Ich sehe ${graphs.length} gespeicherte${
      graphs.length === 1 ? "s Diagramm" : " Diagramme"
    } und arbeite mit „${referenced.title}".`;

    if (wantsSchedule) {
      return [
        head,
        ``,
        `**Terminplan auf Basis von „${referenced.title}":**`,
        ``,
        demoSchedule(referenced),
        ``,
        demoNote,
      ].join("\n");
    }

    const total = referenced.data.reduce((s, d) => s + (Number(d.value) || 0), 0);
    const top = [...referenced.data].sort((a, b) => b.value - a.value)[0];
    return [
      head,
      ``,
      `**Kurzanalyse:**`,
      `- Werte gesamt: ${total}`,
      top ? `- Höchster Wert: ${top.label} (${top.value})` : "",
      `- Einträge: ${referenced.data.length}`,
      ``,
      demoNote,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `Hier ist ${who} — gerne. Du hast geschrieben: „${last.slice(0, 160)}".`,
    ``,
    `So würde ich vorgehen:`,
    `1. Kontext sammeln — relevante Dokumente, Diagramme und KPIs prüfen.`,
    `2. Aufgabe strukturieren und in konkrete Schritte zerlegen.`,
    `3. Autonom ausführen und dich nur bei Entscheidungen einbeziehen, die deine Freigabe brauchen.`,
    ``,
    demoNote,
  ].join("\n");
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
