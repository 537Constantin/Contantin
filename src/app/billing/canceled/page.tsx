import type { Metadata } from "next";
import Link from "next/link";
import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Checkout abgebrochen", robots: { index: false } };

export default function BillingCanceledPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-16">
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-border bg-surface p-8 text-center shadow-[var(--shadow-float)]">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-surface-soft text-ink-soft">
          <Undo2 className="h-7 w-7" />
        </span>

        <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink">
          Checkout abgebrochen
        </h1>
        <p className="mt-2 text-sm text-muted">
          Kein Problem – es wurde nichts berechnet. Du kannst jederzeit einen Plan wählen.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Button asChild variant="accent" className="w-full">
            <Link href="/#pricing">Preise ansehen</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link href="/dashboard">Zurück zum Dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
