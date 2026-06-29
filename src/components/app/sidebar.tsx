"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, ChevronsUpDown, Plus } from "lucide-react";
import { navGroups } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-[color,background-color,transform] duration-200 [transition-timing-function:var(--ease-lux)] hover:translate-x-0.5",
                      active
                        ? "bg-surface-soft text-ink"
                        : "text-ink-soft hover:bg-surface-soft hover:text-ink",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[linear-gradient(180deg,var(--color-accent),var(--color-cyan))]"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-transform duration-300 [transition-timing-function:var(--ease-lux)] group-hover:scale-110",
                        active ? "text-accent" : "text-muted group-hover:text-ink",
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="group flex items-center gap-2.5 px-5 py-5">
      <span className="sheen relative grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--color-accent),var(--color-cyan))] shadow-[var(--shadow-glow)] transition-transform duration-300 [transition-timing-function:var(--ease-lux)] group-hover:scale-105">
        <Sparkles className="h-4.5 w-4.5 text-canvas transition-transform duration-500 group-hover:rotate-12" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-ink">
        Workforce<span className="text-gradient-brand"> OS</span>
      </span>
    </Link>
  );
}

function WorkspaceSwitcher() {
  return (
    <div className="px-3 pb-3">
      <button className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface-soft/60 px-3 py-2.5 text-left transition-colors hover:border-accent/30">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-xs font-bold text-canvas">
          CW
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">Constantin GmbH</span>
          <span className="block truncate text-xs text-muted">Enterprise · 5 Agenten</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted" />
      </button>
    </div>
  );
}

const SidebarInner = ({ onNavigate }: { onNavigate?: () => void }) => (
  <div className="flex h-full flex-col">
    <Brand />
    <WorkspaceSwitcher />
    <NavLinks onNavigate={onNavigate} />
    <div className="border-t border-border p-3">
      <Button asChild variant="accent" size="sm" className="w-full">
        <Link href="/employees?new=1" onClick={onNavigate}>
          <Plus className="h-4 w-4" /> Neuer KI-Mitarbeiter
        </Link>
      </Button>
    </div>
  </div>
);

export function Sidebar() {
  return (
    <aside className="relative z-10 hidden w-[264px] shrink-0 border-r border-border bg-surface/40 backdrop-blur-xl lg:block">
      <div className="sticky top-0 h-screen">
        <SidebarInner />
      </div>
    </aside>
  );
}

export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-border bg-surface lg:hidden"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-5 grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-soft hover:text-ink"
              aria-label="Menü schließen"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarInner onNavigate={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
