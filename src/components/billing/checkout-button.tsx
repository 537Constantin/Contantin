"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface CheckoutButtonProps extends Omit<ButtonProps, "asChild"> {
  planId: string;
  children: React.ReactNode;
}

/**
 * Kicks off a subscription checkout for the given plan. Works in both demo and
 * live mode — the API decides which — and redirects to the returned URL
 * (the local success page in demo, the hosted Stripe Checkout when live).
 */
export function CheckoutButton({ planId, children, ...buttonProps }: CheckoutButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!res.ok || !data?.url) {
        setError(data?.error ?? "Checkout konnte nicht gestartet werden.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Netzwerkfehler – bitte erneut versuchen.");
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={startCheckout} disabled={loading} {...buttonProps}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Button>
      {error && <p className="mt-2 text-center text-xs text-danger">{error}</p>}
    </>
  );
}
