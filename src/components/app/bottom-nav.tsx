"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { LayoutDashboard, Inbox, CalendarDays, ReceiptText, Menu, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { tapHaptic } from "@/lib/haptics";

const items: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Start", href: "/dashboard", icon: LayoutDashboard },
  { label: "Posteingang", href: "/inbox", icon: Inbox },
  { label: "Kalender", href: "/calendar", icon: CalendarDays },
  { label: "Belege", href: "/receipts", icon: ReceiptText },
];

/**
 * App-native bottom tab bar for phones / iPad-portrait. Hidden on large screens
 * where the sidebar takes over. The "Mehr" button opens the full slide-in menu.
 */
export function BottomNav({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="glass pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border lg:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => tapHaptic()}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 px-1 pb-2 pt-3 text-[11px] font-medium transition-colors",
                active ? "text-ink" : "text-muted",
              )}
            >
              {active && (
                <motion.span
                  layoutId="bottom-nav-active"
                  className="absolute top-0 h-0.5 w-8 rounded-full bg-[linear-gradient(90deg,var(--color-accent),var(--color-cyan))]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "h-[22px] w-[22px] transition-transform duration-200 [transition-timing-function:var(--ease-lux)]",
                  active && "scale-110",
                )}
              />
              <span>{it.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => {
            tapHaptic();
            onMenu();
          }}
          className="flex flex-1 flex-col items-center gap-1 px-1 pb-2 pt-3 text-[11px] font-medium text-muted transition-colors active:text-ink"
        >
          <Menu className="h-[22px] w-[22px]" />
          <span>Mehr</span>
        </button>
      </div>
    </nav>
  );
}
