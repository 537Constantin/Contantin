"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Menu, Search, Bell, Command } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { clerkEnabled } from "@/lib/auth";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 glass border-b border-border"
    >
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          onClick={onMenu}
          className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-surface-soft hover:text-ink lg:hidden"
          aria-label="Menü öffnen"
        >
          <Menu className="h-5 w-5" />
        </button>

        <label className="relative hidden flex-1 items-center sm:flex sm:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted" />
          <input
            type="search"
            placeholder="Suchen oder Befehl ausführen…"
            className="h-10 w-full rounded-full border border-border bg-surface-soft/60 pl-10 pr-16 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none"
          />
          <kbd className="absolute right-3 hidden items-center gap-0.5 rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] text-muted md:inline-flex">
            <Command className="h-3 w-3" />K
          </kbd>
        </label>

        <div className="flex flex-1 items-center justify-end gap-1.5 sm:flex-none">
          <span className="mr-1 hidden items-center gap-1.5 rounded-full bg-success/12 px-2.5 py-1 text-xs font-medium text-success ring-1 ring-success/20 md:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-success" />
            Alle Systeme aktiv
          </span>
          <button
            className="relative grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-surface-soft hover:text-ink"
            aria-label="Benachrichtigungen"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />
          </button>
          <ThemeToggle />
          {clerkEnabled ? (
            <div className="ml-1.5 grid place-items-center">
              <UserButton
                appearance={{ elements: { avatarBox: "h-8 w-8" } }}
              />
            </div>
          ) : (
            <button className="ml-1 flex items-center gap-2 rounded-full p-0.5 pr-2 hover:bg-surface-soft" aria-label="Konto">
              <Avatar name="Constantin Weber" color="#7c6dff" size="sm" />
              <span className="hidden text-sm font-medium text-ink lg:block">Constantin</span>
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
