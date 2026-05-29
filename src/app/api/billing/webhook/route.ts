import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

// Stripe needs the raw, unparsed body to verify the signature.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Verify Stripe's `Stripe-Signature` header against the raw payload.
 * Mirrors what the Stripe SDK does internally (HMAC-SHA256 over
 * `${timestamp}.${payload}`), so we don't need the SDK as a dependency.
 */
function verifySignature(payload: string, header: string, secret: string): boolean {
  const parts: Record<string, string> = {};
  for (const piece of header.split(",")) {
    const idx = piece.indexOf("=");
    if (idx > -1) parts[piece.slice(0, idx)] = piece.slice(idx + 1);
  }
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  // Nothing to process if Stripe isn't configured (demo mode).
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ received: true, mode: "demo" });
  }

  const payload = await req.text();
  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (signingSecret) {
    const header = req.headers.get("stripe-signature") ?? "";
    if (!verifySignature(payload, header, signingSecret)) {
      return NextResponse.json({ error: "Ungültige Signatur" }, { status: 400 });
    }
  }

  let event: { type?: string; data?: { object?: unknown } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Ungültiger Payload" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      // TODO: persist the subscription state here once Prisma is wired up
      // (see prisma/schema.prisma). The verified Stripe customer + plan would
      // be stored against the workspace so the UI reflects the real status.
      break;
    default:
      // Unhandled event types are acknowledged so Stripe stops retrying.
      break;
  }

  return NextResponse.json({ received: true });
}
