"use client";

import * as React from "react";
import { Menu, Search, Bell, Command } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { clerkEnabled } from "@/lib/auth";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 glass border-b border-border">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <button
          onClick={onMenu}
          className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-soft hover:text-ink lg:hidden"
          aria-label="Menü öffnen"
        >
          <Menu className="h-5 w-5" />
        </button>

        <label className="relative hidden flex-1 items-center sm:flex sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-muted" />
          <input
            type="search"
            placeholder="Suchen — Mitarbeiter, Aufgaben, Befehle…"
            className="h-9 w-full rounded-lg border border-border bg-surface px-3 pl-9 pr-16 text-[13px] text-ink placeholder:text-muted focus:border-ink/30 focus:outline-none"
          />
          <kbd className="absolute right-2.5 hidden items-center gap-0.5 rounded-md border border-border bg-surface-soft px-1.5 py-0.5 text-[10px] font-medium text-muted md:inline-flex">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </label>

        <div className="flex flex-1 items-center justify-end gap-1 sm:flex-none">
          <span className="mr-2 hidden items-center gap-1.5 text-[11px] font-medium text-muted md:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-success" />
            Alle Systeme aktiv
          </span>
          <button
            className="relative grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-soft hover:text-ink"
            aria-label="Benachrichtigungen"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-ink ring-2 ring-surface" />
          </button>
          <ThemeToggle />
          {clerkEnabled ? (
            <div className="ml-1 grid place-items-center">
              <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
            </div>
          ) : (
            <button className="ml-1 flex items-center gap-2 rounded-lg p-0.5 pr-2 hover:bg-surface-soft" aria-label="Konto">
              <Avatar name="Constantin Weber" color="#7c6dff" size="sm" />
              <span className="hidden text-[13px] font-medium text-ink lg:block">Constantin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
