import { NextRequest, NextResponse } from "next/server";

/**
 * KI-Tagesplanung: turns the day's calendar events (+ optional to-dos) into a
 * short, forward-looking day briefing — the core "AI employee plans your day"
 * capability. Uses OpenAI; falls back to a plain summary without a key.
 *
 * POST /api/day-plan
 *   { dateLabel, events: [{title, allDay, start, end, location}], todos? }
 *   -> { plan }  (markdown text)
 */
export const runtime = "nodejs";
export const maxDuration = 60;

interface EventIn {
  title?: string;
  allDay?: boolean;
  start?: string;
  end?: string;
  location?: string;
}

export async function POST(req: NextRequest) {
  let body: { dateLabel?: string; events?: EventIn[]; todos?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Request" }, { status: 400 });
  }

  const dateLabel = (body.dateLabel ?? "heute").trim();
  const events = Array.isArray(body.events) ? body.events : [];
  const todos = (body.todos ?? "").trim();

  const eventLines = events.length
    ? events
        .map((e) => {
          const time = e.allDay ? "ganztägig" : `${e.start ?? "?"}–${e.end ?? "?"}`;
          return `- ${time}: ${e.title ?? "(ohne Titel)"}${e.location ? ` (${e.location})` : ""}`;
        })
        .join("\n")
    : "(keine Termine)";

  const apiKey = process.env.OPENAI_API_KEY;

  // Demo fallback: honest, simple summary without AI.
  if (!apiKey) {
    const plan =
      `**Tagesübersicht für ${dateLabel}**\n\n` +
      (events.length ? `Du hast heute ${events.length} Termin(e):\n\n${eventLines}` : "Keine Termine eingetragen.") +
      (todos ? `\n\n**Deine To-dos:**\n${todos}` : "") +
      `\n\n_(Demo-Modus: Mit OPENAI_API_KEY erstelle ich hieraus einen echten, vorausschauenden Plan.)_`;
    return NextResponse.json({ plan, demo: true });
  }

  const system =
    "Du bist eine vorausschauende, selbstsichere Executive Assistant. Erstelle aus den Terminen und To-dos eine knappe, hilfreiche Tagesübersicht auf Deutsch. Struktur: (1) ein Satz Gesamteinschätzung des Tages, (2) die Termine chronologisch mit ganz kurzer Einordnung, (3) freie Zeitfenster zwischen den Terminen und ein konkreter Vorschlag, wofür man sie nutzt (z. B. für die To-dos), (4) klare Warnung bei Überschneidungen oder sehr knappen Übergängen (< 15 Min), (5) 1–2 konkrete Vorbereitungs-Tipps. Sei knapp und status-getrieben, keine Floskeln, kein Datenschutz-Geschwätz. Nutze Markdown (Fett für Überschriften, Listen).";

  const user =
    `Datum: ${dateLabel}\n\nTermine:\n${eventLines}` +
    (todos ? `\n\nWeitere To-dos für den Tag:\n${todos}` : "");

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45000);
  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        max_tokens: 700,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: ctrl.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    const aborted = (err as Error)?.name === "AbortError";
    return NextResponse.json(
      { error: aborted ? "Zeitüberschreitung – bitte erneut versuchen." : "Verbindung zur KI fehlgeschlagen." },
      { status: 502 },
    );
  }
  clearTimeout(timer);

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json({ error: `OpenAI-Fehler ${res.status}: ${detail.slice(0, 160)}` }, { status: 502 });
  }

  const json = (await res.json().catch(() => null)) as
    | { choices?: { message?: { content?: string } }[] }
    | null;
  const plan = (json?.choices?.[0]?.message?.content ?? "").trim() || "(Kein Plan erzeugt – bitte erneut versuchen.)";
  return NextResponse.json({ plan });
}
