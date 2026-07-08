"use client";

import * as React from "react";
import { User, Cpu, CreditCard, Bell, Shield, Check, Loader2, Database } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { resetConsent } from "@/components/site/cookie-consent";
import { plans, getPlan, loadCurrentPlanId, isPurchasable, type PlanId } from "@/lib/billing";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "general", label: "Allgemein", icon: User },
  { key: "ai", label: "KI & Modelle", icon: Cpu },
  { key: "billing", label: "Abrechnung", icon: CreditCard },
  { key: "notifications", label: "Benachrichtigungen", icon: Bell },
  { key: "security", label: "Sicherheit", icon: Shield },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function SettingsPage() {
  const [tab, setTab] = React.useState<TabKey>("general");

  return (
    <PageShell>
      <PageHeader title="Einstellungen" description="Konfiguriere Workspace, KI-Modelle, Abrechnung und Sicherheit." />

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <nav className="flex gap-1 overflow-x-auto lg:w-56 lg:flex-col">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  tab === t.key ? "bg-surface-soft text-ink" : "text-ink-soft hover:bg-surface-soft hover:text-ink",
                )}
              >
                <Icon className={cn("h-4 w-4", tab === t.key ? "text-accent" : "text-muted")} />
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1">
          {tab === "general" && <GeneralTab />}
          {tab === "ai" && <AiTab />}
          {tab === "billing" && <BillingTab />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "security" && <SecurityTab />}
        </div>
      </div>
    </PageShell>
  );
}

function Field({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        defaultValue={value}
        className="h-11 w-full rounded-xl border border-border bg-surface-soft/50 px-3.5 text-sm text-ink focus:border-accent/40 focus:bg-surface focus:outline-none"
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function GeneralTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Unternehmensname" value="Constantin GmbH" />
          <Field label="Domain" value="constantin.workforce-os.app" hint="Wird für Team-Einladungen verwendet." />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Zeitzone" value="Europe/Berlin" />
            <Field label="Sprache" value="Deutsch" />
          </div>
          <div className="flex justify-end">
            <Button variant="accent" size="sm"><Check className="h-4 w-4" /> Speichern</Button>
          </div>
        </CardContent>
      </Card>
      <DatabaseCard />
    </div>
  );
}

function DatabaseCard() {
  const [status, setStatus] = React.useState<{ configured: boolean; connected: boolean } | null>(null);

  React.useEffect(() => {
    fetch("/api/db/status")
      .then((r) => r.json())
      .then((d) => setStatus({ configured: Boolean(d.configured), connected: Boolean(d.connected) }))
      .catch(() => setStatus({ configured: false, connected: false }));
  }, []);

  const state =
    status === null ? "loading" : status.connected ? "ok" : status.configured ? "error" : "off";

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="inline-flex items-center gap-2"><Database className="h-4 w-4 text-muted" /> Datenbank &amp; Speicher</span>
        </CardTitle>
        <Badge variant={state === "ok" ? "success" : state === "error" ? "warning" : "default"}>
          {state === "loading" ? "…" : state === "ok" ? "Verbunden" : state === "error" ? "Nicht erreichbar" : "Demo (nur lokal)"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-ink-soft">
        {state === "ok" && (
          <p>Workflows, Dokumente und Diagramme werden dauerhaft in der Datenbank gespeichert – auch geräteübergreifend.</p>
        )}
        {(state === "off" || state === "loading") && (
          <p>
            Deine Daten liegen aktuell nur in diesem Browser. Setze <code className="rounded bg-surface-soft px-1.5 py-0.5 text-xs">DATABASE_URL</code> (z. B. kostenloses Vercel Postgres / Neon), um sie dauerhaft und geräteübergreifend zu speichern.
          </p>
        )}
        {state === "error" && (
          <p className="text-warning">
            <code className="rounded bg-surface-soft px-1.5 py-0.5 text-xs">DATABASE_URL</code> ist gesetzt, aber die Datenbank ist nicht erreichbar. Bis dahin nutzt die App weiter den lokalen Speicher.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function AiTab() {
  const models = [
    { name: "GPT-4o", provider: "OpenAI", desc: "Schnell & multimodal — Standard für Echtzeit-Aufgaben", active: true },
    { name: "Claude Opus 4.7", provider: "Anthropic", desc: "Tiefe Analyse, lange Kontexte, Beratung", active: true },
    { name: "GPT-4o mini", provider: "OpenAI", desc: "Kostengünstig für hohe Volumina (Support)", active: true },
    { name: "Claude Sonnet 4.6", provider: "Anthropic", desc: "Ausgewogen für Reporting & Daten", active: false },
  ];
  return (
    <div className="space-y-4">
      <AiKeyCard />
      <Card>
        <CardHeader>
          <CardTitle>Verfügbare Modelle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {models.map((m) => (
            <div key={m.name} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink">{m.name}</p>
                  <Badge variant="outline">{m.provider}</Badge>
                </div>
                <p className="text-sm text-muted">{m.desc}</p>
              </div>
              <Badge variant={m.active ? "success" : "default"}>{m.active ? "Aktiv" : "Inaktiv"}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/** Live source of truth for the OpenAI connection (no secret leaves the server). */
function AiKeyCard() {
  const [status, setStatus] = React.useState<{ openai: boolean; model: string } | null>(null);

  React.useEffect(() => {
    fetch("/api/ai/status")
      .then((r) => r.json())
      .then((d) => setStatus({ openai: Boolean(d.openai), model: String(d.model ?? "gpt-4o-mini") }))
      .catch(() => setStatus({ openai: false, model: "gpt-4o-mini" }));
  }, []);

  const state = status === null ? "loading" : status.openai ? "ok" : "off";

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="inline-flex items-center gap-2"><Cpu className="h-4 w-4 text-muted" /> KI-Verbindung (OpenAI)</span>
        </CardTitle>
        <Badge variant={state === "ok" ? "success" : state === "off" ? "warning" : "default"}>
          {state === "loading" ? "…" : state === "ok" ? "Live-KI aktiv" : "Demo-Modus"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-ink-soft">
        {state === "ok" && (
          <p>
            Live-Modus aktiv. Chat, Workflows und Spezialisierungen nutzen das echte Modell{" "}
            <code className="rounded bg-surface-soft px-1.5 py-0.5 text-xs">{status?.model}</code>.
          </p>
        )}
        {(state === "off" || state === "loading") && (
          <p>
            Aktuell im Demo-Modus. Setze die Umgebungsvariable{" "}
            <code className="rounded bg-surface-soft px-1.5 py-0.5 text-xs">OPENAI_API_KEY</code> in Vercel
            (Project → Settings → Environment Variables) und deploye neu, um echte KI-Antworten zu aktivieren.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function BillingTab() {
  const [live, setLive] = React.useState<boolean | null>(null);
  const [currentId, setCurrentId] = React.useState<PlanId>("growth");
  const [portalMsg, setPortalMsg] = React.useState<string | null>(null);
  const [portalLoading, setPortalLoading] = React.useState(false);

  React.useEffect(() => {
    setCurrentId(loadCurrentPlanId() ?? "growth");
    fetch("/api/billing/status")
      .then((r) => r.json())
      .then((d) => setLive(Boolean(d.live)))
      .catch(() => setLive(false));
  }, []);

  const current = getPlan(currentId) ?? plans[1];

  async function manageSubscription() {
    setPortalLoading(true);
    setPortalMsg(null);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = (await res.json().catch(() => null)) as
        | { url?: string; message?: string; error?: string }
        | null;
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setPortalMsg(data?.message ?? data?.error ?? "Abo-Verwaltung derzeit nicht verfügbar.");
    } catch {
      setPortalMsg("Netzwerkfehler – bitte erneut versuchen.");
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Aktueller Plan</CardTitle>
          <Badge variant={live ? "success" : "warning"}>
            {live === null ? "…" : live ? "Live-Zahlungen" : "Demo-Modus"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display text-2xl font-bold text-ink">{current.name}</p>
              <p className="mt-0.5 text-sm text-muted">
                {current.priceLabel}
                {current.price != null && " / Monat"} · {current.agents}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={manageSubscription} disabled={portalLoading}>
              {portalLoading && <Loader2 className="h-4 w-4 animate-spin" />} Abo verwalten
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted">Die Nutzungsmessung (verbrauchte KI-Aktionen) wird mit der Datenbank- und Abrechnungs-Anbindung aktiviert.</p>
          {portalMsg && (
            <p className="mt-3 rounded-lg bg-surface-soft/60 p-2.5 text-xs text-muted">{portalMsg}</p>
          )}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {plans.map((p) => {
          const isCurrent = p.id === currentId;
          return (
            <Card key={p.id} className={cn(isCurrent && "border-accent/40 ring-1 ring-accent/30")}>
              <CardContent className="p-5">
                <p className="font-display text-lg font-semibold text-ink">{p.name}</p>
                <p className="mt-1 font-display text-2xl font-bold text-ink">
                  {p.priceLabel}
                  {p.price != null && <span className="text-sm font-normal text-muted">/mo</span>}
                </p>
                <p className="mt-1 text-sm text-muted">{p.agents}</p>
                {isCurrent ? (
                  <Button variant="outline" size="sm" className="mt-4 w-full" disabled>
                    Aktueller Plan
                  </Button>
                ) : isPurchasable(p) ? (
                  <CheckoutButton planId={p.id} variant="accent" size="sm" className="mt-4 w-full">
                    Wechseln
                  </CheckoutButton>
                ) : (
                  <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                    <a href={p.contact}>Kontakt</a>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function NotificationsTab() {
  const items = [
    { k: "calls", label: "Anruf-Zusammenfassungen", desc: "E-Mail nach jedem entgegengenommenen Anruf", on: true },
    { k: "briefing", label: "Tägliches Briefing", desc: "Morgendliche Übersicht über offene Aufgaben", on: true },
    { k: "wf-errors", label: "Workflow-Fehler", desc: "Sofortige Benachrichtigung bei fehlgeschlagenen Runs", on: true },
    { k: "weekly", label: "Wöchentlicher Report", desc: "KPI-Report jeden Montag", on: true },
    { k: "product", label: "Produkt-Updates", desc: "Neue Funktionen & Verbesserungen", on: false },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Benachrichtigungen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.map((it) => (
          <Toggle key={it.k} storageKey={`workforce-os:notify:${it.k}`} label={it.label} desc={it.desc} defaultOn={it.on} />
        ))}
        <p className="pt-3 text-xs text-muted">Deine Auswahl wird gespeichert. Der tatsächliche E-Mail-Versand wird aktiv, sobald ein E-Mail-Dienst (Resend) eingerichtet ist.</p>
      </CardContent>
    </Card>
  );
}

function Toggle({ label, desc, defaultOn, storageKey }: { label: string; desc: string; defaultOn: boolean; storageKey?: string }) {
  const [on, setOn] = React.useState(defaultOn);
  React.useEffect(() => {
    if (!storageKey) return;
    try {
      const v = window.localStorage.getItem(storageKey);
      if (v != null) setOn(v === "1");
    } catch { /* ignore */ }
  }, [storageKey]);
  function toggle() {
    setOn((v) => {
      const next = !v;
      if (storageKey) {
        try { window.localStorage.setItem(storageKey, next ? "1" : "0"); } catch { /* ignore */ }
      }
      return next;
    });
  }
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-sm text-muted">{desc}</p>
      </div>
      <button
        onClick={toggle}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", on ? "bg-accent" : "bg-surface-soft")}
        role="switch"
        aria-checked={on}
        aria-label={label}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", on ? "translate-x-[22px]" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Authentifizierung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-ink-soft">
          <p>Login, Passwort-Reset, Zwei-Faktor-Authentifizierung und Google-/Apple-Login werden über den Auth-Anbieter (Clerk) bereitgestellt, sobald er eingerichtet ist.</p>
          <p className="text-xs text-muted">SSO (SAML) und IP-Allowlist sind für Enterprise geplant und derzeit nicht aktiv.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Datenschutz & Recht</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-ink-soft">
          <p>Die Verbindung ist per TLS verschlüsselt. Welche Daten zu welchem Zweck verarbeitet werden – einschließlich der KI-Verarbeitung über OpenAI – steht transparent in der Datenschutzerklärung.</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm"><a href="/datenschutz">Datenschutz</a></Button>
            <Button asChild variant="outline" size="sm"><a href="/impressum">Impressum</a></Button>
            <Button asChild variant="outline" size="sm"><a href="/agb">AGB</a></Button>
            <Button variant="outline" size="sm" onClick={() => { resetConsent(); window.location.reload(); }}>
              Cookie-Einstellungen ändern
            </Button>
          </div>
          <p className="text-xs text-muted">Hinweis: Zertifizierungen wie SOC 2 oder ISO 27001 bestehen derzeit nicht und werden daher nicht ausgewiesen.</p>
        </CardContent>
      </Card>
    </div>
  );
}
