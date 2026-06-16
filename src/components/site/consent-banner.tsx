"use client";

import * as React from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "workforce-os:consent";

/**
 * First-visit consent banner. Shown until the user accepts or declines, then
 * remembered in localStorage. The app only uses technically necessary local
 * storage (no tracking/advertising cookies), so this is an honest acknowledgement
 * of the privacy policy rather than a tracking opt-in.
 */
export function ConsentBanner() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    try {
      if (!window.localStorage.getItem(CONSENT_KEY)) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  function decide(choice: "accepted" | "declined") {
    try {
      window.localStorage.setItem(CONSENT_KEY, choice);
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4" role="dialog" aria-label="Datenschutz-Hinweis" aria-live="polite">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-2xl border border-border bg-surface/95 p-4 shadow-[var(--shadow-float)] backdrop-blur sm:flex-row sm:items-center">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
          <Cookie className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 text-sm text-ink-soft">
          <p>
            Wir verwenden nur <span className="font-medium text-ink">technisch notwendige</span> lokale Speicherung –
            keine Tracking- oder Werbe-Cookies. Für KI-Funktionen werden deine Eingaben an OpenAI übermittelt. Mit
            „Akzeptieren“ stimmst du der{" "}
            <Link href="/datenschutz" className="font-medium text-accent hover:underline">Datenschutzerklärung</Link> zu.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="sm" onClick={() => decide("declined")}>Ablehnen</Button>
          <Button variant="accent" size="sm" onClick={() => decide("accepted")}>Akzeptieren</Button>
        </div>
      </div>
    </div>
  );
}
