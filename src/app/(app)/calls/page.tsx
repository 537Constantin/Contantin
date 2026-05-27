import type { Metadata } from "next";
import { Phone, PhoneForwarded, PhoneOff, CalendarCheck, Voicemail, Settings2 } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { calls } from "@/lib/data/activity";
import { getEmployee } from "@/lib/data/employees";
import { formatRelativeTime } from "@/lib/utils";
import type { CallRecord } from "@/lib/types";

export const metadata: Metadata = { title: "Telefon" };

const outcomeMeta = {
  resolved: { label: "Gelöst", variant: "success" as const, icon: Phone },
  scheduled: { label: "Termin gebucht", variant: "accent" as const, icon: CalendarCheck },
  forwarded: { label: "Weitergeleitet", variant: "cyan" as const, icon: PhoneForwarded },
  voicemail: { label: "Voicemail", variant: "default" as const, icon: Voicemail },
};

const sentimentMeta = {
  positive: { label: "positiv", color: "text-success" },
  neutral: { label: "neutral", color: "text-muted" },
  negative: { label: "negativ", color: "text-danger" },
};

function fmtDuration(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} min`;
}

export default function CallsPage() {
  const handled = calls.length;
  const scheduled = calls.filter((c) => c.outcome === "scheduled").length;

  return (
    <PageShell>
      <PageHeader
        title="Telefon-Assistent"
        description="Aria nimmt Anrufe mit menschlich klingender Stimme entgegen, transkribiert live, fasst zusammen und leitet intelligent weiter."
      >
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4" /> Stimme & Routing
        </Button>
      </PageHeader>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Live status card */}
        <Card className="lg:col-span-1">
          <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="relative grid h-24 w-24 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-success/20" />
              <span className="absolute inset-2 rounded-full bg-success/15" />
              <span className="relative grid h-16 w-16 place-items-center rounded-full bg-[linear-gradient(135deg,var(--color-success),var(--color-cyan))] text-white">
                <Phone className="h-7 w-7" />
              </span>
            </div>
            <p className="mt-4 font-display text-lg font-semibold text-ink">Leitung aktiv</p>
            <p className="mt-1 text-sm text-muted">Aria nimmt Anrufe rund um die Uhr entgegen.</p>
            <div className="mt-4 grid w-full grid-cols-2 gap-3">
              <div className="rounded-xl bg-surface-soft/60 p-3">
                <p className="font-display text-xl font-semibold text-ink">{handled}</p>
                <p className="text-xs text-muted">Heute</p>
              </div>
              <div className="rounded-xl bg-surface-soft/60 p-3">
                <p className="font-display text-xl font-semibold text-ink">{scheduled}</p>
                <p className="text-xs text-muted">Termine</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call log */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Gesprächsprotokolle</CardTitle>
            <Badge variant="success">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-success" /> Live-Transkription
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {calls.map((call) => (
              <CallRow key={call.id} call={call} />
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

function CallRow({ call }: { call: CallRecord }) {
  const om = outcomeMeta[call.outcome];
  const sm = sentimentMeta[call.sentiment];
  const emp = getEmployee(call.employeeId);
  const OIcon = om.icon;
  return (
    <div className="rounded-xl border border-border bg-surface-soft/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-surface text-ink-soft">
            {call.outcome === "voicemail" ? <PhoneOff className="h-4 w-4" /> : <OIcon className="h-4 w-4" />}
          </span>
          <div>
            <p className="font-medium text-ink">{call.caller}</p>
            <p className="text-xs text-muted">
              {fmtDuration(call.durationSec)} · Stimmung <span className={sm.color}>{sm.label}</span> · {formatRelativeTime(call.at)}
            </p>
          </div>
        </div>
        <Badge variant={om.variant}>{om.label}</Badge>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{call.summary}</p>
      {emp && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted">
          <Avatar name={emp.name} color={emp.avatarColor} size="sm" />
          bearbeitet von {emp.name}
        </div>
      )}
    </div>
  );
}
