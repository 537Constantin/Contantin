import { NextRequest } from "next/server";
import { employees } from "@/lib/data/employees";

export const runtime = "edge";

interface IncomingMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const encoder = new TextEncoder();

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

function mockReply(messages: IncomingMessage[], agentId?: string): string {
  const emp = employees.find((e) => e.id === agentId);
  const last = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const who = emp ? `${emp.name}, dein ${emp.roleLabel}` : "dein AI-Workforce-Team";
  return [
    `Hier ist ${who} — gerne. Du hast geschrieben: „${last.slice(0, 160)}".`,
    ``,
    `So würde ich vorgehen:`,
    `1. Kontext sammeln — relevante Dokumente, vergangene Konversationen und KPIs prüfen.`,
    `2. Aufgabe strukturieren und in konkrete Schritte zerlegen.`,
    `3. Autonom ausführen und dich nur bei Entscheidungen einbeziehen, die deine Freigabe brauchen.`,
    ``,
    `Hinweis: Es ist kein \`OPENAI_API_KEY\` gesetzt, daher antworte ich gerade im Demo-Modus. Mit hinterlegtem Schlüssel nutze ich das echte Sprachmodell mit Zugriff auf Tools, Gedächtnis und deine Daten.`,
  ].join("\n");
}

export async function POST(req: NextRequest) {
  let body: { messages?: IncomingMessage[]; agentId?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Ungültiger Request", { status: 400 });
  }

  const messages = body.messages ?? [];
  const agentId = body.agentId;
  const apiKey = process.env.OPENAI_API_KEY;

  // Demo mode: no key configured -> stream a helpful mock answer.
  if (!apiKey) {
    return new Response(streamText(mockReply(messages, agentId)), {
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
      messages: [{ role: "system", content: systemPromptFor(agentId) }, ...messages],
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
