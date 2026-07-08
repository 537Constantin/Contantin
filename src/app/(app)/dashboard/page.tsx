import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Plus, Inbox, CalendarDays, ReceiptText, FileText, type LucideIcon } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-header";
import { LiveStats } from "@/components/app/live-stats";
import { TodayPlan } from "@/components/app/today-plan";
import { OnboardingChecklist } from "@/components/app/onboarding-checklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { StatusDot } from "@/components/app/status";
import { employees } from "@/lib/data/employees";

export const metadata: Metadata = { title: "Start" };

// The four things people do most often — one tap from the home screen.
const quickActions: { label: string; desc: string; href: string; icon: LucideIcon }[] = [
  { label: "Posteingang", desc: "E-Mails lesen & beantworten", href: "/inbox", icon: Inbox },
  { label: "Kalender", desc: "Termine planen", href: "/calendar", icon: CalendarDays },
  { label: "Beleg scannen", desc: "Rechnung erfassen", href: "/receipts", icon: ReceiptText },
  { label: "Dokumente", desc: "Dateien analysieren", href: "/documents", icon: FileText },
];

export default function DashboardPage() {
  return (
    <PageShell>
      <PageHeader title="Willkommen zurück" description="Dein Tag auf einen Blick.">
        <Button variant="accent" size="sm" asChild>
          <Link href="/employees?new=1">
            <Plus className="h-4 w-4" /> Neuer KI-Mitarbeiter
          </Link>
        </Button>
      </PageHeader>

      {/* Getting-started checklist — hides itself once done/dismissed */}
      <div className="mt-6">
        <OnboardingChecklist />
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quickActions.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.href}
              href={a.href}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-accent/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/12 text-accent transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{a.label}</p>
                <p className="mt-0.5 text-xs text-muted">{a.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Today's real agenda from the calendar */}
      <div className="mt-6">
        <TodayPlan />
      </div>

      {/* Real numbers from the user's own data */}
      <div className="mt-6">
        <LiveStats />
      </div>

      {/* AI staff */}
      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>Deine KI-Mitarbeiter</CardTitle>
            <p className="mt-1 text-sm text-muted">{employees.length} Mitarbeiter · bereit für deine Aufgaben</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/employees">
              Alle verwalten <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {employees.map((emp) => (
              <Link
                key={emp.id}
                href={`/employees/${emp.id}`}
                className="group flex items-center gap-3 rounded-xl border border-border bg-surface-soft/40 p-3 transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-accent/30"
              >
                <Avatar name={emp.name} color={emp.avatarColor} glow />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-ink">{emp.name}</p>
                    <StatusDot status={emp.status} />
                  </div>
                  <p className="truncate text-xs text-muted">{emp.roleLabel}</p>
                </div>
              </Link>
            ))}
            <Link
              href="/employees?new=1"
              className="flex min-h-[72px] items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted transition-colors hover:border-accent/40 hover:text-accent"
            >
              <Plus className="h-4 w-4" /> Mitarbeiter hinzufügen
            </Link>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
