"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/site/theme-toggle";

const links = [
  { href: "#features", label: "Funktionen" },
  { href: "#agents", label: "KI-Mitarbeiter" },
  { href: "#how", label: "So funktioniert's" },
  { href: "#pricing", label: "Preise" },
];

export function MarketingNav() {
  const [open, setOpen] = React.useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-3 flex w-full max-w-6xl items-center justify-between gap-4 rounded-full border border-border glass px-3 py-2 sm:px-4">
        <Link href="/" className="flex items-center gap-2 pl-1">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,var(--color-accent),var(--color-cyan))] shadow-[var(--shadow-glow)]">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-ink">
            Workforce<span className="text-gradient-brand"> OS</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="rounded-full px-3.5 py-1.5 text-sm text-ink-soft transition-colors hover:bg-surface-soft hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden sm:block"><ThemeToggle /></div>
          <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
            <Link href="/dashboard">Dashboard öffnen</Link>
          </Button>
          <button onClick={() => setOpen((v) => !v)} className="grid h-9 w-9 place-items-center rounded-full text-ink md:hidden" aria-label="Menü">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mx-auto mt-2 w-[calc(100%-1.5rem)] max-w-6xl rounded-2xl border border-border glass p-3 md:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm text-ink-soft hover:bg-surface-soft">
              {l.label}
            </a>
          ))}
          <Button asChild variant="accent" size="sm" className="mt-2 w-full">
            <Link href="/dashboard">Dashboard öffnen</Link>
          </Button>
        </div>
      )}
    </header>
  );
}
