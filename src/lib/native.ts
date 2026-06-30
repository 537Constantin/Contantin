/**
 * Capacitor native bridge.
 *
 * The web app is the SAME bundle whether it runs in a browser or inside the
 * native shell. To keep web visitors from ever loading Capacitor code, we
 * detect the native runtime via the injected `window.Capacitor` global and
 * only then dynamically import the plugins. On the web, `isNativeApp()` is
 * false and nothing here touches Capacitor.
 */

type CapacitorGlobal = { isNativePlatform?: () => boolean; getPlatform?: () => string };

function cap(): CapacitorGlobal | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
}

/** True only inside the Capacitor native shell (iOS / Android). */
export function isNativeApp(): boolean {
  return Boolean(cap()?.isNativePlatform?.());
}

/** "ios" | "android" | "web". */
export function nativePlatform(): string {
  return cap()?.getPlatform?.() ?? "web";
}

let initialized = false;

/**
 * One-time native setup: status-bar style, hide the splash screen once the web
 * app is ready, and make the Android hardware back button navigate history
 * instead of killing the app. Safe no-op on the web.
 */
export async function initNative(): Promise<void> {
  if (initialized || !isNativeApp()) return;
  initialized = true;

  try {
    const [{ StatusBar, Style }, { SplashScreen }, { App }] = await Promise.all([
      import("@capacitor/status-bar"),
      import("@capacitor/splash-screen"),
      import("@capacitor/app"),
    ]);

    // App uses a light canvas → dark status-bar content.
    try {
      await StatusBar.setStyle({ style: Style.Light });
    } catch {
      /* not supported on this platform */
    }

    try {
      await SplashScreen.hide();
    } catch {
      /* already hidden */
    }

    try {
      App.addListener("backButton", ({ canGoBack }: { canGoBack: boolean }) => {
        if (canGoBack) window.history.back();
      });
    } catch {
      /* no back button on this platform */
    }
  } catch {
    /* plugins unavailable — keep the web experience untouched */
  }
}
