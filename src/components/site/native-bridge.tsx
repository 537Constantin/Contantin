"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { hideSplash, configureStatusBar, isNative } from "@/lib/native";

/**
 * Mounted once in the root layout. On the web this is a no-op. On native
 * (iOS / Android via Capacitor) it hides the launch splash after first
 * paint and keeps the status bar tint in sync with the user's theme.
 */
export function NativeBridge() {
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    if (!isNative()) return;
    // Hide the launch splash on the next frame so the React tree is rendered.
    const id = requestAnimationFrame(() => {
      void hideSplash();
    });
    return () => cancelAnimationFrame(id);
  }, []);

  React.useEffect(() => {
    if (!isNative()) return;
    void configureStatusBar(resolvedTheme === "dark" ? "dark" : "light");
  }, [resolvedTheme]);

  return null;
}
