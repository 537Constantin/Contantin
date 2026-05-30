"use client";

import * as React from "react";
import { Sidebar, MobileSidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { StoreCacheGuard } from "@/components/app/store-cache-guard";
import { clerkEnabled } from "@/lib/auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-canvas">
      {clerkEnabled && <StoreCacheGuard />}
      <Sidebar />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
