"use client";

import * as React from "react";
import { useAuth } from "@clerk/nextjs";
import { clearLocalStoreCaches } from "@/lib/store-sync";

const UID_KEY = "workforce-os:uid";

/**
 * Clears locally cached user data whenever the signed-in user changes (including
 * sign-out). This prevents one account's cached workflows/documents/graphs from
 * briefly appearing for the next person who signs in on the same device.
 *
 * Only mounted when Clerk is configured, so `useAuth` always runs inside a
 * ClerkProvider.
 */
export function StoreCacheGuard() {
  const { isLoaded, userId } = useAuth();

  React.useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    const prev = window.localStorage.getItem(UID_KEY);
    const current = userId ?? "";
    if (prev !== null && prev !== current) {
      clearLocalStoreCaches();
    }
    window.localStorage.setItem(UID_KEY, current);
  }, [isLoaded, userId]);

  return null;
}
