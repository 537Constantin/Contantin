import { NextRequest, NextResponse } from "next/server";

/**
 * Real document intelligence via OpenAI.
 *
 * POST /api/documents/analyze
 *   { text }              -> { summary, keyFacts[], tags[], category }
 *   { text, question }    -> { answer }   (answered strictly from the document)
 *
 * Falls back to a simple, honest response when no OPENAI_API_KEY is set, so the
 * flow stays usable in demo mode.
 */
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_TEXT = 16000;

export async function POST(req: NextRequest) {
  let body: { text?: string; question?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Request" }, { status: 400 });
  }

  const text = (body.text ?? "").trim().slice(0, MAX_TEXT);
  const question = (body.question ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "Kein lesbarer Text im Dokument." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  // ── Q&A mode ──────────────────────────────────────────────────────────────
  if (question) {
    if (!apiKey) {
      return NextResponse.json({
        answer: "Demo-Modus: Ohne OPENAI_API_KEY kann ich die Frage nicht beantworten.",
        demo: true,
      });
    }
    const answer = await ask(
      apiKey,
      "Du beantwortest Fragen AUSSCHLIESSLICH auf Basis des folgenden Dokuments. Wenn die Antwort nicht im Dokument steht, sage das ehrlich und rate nicht. Antworte knapp und auf Deutsch.",
      `Dokument:\n"""${text}"""\n\nFrage: ${question}`,
      400,
    );
    if (answer.error) return NextResponse.json({ error: answer.error }, { status: 502 });
    return NextResponse.json({ answer: answer.content });
  }

  // ── Analysis mode ─────────────────────────────────────────────────────────
  if (!apiKey) {
    return NextResponse.json({
      summary: text.slice(0, 240) + (text.length > 240 ? " …" : ""),
      keyFacts: [],
      tags: [],
      category: "Allgemein",
      demo: true,
    });
  }

  const res = await ask(
    apiKey,
    "Du analysierst geschäftliche Dokumente (Verträge, Rechnungen, Briefe, Berichte) für ein KMU. Antworte AUSSCHLIESSLICH als JSON mit den Feldern: \"summary\" (2–4 Sätze, worum es geht), \"keyFacts\" (Array kurzer Stichpunkte: konkrete Zahlen, Beträge, Fristen, Namen, Vertragsdetails – nur was wirklich im Text steht), \"tags\" (3–5 kurze Schlagwörter), \"category\" (ein Wort, z. B. Vertrag, Rechnung, Bericht, Schreiben). Erfinde nichts.",
    `Analysiere dieses Dokument:\n"""${text}"""`,
    800,
    true,
  );
  if (res.error) return NextResponse.json({ error: res.error }, { status: 502 });

  let parsed: { summary?: string; keyFacts?: string[]; tags?: string[]; category?: string } = {};
  try {
    parsed = JSON.parse(res.content);
  } catch {
    parsed = { summary: res.content };
  }

  return NextResponse.json({
    summary: (parsed.summary ?? "").trim() || "(Keine Zusammenfassung erzeugt.)",
    keyFacts: Array.isArray(parsed.keyFacts) ? parsed.keyFacts.slice(0, 12).map(String) : [],
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 6).map(String) : [],
    category: (parsed.category ?? "Allgemein").toString().trim() || "Allgemein",
  });
}

/** One OpenAI chat call with a hard timeout. Returns { content } or { error }. */
async function ask(
  apiKey: string,
  system: string,
  user: string,
  maxTokens: number,
  json = false,
): Promise<{ content: string; error?: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45000);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        max_tokens: maxTokens,
        ...(json ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { content: "", error: `OpenAI-Fehler ${res.status}: ${detail.slice(0, 160)}` };
    }
    const jsonRes = (await res.json().catch(() => null)) as
      | { choices?: { message?: { content?: string } }[] }
      | null;
    return { content: (jsonRes?.choices?.[0]?.message?.content ?? "").trim() };
  } catch (err) {
    clearTimeout(timer);
    const aborted = (err as Error)?.name === "AbortError";
    return {
      content: "",
      error: aborted ? "Zeitüberschreitung – bitte erneut versuchen." : "Verbindung zur KI fehlgeschlagen.",
    };
  }
}
