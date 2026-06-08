/** Reports whether the OpenAI key is configured (live mode) for the settings UI.
 * Returns only a boolean + the model name — never the key itself. */
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    openai: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  });
}
