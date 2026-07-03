/**
 * Client-side sync for user data. Reads/writes the database via /api/store when
 * one is configured, and always keeps a localStorage copy as a cache + offline
 * fallback. When no database is set up, behaviour is identical to before:
 * pure localStorage.
 *
 * Pages use loadItems/saveItems; the existing per-feature localStorage helpers
 * (loadGraphs, loadUserDocuments, …) stay as the local layer and are kept fresh
 * by saveItems, so incidental readers (e.g. the chat) keep working too.
 */
export type StoreKind = "workflow" | "document" | "graph" | "call" | "phone" | "run" | "specialization" | "task" | "event" | "push" | "receipt";

const LOCAL_KEY: Record<StoreKind, string> = {
  workflow: "workforce-os:workflows",
  document: "workforce-os:documents",
  graph: "workforce-os:graphs",
  call: "workforce-os:calls",
  phone: "workforce-os:phone",
  run: "workforce-os:runs",
  specialization: "workforce-os:specializations",
  task: "workforce-os:tasks",
  event: "workforce-os:events",
  push: "workforce-os:push",
  receipt: "workforce-os:receipts",
};

/** Remembered after the first load so saves can skip the network when off. */
let enabledCache: boolean | null = null;

function readLocal<T>(kind: StoreKind): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY[kind]);
    const parsed = raw ? (JSON.parse(raw) as T[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal<T>(kind: StoreKind, items: T[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_KEY[kind], JSON.stringify(items));
  } catch {
    /* storage full or unavailable */
  }
}

// Bumped to v2 when storage became per-user: this makes the one-time migration
// re-run once, lifting any data cached locally under the old shared scope into
// the signed-in user's own scope (so nothing appears to vanish on upgrade).
const migratedFlag = (kind: StoreKind) => `workforce-os:migrated:v2:${kind}`;

async function pushItems<T>(kind: StoreKind, items: T[]): Promise<boolean> {
  try {
    const res = await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, items }),
    });
    const json = await res.json().catch(() => null);
    return Boolean(json?.ok);
  } catch {
    return false;
  }
}

export async function loadItems<T>(kind: StoreKind): Promise<T[]> {
  const local = readLocal<T>(kind);
  if (typeof window === "undefined") return local;
  try {
    const res = await fetch(`/api/store?kind=${kind}`, { cache: "no-store" });
    const json = await res.json().catch(() => null);
    if (!json?.enabled) {
      enabledCache = false;
      return local;
    }
    enabledCache = true;
    const server = (json.items ?? []) as T[];

    // First time a DB is connected: lift any existing local data into it so the
    // user doesn't "lose" what they made before (runs once per kind).
    if (server.length === 0 && local.length > 0 && !window.localStorage.getItem(migratedFlag(kind))) {
      await pushItems(kind, local);
      window.localStorage.setItem(migratedFlag(kind), "1");
      return local;
    }

    writeLocal(kind, server);
    return server;
  } catch {
    return local;
  }
}

export async function saveItems<T extends { id: string }>(kind: StoreKind, items: T[]): Promise<void> {
  writeLocal(kind, items); // always keep the local cache current
  if (enabledCache === false) return; // database off -> localStorage only
  void pushItems(kind, items);
}

/**
 * Wipe all locally cached user data + migration flags. Called when the signed-in
 * user changes (incl. sign-out) so one account's cached workflows/documents/
 * graphs can never flash for the next person on a shared device.
 */
export function clearLocalStoreCaches() {
  if (typeof window === "undefined") return;
  enabledCache = null;
  for (const kind of Object.keys(LOCAL_KEY) as StoreKind[]) {
    try {
      window.localStorage.removeItem(LOCAL_KEY[kind]);
      window.localStorage.removeItem(migratedFlag(kind));
    } catch {
      /* ignore */
    }
  }
}
