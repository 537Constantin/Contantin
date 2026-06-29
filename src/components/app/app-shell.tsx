"use client";

import * as React from "react";
import { Sidebar, MobileSidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { StoreCacheGuard } from "@/components/app/store-cache-guard";
import { PageTransition, CursorGlow, ScrollProgress } from "@/components/motion/fx";
import { clerkEnabled } from "@/lib/auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="relative flex min-h-screen bg-canvas">
      {/* Ambient drifting backdrop + film grain — subtle, behind everything. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[18%] left-1/2 h-[72vh] w-[72vw] -translate-x-1/2 aurora animate-aurora" />
        <div className="absolute inset-0 noise opacity-[0.5]" />
      </div>

      {/* Top scroll progress + pointer-trailing glow */}
      <ScrollProgress />
      <CursorGlow />

      {clerkEnabled && <StoreCacheGuard />}
      <Sidebar />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
