"use client";

import * as React from "react";
import { initNative } from "@/lib/native";

/** Runs the one-time Capacitor setup on mount. No-op on the web. */
export function NativeInit() {
  React.useEffect(() => {
    void initNative();
  }, []);
  return null;
}
