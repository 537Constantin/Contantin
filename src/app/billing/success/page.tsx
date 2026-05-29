import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPlan } from "@/lib/billing";
import { ActivatePlan } from "./activate-plan";

export const metadata: Metadata = { title: "Abo aktiviert", robots: { index: false } };

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; demo?: string; session_id?: string }>;
}) {
  const sp = await searchParams;
  const plan = getPlan(sp.plan);
  const isDemo = sp.demo === "1" || !sp.session_id;

  return (
    <main className="grid min-h-screen place-items-center px-5 py-16">
      {plan && <ActivatePlan planId={plan.id} />}
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-border bg-surface p-8 text-center shadow-[var(--shadow-float)]">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/12 text-success ring-1 ring-success/25">
          <CheckCircle2 className="h-7 w-7" />
        </span>

        <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink">
          {isDemo ? "Demo-Buchung abgeschlossen" : "Willkommen an Bord!"}
        </h1>

        <p className="mt-2 text-sm text-muted">
          {plan ? (
            <>
              Dein Plan <span className="font-medium text-ink">{plan.name}</span> ist
              {isDemo ? " (im Demo-Modus) " : " "}aktiviert.
            </>
          ) : (
            "Deine Buchung wurde abgeschlossen."
          )}
        </p>

        {isDemo && (
          <div className="mt-4 rounded-xl border border-border bg-surface-soft/50 p-3 text-left">
            <Badge variant="warning" className="mb-2">
              <Sparkles className="h-3.5 w-3.5" /> Demo-Modus
            </Badge>
            <p className="text-xs text-muted">
              Es wurde keine echte Zahlung ausgeführt. Hinterlege <code className="text-ink">STRIPE_SECRET_KEY</code>{" "}
              und die Preis-IDs, um echte Abos über Stripe abzurechnen.
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <Button asChild variant="accent" className="w-full">
            <Link href="/dashboard">
              Zum Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link href="/settings">Abrechnung in den Einstellungen ansehen</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
