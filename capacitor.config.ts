import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor wrapper config.
 *
 * This app is a server-rendered Next.js app (API routes, Clerk auth, dynamic
 * data) and therefore can't be statically exported. Instead of bundling a
 * static build, the native shell loads the live deployment via `server.url`
 * and layers native capabilities (haptics, status bar, splash) on top. The
 * web app detects the native runtime through the injected `window.Capacitor`
 * global (see src/lib/native.ts) — so normal web visitors never load any
 * Capacitor code.
 *
 * To run a fully offline/bundled build later, switch to a static export and
 * point `webDir` at the export output instead of using `server.url`.
 */
const config: CapacitorConfig = {
  appId: "com.smartstaff.app",
  appName: "SmartStaff",
  webDir: "capacitor-www",
  server: {
    url: "https://contantin-aywb.vercel.app",
    cleartext: false,
  },
  ios: {
    contentInset: "always",
    backgroundColor: "#0a0e1a",
  },
  android: {
    backgroundColor: "#0a0e1a",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      backgroundColor: "#0a0e1a",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
  },
};

export default config;
