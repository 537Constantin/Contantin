/**
 * Calendar model + date helpers (no external library).
 *
 * Events are stored per user under the "event" store kind (localStorage + DB).
 * Dates are plain ISO day strings ("YYYY-MM-DD"); times are "HH:MM" (24h).
 * This keeps everything timezone-stable and easy for the AI employees to read
 * later for day planning.
 */

export const EVENT_COLORS = ["accent", "cyan", "success", "warning", "violet"] as const;
export type EventColor = (typeof EVENT_COLORS)[number];

export interface CalendarEvent {
  id: string;
  title: string;
  /** "YYYY-MM-DD" */
  date: string;
  allDay: boolean;
  /** "HH:MM" — only when allDay is false. */
  start?: string;
  end?: string;
  location?: string;
  notes?: string;
  color: EventColor;
  createdAt: string;
}

export const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export function monthLabel(year: number, month: number): string {
  return `${MONTHS[month]} ${year}`;
}

/** Local ISO day string ("YYYY-MM-DD") — not UTC, so "today" is the user's day. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** Parse "YYYY-MM-DD" into a local Date (midnight). */
export function fromISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/**
 * A 6-row month grid (Monday-first), including the leading/trailing days of the
 * adjacent months so every cell is filled.
 */
export function monthGrid(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1);
  // Monday-first offset: JS getDay() is 0=Sun..6=Sat.
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - offset);
  const weeks: Date[][] = [];
  const cursor = new Date(start);
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/**
 * Best-effort parse of a free-text date into an ISO day ("YYYY-MM-DD").
 * Handles the formats the AI email analysis tends to return: ISO, DD.MM.YYYY,
 * DD.MM.YY and DD.MM. (current year). Returns null when nothing usable is found.
 */
export function parseLooseDate(input: string): string | null {
  const s = (input || "").trim();
  if (!s) return null;

  const iso = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const de = s.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})?/);
  if (de) {
    const day = Number(de[1]);
    const month = Number(de[2]);
    let year = de[3] ? Number(de[3]) : new Date().getFullYear();
    if (de[3] && de[3].length === 2) year = 2000 + year;
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }
  return null;
}

/** Keep only a clean "HH:MM" time; return undefined for anything else. */
export function cleanTime(input?: string): string | undefined {
  const m = (input || "").trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return undefined;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return undefined;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

export function minutesOf(time?: string): number {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Events on a given ISO day, sorted: all-day first, then by start time. */
export function eventsForDay(events: CalendarEvent[], iso: string): CalendarEvent[] {
  return events
    .filter((e) => e.date === iso)
    .sort((a, b) => {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      return minutesOf(a.start) - minutesOf(b.start);
    });
}

export function formatDayLong(iso: string): string {
  const d = fromISODate(iso);
  return d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
}

/** Tailwind classes for each event color (chip + accent bar). */
export const colorClasses: Record<EventColor, { chip: string; bar: string; dot: string }> = {
  accent: { chip: "bg-accent/12 text-accent ring-1 ring-accent/25", bar: "bg-accent", dot: "bg-accent" },
  cyan: { chip: "bg-cyan/12 text-cyan ring-1 ring-cyan/25", bar: "bg-cyan", dot: "bg-cyan" },
  success: { chip: "bg-success/12 text-success ring-1 ring-success/25", bar: "bg-success", dot: "bg-success" },
  warning: { chip: "bg-warning/14 text-warning ring-1 ring-warning/25", bar: "bg-warning", dot: "bg-warning" },
  violet: { chip: "bg-violet/12 text-violet ring-1 ring-violet/25", bar: "bg-violet", dot: "bg-violet" },
};
