/**
 * Tap feedback.
 *
 * - Native shell (iOS/Android): real haptics via @capacitor/haptics.
 * - Web (Android browsers): the Vibration API.
 * - iOS Safari: no API → harmless no-op.
 *
 * Capacitor plugins are imported lazily and only on the native runtime, so web
 * visitors never download them.
 */
import { isNativeApp } from "@/lib/native";

export async function tapHaptic(pattern: number | number[] = 8) {
  if (isNativeApp()) {
    try {
      const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
      await Haptics.impact({ style: ImpactStyle.Light });
      return;
    } catch {
      /* fall through to the web path */
    }
  }
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* best-effort */
    }
  }
}
