"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, Bell, Command, CornerDownLeft } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { clerkEnabled } from "@/lib/auth";
import { navGroups } from "@/lib/nav";
import { activity } from "@/lib/data/activity";
import { formatRelativeTime, cn } from "@/lib/utils";

const allNavItems = navGroups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label })));
const NOTIFS_READ_KEY = "workforce-os:notifs-read";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState("");
  const [bellOpen, setBellOpen] = React.useState(false);
  const [unread, setUnread] = React.useState(false);

  // Unread dot persists across reloads until the user opens notifications.
  React.useEffect(() => {
    try {
      setUnread(!window.localStorage.getItem(NOTIFS_READ_KEY));
    } catch {
      setUnread(true);
    }
  }, []);

  // ⌘K / Ctrl+K focuses the search, like the hint shows.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const q = query.trim().toLowerCase();
  const results = q
    ? allNavItems.filter((i) => i.label.toLowerCase().includes(q) || i.group.toLowerCase().includes(q)).slice(0, 6)
    : [];

  function go(href: string) {
    setQuery("");
    inputRef.current?.blur();
    router.push(href);
  }

  function openBell() {
    setBellOpen((v) => !v);
    if (unread) {
      setUnread(false);
      try {
        window.localStorage.setItem(NOTIFS_READ_KEY, new Date().toISOString());
      } catch { /* ignore */ }
    }
  }

  return (
    <header className="sticky top-0 z-30 glass border-b border-border">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          onClick={onMenu}
          className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-surface-soft hover:text-ink lg:hidden"
          aria-label="Menü öffnen"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Command search */}
        <div className="relative hidden flex-1 sm:block sm:max-w-md">
          <label className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && results[0]) go(results[0].href);
                if (e.key === "Escape") { setQuery(""); inputRef.current?.blur(); }
              }}
              placeholder="Suchen oder Seite öffnen…"
              className="h-10 w-full rounded-full border border-border bg-surface-soft/60 pl-10 pr-16 text-sm text-ink placeholder:text-muted focus:border-accent/40 focus:bg-surface focus:outline-none"
            />
            <kbd className="absolute right-3 hidden items-center gap-0.5 rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] text-muted md:inline-flex">
              <Command className="h-3 w-3" />K
            </kbd>
          </label>

          {results.length > 0 && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setQuery("")} />
              <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-border bg-surface p-1.5 shadow-[var(--shadow-float)]">
                {results.map((r) => (
                  <button
                    key={r.href}
                    onClick={() => go(r.href)}
                    className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-surface-soft"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-soft text-muted">
                      <r.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{r.label}</span>
                      <span className="block truncate text-xs text-muted">{r.group}</span>
                    </span>
                    <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-1.5 sm:flex-none">
          <span className="mr-1 hidden items-center gap-1.5 rounded-full bg-success/12 px-2.5 py-1 text-xs font-medium text-success ring-1 ring-success/20 md:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-success" />
            Alle Systeme aktiv
          </span>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={openBell}
              className="relative grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-surface-soft hover:text-ink"
              aria-label="Benachrichtigungen"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unread && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />}
            </button>
            {bellOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setBellOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-float)]">
                  <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
                    <span className="text-sm font-semibold text-ink">Benachrichtigungen</span>
                    <Link
                      href="/dashboard"
                      onClick={() => setBellOpen(false)}
                      className="text-xs font-medium text-accent hover:underline"
                    >
                      Alle ansehen
                    </Link>
                  </div>
                  <ul className="max-h-80 overflow-y-auto p-1.5">
                    {activity.slice(0, 5).map((ev) => (
                      <li key={ev.id} className="flex gap-2.5 rounded-xl px-2.5 py-2 hover:bg-surface-soft/60">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent/70" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-snug text-ink">{ev.title}</p>
                          <p className="truncate text-xs text-muted">{ev.detail}</p>
                          <p className="mt-0.5 text-[11px] text-muted">{formatRelativeTime(ev.at)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          <ThemeToggle />
          {clerkEnabled ? (
            <div className="ml-1.5 grid place-items-center">
              <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
            </div>
          ) : (
            <Link
              href="/settings"
              className={cn("ml-1 flex items-center gap-2 rounded-full p-0.5 pr-2 hover:bg-surface-soft")}
              aria-label="Konto & Einstellungen"
            >
              <Avatar name="Constantin Weber" color="#7c6dff" size="sm" />
              <span className="hidden text-sm font-medium text-ink lg:block">Constantin</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
