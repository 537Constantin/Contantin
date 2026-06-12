import { NextRequest } from "next/server";
import { employees } from "@/lib/data/employees";

export const runtime = "edge";

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

  // A file was attached: acknowledge it and show a quick demo summary built
  // from its first lines (the real summary comes with an OPENAI_API_KEY).
  const fileMatch = last.match(/--- Angehängte Datei „(.+?)" ---\n([\s\S]*)$/);
  if (fileMatch) {
    const [, fileName, fileText] = fileMatch;
    const lines = fileText.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 4);
    return [
      `Hier ist ${who}. Ich habe die Datei „${fileName}" erhalten und gelesen.`,
      ``,
      `**Kurzüberblick (Demo):**`,
      ...(lines.length ? lines.map((l) => `- ${l.slice(0, 140)}`) : ["- (Kein lesbarer Textinhalt gefunden.)"]),
      ``,
      demoNote,
    ].join("\n");
  }

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

interface PhoneQA { question: string; answer: string }

/** Best-matching predefined answer for the caller's text (mirrors the client
 * matcher in lib/phone.ts), so canned answers also work in demo mode. */
function matchQA(text: string, qa?: PhoneQA[]): string | null {
  if (!qa?.length) return null;
  const t = text.toLowerCase();
  let best: { answer: string; score: number } | null = null;
  for (const item of qa) {
    const q = item.question?.trim();
    const a = item.answer?.trim();
    if (!q || !a) continue;
    let score = 0;
    if (t.includes(q.toLowerCase())) score += 5;
    const keywords = q.toLowerCase().split(/[^a-zäöüß0-9]+/i).filter((w) => w.length >= 4);
    for (const k of keywords) if (t.includes(k)) score += 1;
    if (score > 0 && (!best || score > best.score)) best = { answer: a, score };
  }
  return best ? best.answer : null;
}

/** Demo reply for the phone-call simulator (no API key configured). */
function mockCallReply(messages: IncomingMessage[], greeting?: string, qa?: PhoneQA[]): string {
  const last = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const assistantHasSpoken = messages.some((m) => m.role === "assistant" && m.content.trim());

  // Predefined answers win — this is the user's explicit control over wording.
  const canned = matchQA(last, qa);
  if (canned) return canned;

  // Open the call with the greeting only if the assistant hasn't spoken yet
  // (the UI normally seeds the greeting itself, so this is a fallback).
  if (!assistantHasSpoken && !last) {
    return greeting?.trim()
      ? greeting.trim()
      : "Guten Tag, schön dass Sie anrufen! Worum geht es denn genau – ich helfe Ihnen gern weiter.";
  }
  if (/termin|appointment|buchen|vereinbaren/i.test(last)) {
    return "Sehr gerne. Ich hätte morgen um 14:00 Uhr oder übermorgen um 10:30 Uhr einen Termin frei. Was passt Ihnen besser?";
  }
  if (/preis|kosten|angebot/i.test(last)) {
    return "Da verbinde ich Sie am besten mit einem Kollegen – darf ich Ihren Namen und einen Rückrufwunsch notieren?";
  }
  return "Verstanden, das notiere ich. Möchten Sie, dass ich dazu einen Termin eintrage oder eine Nachricht an das Team weitergebe?";
}

export async function POST(req: NextRequest) {
  let body: {
    messages?: IncomingMessage[];
    agentId?: string;
    graphs?: Graph[];
    mode?: string;
    systemPrompt?: string;
    greeting?: string;
    qa?: PhoneQA[];
    /** Expertise (persona + knowledge) from an active specialization. */
    expertise?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response("Ungültiger Request", { status: 400 });
  }

  const messages = body.messages ?? [];
  const agentId = body.agentId;
  const graphs = body.graphs;
  const isCall = body.mode === "call";
  // A caller-supplied prompt is only honoured for the call simulator.
  const override = isCall && typeof body.systemPrompt === "string" ? body.systemPrompt : "";
  // Expertise from an active specialization is appended (never replaces the
  // persona) and only for normal chat, not the call simulator.
  const expertise = !isCall && typeof body.expertise === "string" ? body.expertise.slice(0, 14000) : "";
  const apiKey = process.env.OPENAI_API_KEY;

  // Demo mode: no key configured -> stream a helpful mock answer.
  if (!apiKey) {
    let reply = isCall
      ? mockCallReply(messages, body.greeting, body.qa)
      : mockReply(messages, agentId, graphs);
    if (expertise) {
      reply = "*(Spezialisierung aktiv – im Demo-Modus wird das Fachwissen noch nicht voll genutzt; mit `OPENAI_API_KEY` antworte ich als Fach-Experte.)*\n\n" + reply;
    }
    return new Response(streamText(reply), {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Workforce-Mode": "demo" },
    });
  }

  const systemContent = override
    ? override
    : systemPromptFor(agentId) + graphsSection(graphs) + (expertise ? `\n\n${expertise}` : "");

  // Hard cap: if OpenAI doesn't even start responding in time, fail fast with a
  // clear message instead of hanging until the platform timeout. `.trim()`
  // guards against a stray space/newline in a pasted key.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  let upstream: Response;
  try {
    upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        stream: true,
        max_tokens: 1200,
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
      }),
      signal: ctrl.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    const aborted = (err as Error)?.name === "AbortError";
    const msg = aborted
      ? "⚠️ Zeitüberschreitung: OpenAI hat nicht geantwortet. Das liegt fast immer am OpenAI-Konto – bitte prüfe, ob im Konto (und im jeweiligen Projekt) Guthaben verfügbar ist und die Nutzungslimits nicht auf 0 stehen."
      : "⚠️ Verbindung zur KI fehlgeschlagen. Bitte in einem Moment erneut versuchen.";
    return new Response(msg, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Workforce-Mode": "error" } });
  }
  clearTimeout(timer);

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return new Response(`⚠️ OpenAI-Fehler ${upstream.status}: ${detail.slice(0, 300)}`, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Workforce-Mode": "error" },
    });
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
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Workforce-Mode": "live",
      // Stream tokens immediately instead of letting a proxy buffer them.
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
