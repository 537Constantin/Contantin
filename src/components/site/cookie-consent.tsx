"use client";

import * as React from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const KEY = "smartstaff:cookie-consent:v1";

export type ConsentChoice = "all" | "necessary";

/** Read the stored consent choice (client only). */
export function getConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === "all" || raw === "necessary") return raw;
  } catch { /* ignore */ }
  return null;
}

/** Clear consent so the banner reappears (used by the settings reset button). */
export function resetConsent() {
  try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
}

/**
 * Cookie / privacy consent banner. Appears until the user makes a choice, so
 * they actively accept before using the app. We only use storage that is
 * technically necessary for the app to function; optional/analytics cookies are
 * not set unless the user consents here — which keeps this DSGVO-friendly.
 */
export function CookieConsent() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!getConsent()) setShow(true);
  }, []);

  function choose(choice: ConsentChoice) {
    try { window.localStorage.setItem(KEY, choice); } catch { /* ignore */ }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center" role="dialog" aria-modal="true" aria-label="Datenschutz und Cookies">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-5 shadow-2xl">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/12 text-accent">
            <Cookie className="h-5 w-5" />
          </span>
          <p className="font-display text-base font-semibold text-ink">Datenschutz & Cookies</p>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Wir verwenden nur <span className="font-medium text-ink">technisch notwendige</span> Speicherung,
          damit die App funktioniert (z. B. Login und deine Einstellungen). Optionale Cookies oder Tracking
          setzen wir nur mit deiner Einwilligung ein. Mit „Alle akzeptieren“ stimmst du auch optionalen
          Cookies zu. Details in unserer{" "}
          <Link href="/datenschutz" className="font-medium text-accent underline underline-offset-2">Datenschutzerklärung</Link>{" "}
          und den{" "}
          <Link href="/agb" className="font-medium text-accent underline underline-offset-2">Nutzungsbedingungen</Link>.
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            onClick={() => choose("all")}
            className="tap flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-canvas transition-opacity hover:opacity-90"
          >
            Alle akzeptieren
          </button>
          <button
            onClick={() => choose("necessary")}
            className="tap flex-1 rounded-xl border border-border bg-surface-soft/50 px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-soft"
          >
            Nur notwendige
          </button>
        </div>
      </div>
    </div>
  );
}
