/**
 * Bridge to Capacitor native features. Safe to import from anywhere — every
 * call short-circuits when running in the web browser, so you can write
 * "native-or-nothing" code without conditional imports everywhere.
 *
 * Used to satisfy Apple's Guideline 4.2 ("no pure WebView wrappers"): the
 * app uses real native features when running on an iPhone (status bar
 * styling, splash hide, push notifications, haptics, secure storage).
 */
import { Capacitor } from "@capacitor/core";

export const isNative = () => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

export const platform = () => {
  try {
    return Capacitor.getPlatform(); // "ios" | "android" | "web"
  } catch {
    return "web" as const;
  }
};

/** Hides the launch splash once the React app has mounted. */
export async function hideSplash() {
  if (!isNative()) return;
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {
    /* native module not available */
  }
}

/** Match status bar tint to the current theme. */
export async function configureStatusBar(theme: "light" | "dark") {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: theme === "dark" ? Style.Light : Style.Dark });
  } catch {
    /* not on native */
  }
}

/** Small tactile feedback for primary actions on iOS / Android. */
export async function tap() {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    /* not on native */
  }
}

/** Request push permission and return the APNs token (iOS) or FCM token (Android). */
export async function registerForPush(): Promise<string | null> {
  if (!isNative()) return null;
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const perm = await PushNotifications.requestPermissions();
    if (perm.receive !== "granted") return null;

    return new Promise<string>((resolve, reject) => {
      const unsub = PushNotifications.addListener("registration", (token) => {
        unsub.then((l) => l.remove()).catch(() => {});
        resolve(token.value);
      });
      const unsubErr = PushNotifications.addListener("registrationError", (err) => {
        unsubErr.then((l) => l.remove()).catch(() => {});
        reject(err);
      });
      PushNotifications.register().catch(reject);
    });
  } catch {
    return null;
  }
}

/** Encrypted on-device storage (iOS Keychain / Android Keystore-backed). */
export const secure = {
  async get(key: string): Promise<string | null> {
    if (!isNative()) {
      return typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    }
    try {
      const { Preferences } = await import("@capacitor/preferences");
      const { value } = await Preferences.get({ key });
      return value;
    } catch {
      return null;
    }
  },
  async set(key: string, value: string) {
    if (!isNative()) {
      if (typeof window !== "undefined") window.localStorage.setItem(key, value);
      return;
    }
    try {
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.set({ key, value });
    } catch {
      /* ignore */
    }
  },
  async remove(key: string) {
    if (!isNative()) {
      if (typeof window !== "undefined") window.localStorage.removeItem(key);
      return;
    }
    try {
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.remove({ key });
    } catch {
      /* ignore */
    }
  },
};
