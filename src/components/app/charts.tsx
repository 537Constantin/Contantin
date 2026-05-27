"use client";

import * as React from "react";

const toneVar: Record<string, string> = {
  accent: "var(--color-accent)",
  cyan: "var(--color-cyan)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  violet: "var(--color-violet)",
};

/** Tiny inline sparkline for KPI cards. */
export function Sparkline({
  data,
  tone = "accent",
  className,
}: {
  data: number[];
  tone?: keyof typeof toneVar;
  className?: string;
}) {
  const w = 120;
  const h = 36;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((d, i) => [i * step, h - ((d - min) / span) * (h - 4) - 2] as const);
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const id = React.useId();
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={toneVar[tone]} stopOpacity="0.28" />
          <stop offset="100%" stopColor={toneVar[tone]} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={toneVar[tone]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Stacked-ish grouped bar chart for weekly throughput. */
export function BarChart({
  data,
  className,
}: {
  data: { label: string; calls: number; tasks: number; tickets: number }[];
  className?: string;
}) {
  const max = Math.max(...data.flatMap((d) => [d.tasks, d.tickets, d.calls]));
  return (
    <div className={className}>
      <div className="flex h-52 items-end justify-between gap-3">
        {data.map((d) => (
          <div key={d.label} className="group flex flex-1 flex-col items-center gap-2">
            <div className="flex h-full w-full items-end justify-center gap-1">
              {(
                [
                  ["tasks", "var(--color-accent)"],
                  ["tickets", "var(--color-cyan)"],
                  ["calls", "var(--color-success)"],
                ] as const
              ).map(([key, color]) => (
                <div
                  key={key}
                  className="w-full max-w-[10px] rounded-full transition-[height,opacity] duration-500 group-hover:opacity-100"
                  style={{
                    height: `${(d[key] / max) * 100}%`,
                    background: `linear-gradient(180deg, ${color}, color-mix(in srgb, ${color} 35%, transparent))`,
                    opacity: 0.9,
                  }}
                  title={`${key}: ${d[key]}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted">
        <Legend color="var(--color-accent)" label="Aufgaben" />
        <Legend color="var(--color-cyan)" label="Tickets" />
        <Legend color="var(--color-success)" label="Anrufe" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

/** Smooth area/line chart for revenue. */
export function AreaChart({
  data,
  tone = "accent",
  className,
}: {
  data: { label: string; value: number }[];
  tone?: keyof typeof toneVar;
  className?: string;
}) {
  const w = 520;
  const h = 180;
  const pad = 8;
  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1);
  const pts = data.map(
    (d, i) => [pad + i * step, h - pad - ((d.value - min) / span) * (h - pad * 2)] as const,
  );
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w - pad},${h} L${pad},${h} Z`;
  const id = React.useId();
  return (
    <div className={className}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={toneVar[tone]} stopOpacity="0.32" />
            <stop offset="100%" stopColor={toneVar[tone]} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${id})`} />
        <path d={line} fill="none" stroke={toneVar[tone]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="var(--color-surface)" stroke={toneVar[tone]} strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-muted">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

/** Donut chart for workload distribution. */
export function Donut({
  data,
  className,
}: {
  data: { label: string; value: number; color: string }[];
  className?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = 60;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className={className}>
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 160 160" className="h-36 w-36 -rotate-90">
          {data.map((d) => {
            const len = (d.value / total) * c;
            const seg = (
              <circle
                key={d.label}
                cx="80"
                cy="80"
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth="16"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
              />
            );
            offset += len;
            return seg;
          })}
        </svg>
        <ul className="space-y-2 text-sm">
          {data.map((d) => (
            <li key={d.label} className="flex items-center gap-2 text-ink-soft">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
              <span className="flex-1">{d.label}</span>
              <span className="font-medium text-ink">{d.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
