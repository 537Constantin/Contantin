"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Branded loading screen shown on the app's initial load (and the home-screen
 * launch). Server-rendered so it's painted immediately — no black/white flash —
 * then fades out after a short, animated progress bar. It does not reappear on
 * client-side navigation (the app shell persists for the session).
 */
export function SplashScreen() {
  const [hiding, setHiding] = React.useState(false);
  const [gone, setGone] = React.useState(false);

  React.useEffect(() => {
    const t = window.setTimeout(() => setHiding(true), 1400);
    return () => window.clearTimeout(t);
  }, []);

  React.useEffect(() => {
    if (!hiding) return;
    const t = window.setTimeout(() => setGone(true), 560);
    return () => window.clearTimeout(t);
  }, [hiding]);

  if (gone) return null;

  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-500 [transition-timing-function:var(--ease-lux)]",
        hiding && "pointer-events-none opacity-0",
      )}
      style={{
        background:
          "radial-gradient(120% 88% at 50% 30%, #18203a 0%, #0a0e1a 58%, #070a12 100%)",
      }}
    >
      {/* Logo + wordmark */}
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <div style={{ filter: "drop-shadow(0 6px 30px rgba(74,150,230,0.45))" }}>
          <TeamLogo className="h-28 w-28" />
        </div>

        <h1 className="mt-6 font-display text-[2.6rem] font-bold leading-none tracking-tight">
          <span style={{ color: "#f7f8fb" }}>Smart</span>
          <span
            style={{
              backgroundImage: "linear-gradient(95deg, #46dccb 0%, #5b8cf0 50%, #9b7cf6 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Staff
          </span>
        </h1>
        <p className="mt-2 text-sm" style={{ color: "#8a93ad" }}>
          KI-Mitarbeiter. Für Ihr Unternehmen.
        </p>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-[15%] flex w-full flex-col items-center gap-3">
        <div
          className="h-1.5 w-56 overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: "100%",
              background: "linear-gradient(90deg, #46dccb 0%, #5b8cf0 52%, #9b7cf6 100%)",
              boxShadow: "0 0 16px rgba(91,140,240,0.65)",
              animation: "loadbar 1.35s var(--ease-lux) forwards",
            }}
          />
        </div>
        <p className="text-xs" style={{ color: "#7c87a1" }}>
          Wird geladen …
        </p>
      </div>
    </div>
  );
}

/** The three-people team mark (teal / blue / purple), centered glow. */
function TeamLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ss-teal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#46dccb" />
          <stop offset="1" stopColor="#1fb4c6" />
        </linearGradient>
        <linearGradient id="ss-blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b9bf4" />
          <stop offset="1" stopColor="#3a5fe0" />
        </linearGradient>
        <linearGradient id="ss-purple" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a182f7" />
          <stop offset="1" stopColor="#7a4ad4" />
        </linearGradient>
      </defs>
      <g transform="translate(50 50) scale(0.84) translate(-50 -53)">
        <g fill="url(#ss-teal)">
          <circle cx="27" cy="45" r="9.5" />
          <path d="M11 82 A17 21 0 0 1 45 82 Z" />
        </g>
        <g fill="url(#ss-purple)">
          <circle cx="73" cy="45" r="9.5" />
          <path d="M55 82 A17 21 0 0 1 89 82 Z" />
        </g>
        <g fill="url(#ss-blue)" stroke="#0a0e1a" strokeWidth="2.4" strokeLinejoin="round">
          <circle cx="50" cy="38" r="12.5" />
          <path d="M27 80 A23 27 0 0 1 73 80 Z" />
        </g>
      </g>
    </svg>
  );
}
