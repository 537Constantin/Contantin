/**
 * Lightweight tap feedback. Uses the web Vibration API where available
 * (most Android browsers). On iOS Safari the API isn't exposed, so this is a
 * harmless no-op — kept tiny on purpose. If a native Capacitor wrapper is added
 * later, swap the body for @capacitor/haptics.
 */
export function tapHaptic(pattern: number | number[] = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore — feedback is best-effort */
    }
  }
}
