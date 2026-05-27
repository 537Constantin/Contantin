"use client";

import * as React from "react";
import { User, Cpu, CreditCard, Bell, Shield, Check } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <Card>
        <CardHeader>
          <CardTitle>API-Schlüssel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="OpenAI API Key" value="sk-•••••••••••••••••••••" hint="Setze OPENAI_API_KEY in .env für den Live-Modus." />
          <Field label="Anthropic API Key" value="sk-ant-••••••••••••••••" />
        </CardContent>
      </Card>
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

function BillingTab() {
  const plans = [
    { name: "Starter", price: "49 €", agents: "3 Agenten", current: false },
    { name: "Growth", price: "199 €", agents: "10 Agenten", current: false },
    { name: "Enterprise", price: "Individuell", agents: "Unbegrenzt", current: true },
  ];
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Aktueller Plan</CardTitle>
          <Badge variant="accent">Enterprise</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">Nächste Abrechnung am 1. Juni 2026 · Zahlung über Stripe</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-soft">
            <div className="h-full w-[64%] rounded-full bg-[linear-gradient(90deg,var(--color-accent),var(--color-cyan))]" />
          </div>
          <p className="mt-2 text-xs text-muted">6.402 von 10.000 KI-Aktionen diesen Monat verbraucht</p>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.name} className={cn(p.current && "border-accent/40 ring-1 ring-accent/30")}>
            <CardContent className="p-5">
              <p className="font-display text-lg font-semibold text-ink">{p.name}</p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">{p.price}<span className="text-sm font-normal text-muted">/mo</span></p>
              <p className="mt-1 text-sm text-muted">{p.agents}</p>
              <Button variant={p.current ? "outline" : "accent"} size="sm" className="mt-4 w-full" disabled={p.current}>
                {p.current ? "Aktueller Plan" : "Wechseln"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function NotificationsTab() {
  const items = [
    { label: "Anruf-Zusammenfassungen", desc: "E-Mail nach jedem entgegengenommenen Anruf", on: true },
    { label: "Tägliches Briefing", desc: "Morgendliche Übersicht über offene Aufgaben", on: true },
    { label: "Workflow-Fehler", desc: "Sofortige Benachrichtigung bei fehlgeschlagenen Runs", on: true },
    { label: "Wöchentlicher Report", desc: "KPI-Report jeden Montag", on: true },
    { label: "Produkt-Updates", desc: "Neue Funktionen & Verbesserungen", on: false },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Benachrichtigungen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.map((it) => (
          <Toggle key={it.label} label={it.label} desc={it.desc} defaultOn={it.on} />
        ))}
      </CardContent>
    </Card>
  );
}

function Toggle({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = React.useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-sm text-muted">{desc}</p>
      </div>
      <button
        onClick={() => setOn((v) => !v)}
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
        <CardContent className="space-y-1">
          <Toggle label="Zwei-Faktor-Authentifizierung" desc="Zusätzliche Sicherheit beim Login" defaultOn={true} />
          <Toggle label="SSO (SAML)" desc="Single Sign-On für Enterprise-Teams" defaultOn={true} />
          <Toggle label="IP-Allowlist" desc="Zugriff nur aus erlaubten Netzwerken" defaultOn={false} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Datenschutz & Compliance</CardTitle>
          <Badge variant="success">DSGVO</Badge>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-ink-soft">
          <p>Alle Daten werden verschlüsselt in der EU gespeichert (AES-256 at rest, TLS 1.3 in transit).</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">SOC 2 Type II</Badge>
            <Badge variant="outline">ISO 27001</Badge>
            <Badge variant="outline">EU-Hosting</Badge>
            <Badge variant="outline">Audit-Logs</Badge>
          </div>
          <Button variant="outline" size="sm" className="mt-1">Daten exportieren</Button>
        </CardContent>
      </Card>
    </div>
  );
}
