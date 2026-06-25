import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor config for the iOS (and later Android) wrapper around the
 * AI Workforce OS web app.
 *
 * Production strategy:
 * - `server.url` points at the live Vercel deployment so every Vercel push
 *   reaches iOS users instantly without a new App Store review.
 * - `webDir` holds a tiny offline fallback that ships with the binary; the
 *   in-app WebView shows it only if the live URL is unreachable.
 * - Native plugins (Push, StatusBar, SplashScreen, Haptics, Preferences,
 *   Face ID via Preferences) satisfy Apple Guideline 4.2 by adding real
 *   native capabilities on top of the web app.
 */
const config: CapacitorConfig = {
  appId: "app.workforceos.ios",
  appName: "AI Workforce OS",
  webDir: "capacitor-www",
  server: {
    // Replace with your real production URL after deploy. Leave empty for
    // pure offline-bundled mode (then the static fallback in capacitor-www
    // is shown instead — useful for local development).
    url: process.env.CAPACITOR_SERVER_URL ?? "https://contantin.vercel.app",
    cleartext: false,
  },
  ios: {
    contentInset: "always",
    // Custom WebView scheme makes Apple's review parser see this as a real
    // iOS app, not a Safari shortcut.
    scheme: "WorkforceOS",
    backgroundColor: "#ffffff",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      iosSpinnerStyle: "small",
      spinnerColor: "#09090b",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#ffffff",
    },
  },
};

export default config;
