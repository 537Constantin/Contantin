/**
 * Client-side Web Push helpers: register the service worker, subscribe/
 * unsubscribe, and shape the subscription for storage. Subscriptions (one per
 * device) are persisted under the "push" store kind and read by the cron
 * (/api/notifications/cron) to send reminders.
 */

export interface StoredPushSub {
  id: string; // stable per endpoint
  endpoint: string;
  keys: { p256dh: string; auth: string };
  /** IANA timezone of this device, so the cron can time reminders correctly. */
  tz: string;
  createdAt: string;
}

export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function pushConfigured(): boolean {
  return VAPID_PUBLIC_KEY.length > 0;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function shortId(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return "sub-" + Math.abs(h).toString(36);
}

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration("/");
  return existing ?? (await navigator.serviceWorker.register("/sw.js", { scope: "/" }));
}

function toStored(sub: PushSubscription): StoredPushSub {
  const json = sub.toJSON();
  return {
    id: shortId(sub.endpoint),
    endpoint: sub.endpoint,
    keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" },
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Berlin",
    createdAt: new Date().toISOString(),
  };
}

/** Ask for permission and subscribe this device. Returns the stored shape. */
export async function enablePush(): Promise<StoredPushSub> {
  if (!pushSupported()) throw new Error("unsupported");
  if (!pushConfigured()) throw new Error("not-configured");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("denied");

  const reg = await getRegistration();
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });
  }
  return toStored(sub);
}

/** Unsubscribe this device. Returns the endpoint id that was removed (if any). */
export async function disablePush(): Promise<string | null> {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return null;
  const id = shortId(sub.endpoint);
  await sub.unsubscribe().catch(() => {});
  return id;
}

/** The id of this device's current subscription, or null. */
export async function currentSubId(): Promise<string | null> {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = await reg?.pushManager.getSubscription();
  return sub ? shortId(sub.endpoint) : null;
}
