import { NextRequest, NextResponse } from "next/server";

/**
 * Drafts a German business email from a short brief, via OpenAI.
 *
 * POST /api/email/draft  { brief, tone?, recipientName?, senderName? }
 *   -> { subject, body }
 *
 * Falls back to a simple template when no OPENAI_API_KEY is configured, so the
 * flow stays usable in demo mode.
 */
export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let body: { brief?: string; tone?: string; recipientName?: string; senderName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Request" }, { status: 400 });
  }

  const brief = (body.brief ?? "").trim();
  const tone = (body.tone ?? "professionell").trim();
  const recipientName = (body.recipientName ?? "").trim();
  const senderName = (body.senderName ?? "").trim();

  if (!brief) {
    return NextResponse.json({ error: "Bitte beschreibe kurz, worum es in der E-Mail geht." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  // Demo fallback: a clean, usable template without AI.
  if (!apiKey) {
    const anrede = recipientName ? `Hallo ${recipientName},` : "Hallo,";
    const gruss = senderName ? `Beste Grüße\n${senderName}` : "Beste Grüße";
    return NextResponse.json({
      subject: brief.length > 60 ? brief.slice(0, 57) + "…" : brief,
      body: `${anrede}\n\n${brief}\n\n${gruss}`,
      demo: true,
    });
  }

  const system =
    "Du schreibst professionelle, klare deutsche Geschäfts-E-Mails. Antworte AUSSCHLIESSLICH als JSON mit den Feldern \"subject\" (kurzer, konkreter Betreff) und \"body\" (vollständige E-Mail mit Anrede, Fließtext in Absätzen und Grußformel). Keine Platzhalter in eckigen Klammern, keine Erklärungen außerhalb des JSON.";

  const userMsg = [
    `Anliegen: ${brief}`,
    recipientName ? `Empfänger: ${recipientName}` : "",
    senderName ? `Absender: ${senderName}` : "",
    `Tonalität: ${tone}`,
  ]
    .filter(Boolean)
    .join("\n");

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        max_tokens: 700,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
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
    return NextResponse.json({ error: `OpenAI-Fehler ${res.status}: ${detail.slice(0, 200)}` }, { status: 502 });
  }

  const json = (await res.json().catch(() => null)) as
    | { choices?: { message?: { content?: string } }[] }
    | null;
  const content = json?.choices?.[0]?.message?.content ?? "";
  let parsed: { subject?: string; body?: string } = {};
  try {
    parsed = JSON.parse(content);
  } catch {
    // Model didn't return clean JSON — use the raw text as the body.
    parsed = { subject: brief.slice(0, 60), body: content.trim() };
  }

  return NextResponse.json({
    subject: (parsed.subject ?? "").trim() || brief.slice(0, 60),
    body: (parsed.body ?? "").trim() || "(Kein Text erzeugt – bitte erneut versuchen.)",
  });
}
