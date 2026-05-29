import { NextRequest, NextResponse } from "next/server";

/**
 * Opens the Stripe Customer Portal so a subscriber can manage / cancel their
 * plan and update payment details.
 *
 * The portal needs a Stripe customer id, which only exists once a real payment
 * has been made and stored. Without the persistence layer there is nothing to
 * look it up by, so:
 *   - demo mode returns an explanatory note,
 *   - live mode creates the portal session when a customer id is supplied.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const base =
    req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  if (!secret) {
    return NextResponse.json({
      mode: "demo",
      message:
        "Demo-Modus: Es ist kein echtes Abo aktiv. Hinterlege STRIPE_SECRET_KEY, um das Stripe-Kundenportal zu öffnen.",
    });
  }

  let customerId: string | undefined;
  try {
    ({ customerId } = await req.json());
  } catch {
    /* body optional */
  }

  if (!customerId) {
    return NextResponse.json(
      {
        error:
          "Kein Stripe-Kunde verknüpft. Sobald die Datenbank angebunden ist, wird die Kunden-ID hier gespeichert und das Portal direkt geöffnet.",
      },
      { status: 400 },
    );
  }

  const form = new URLSearchParams();
  form.set("customer", customerId);
  form.set("return_url", `${base}/settings`);

  const res = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
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
      { error: data?.error?.message ?? "Kundenportal konnte nicht geöffnet werden." },
      { status: 502 },
    );
  }

  return NextResponse.json({ mode: "live", url: data.url });
}
