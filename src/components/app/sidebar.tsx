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
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            {group.label}
          </p>
          <ul className="space-y-px">
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
                      "group relative flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13.5px] font-medium transition-colors duration-150",
                      active
                        ? "bg-surface-soft text-ink"
                        : "text-ink-soft hover:bg-surface-soft/60 hover:text-ink",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute -left-3 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-ink"
                        transition={{ type: "spring", stiffness: 500, damping: 36 }}
                      />
                    )}
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        active ? "text-ink" : "text-muted group-hover:text-ink",
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-canvas">
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
    <Link href="/dashboard" className="flex items-center gap-2.5 px-5 py-4">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink">
        <Sparkles className="h-4 w-4 text-canvas" />
      </span>
      <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
        Workforce<span className="font-normal text-muted"> OS</span>
      </span>
    </Link>
  );
}

function WorkspaceSwitcher() {
  return (
    <div className="px-3 pb-3">
      <button className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-surface px-2.5 py-2 text-left shadow-[var(--shadow-soft)] transition-colors hover:bg-surface-soft/60">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-ink text-[10px] font-bold text-canvas">
          CW
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-ink">Constantin GmbH</span>
          <span className="block truncate text-[11px] text-muted">Enterprise</span>
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted" />
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
          <Plus className="h-4 w-4" /> Mitarbeiter einstellen
        </Link>
      </Button>
    </div>
  </div>
);

export function Sidebar() {
  return (
    <aside className="hidden w-[248px] shrink-0 border-r border-border bg-surface-soft/30 lg:block">
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
