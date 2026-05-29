import { NextRequest, NextResponse } from "next/server";
import { getPlan, isPurchasable, priceIdFor } from "@/lib/billing";

/**
 * Starts a subscription checkout.
 *
 * Demo mode (no STRIPE_SECRET_KEY): returns a link to the local success page so
 * the whole flow is clickable without any Stripe account.
 *
 * Live mode: creates a real Stripe Checkout Session via the REST API (same
 * fetch-based approach as the chat route, so no SDK dependency is needed) and
 * returns its hosted URL.
 */
export async function POST(req: NextRequest) {
  let planId: string | undefined;
  try {
    ({ planId } = await req.json());
  } catch {
    return NextResponse.json({ error: "Ungültiger Request" }, { status: 400 });
  }

  const plan = getPlan(planId);
  if (!plan) {
    return NextResponse.json({ error: "Unbekannter Plan" }, { status: 400 });
  }
  if (!isPurchasable(plan)) {
    return NextResponse.json(
      { error: "Dieser Plan läuft über den Vertrieb und kann nicht direkt gebucht werden." },
      { status: 400 },
    );
  }

  const base =
    req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const secret = process.env.STRIPE_SECRET_KEY;

  // Demo mode → no real payment, just walk the user through the success page.
  if (!secret) {
    return NextResponse.json({
      mode: "demo",
      url: `${base}/billing/success?plan=${plan.id}&demo=1`,
    });
  }

  const priceId = priceIdFor(plan);
  if (!priceId) {
    return NextResponse.json(
      {
        error: `Kein Stripe-Preis hinterlegt. Bitte ${plan.priceEnv} in den Environment-Variablen setzen.`,
      },
      { status: 500 },
    );
  }

  // Build the Checkout Session. To pre-fill the customer email and reuse a
  // Stripe customer, set them here once the persistence layer (Prisma) is wired.
  const form = new URLSearchParams();
  form.set("mode", "subscription");
  form.set("line_items[0][price]", priceId);
  form.set("line_items[0][quantity]", "1");
  form.set("allow_promotion_codes", "true");
  form.set("billing_address_collection", "auto");
  form.set("client_reference_id", plan.id);
  form.set("success_url", `${base}/billing/success?plan=${plan.id}&session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${base}/billing/canceled?plan=${plan.id}`);

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });

  const data = (await res.json().catch(() => null)) as { url?: string; error?: { message?: string } } | null;
  if (!res.ok || !data?.url) {
    return NextResponse.json(
      { error: data?.error?.message ?? "Stripe-Checkout konnte nicht gestartet werden." },
      { status: 502 },
    );
  }

  return NextResponse.json({ mode: "live", url: data.url });
}
