"use client";

import * as React from "react";
import { Bell, BellRing, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  pushSupported, pushConfigured, enablePush, disablePush, currentSubId, type StoredPushSub,
} from "@/lib/push";
import { loadItems, saveItems } from "@/lib/store-sync";
import { tapHaptic } from "@/lib/haptics";

type State = "loading" | "unsupported" | "unconfigured" | "denied" | "off" | "on";

export function PushToggle() {
  const [state, setState] = React.useState<State>("loading");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    void (async () => {
      if (!pushSupported()) return setState("unsupported");
      if (!pushConfigured()) return setState("unconfigured");
      if (Notification.permission === "denied") return setState("denied");
      const id = await currentSubId();
      const subs = await loadItems<StoredPushSub>("push");
      setState(id && subs.some((s) => s.id === id) ? "on" : "off");
    })();
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const sub = await enablePush();
      const subs = await loadItems<StoredPushSub>("push");
      await saveItems("push", [...subs.filter((s) => s.id !== sub.id), sub]);
      tapHaptic(12);
      setState("on");
    } catch (e) {
      setState((e as Error).message === "denied" ? "denied" : "off");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const id = await disablePush();
      const subs = await loadItems<StoredPushSub>("push");
      await saveItems("push", id ? subs.filter((s) => s.id !== id) : subs);
      tapHaptic();
      setState("off");
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading") return null;

  if (state === "unsupported" || state === "unconfigured" || state === "denied") {
    const text =
      state === "unsupported"
        ? "Push wird auf diesem Gerät nicht unterstützt"
        : state === "denied"
          ? "Benachrichtigungen in den Geräte-Einstellungen erlauben"
          : "Push noch nicht eingerichtet (VAPID-Keys fehlen)";
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-soft px-2.5 py-1 text-xs text-muted" title={text}>
        <Bell className="h-3.5 w-3.5" /> {text}
      </span>
    );
  }

  if (state === "on") {
    return (
      <Button variant="outline" size="sm" onClick={disable} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4 text-accent" />}
        Erinnerungen an
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={enable} disabled={busy}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
      Erinnerungen aktivieren
    </Button>
  );
}
