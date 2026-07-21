import { NextRequest, NextResponse } from "next/server";
import { toModerationResult } from "@/lib/moderation";

/**
 * Runs an image frame and/or chat text through OpenAI's omni-moderation model
 * (free) and returns a normalized safe/warning/blocked verdict with the
 * categories that triggered it.
 */
export const runtime = "nodejs";
export const maxDuration = 30;

interface OpenAIModerationResult {
  flagged: boolean;
  categories: Record<string, boolean>;
  category_scores: Record<string, number>;
}

export async function POST(req: NextRequest) {
  let body: { image?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Request" }, { status: 400 });
  }

  const image = (body.image ?? "").trim();
  const text = (body.text ?? "").trim().slice(0, 4000);
  if (!image && !text) return NextResponse.json({ error: "Kein Inhalt zum Prüfen." }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Demo-Modus: Ohne OPENAI_API_KEY keine Moderation.", demo: true }, { status: 400 });

  const input: unknown[] = [];
  if (text) input.push({ type: "text", text });
  if (image) input.push({ type: "image_url", image_url: { url: image } });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODERATION_MODEL ?? "omni-moderation-latest", input }),
      signal: ctrl.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    const aborted = (err as Error)?.name === "AbortError";
    return NextResponse.json({ error: aborted ? "Zeitüberschreitung." : "Verbindung zur Moderation fehlgeschlagen." }, { status: 502 });
  }
  clearTimeout(timer);

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json({ error: `Moderations-Fehler ${res.status}: ${detail.slice(0, 160)}` }, { status: 502 });
  }

  const json = (await res.json().catch(() => null)) as { results?: OpenAIModerationResult[] } | null;
  const r = json?.results?.[0];
  if (!r) return NextResponse.json({ error: "Kein Ergebnis." }, { status: 502 });

  return NextResponse.json(toModerationResult(r.categories ?? {}, r.category_scores ?? {}, Boolean(r.flagged)));
}
