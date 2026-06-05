import * as React from "react";
import { cn, initials } from "@/lib/utils";
import type { EmployeeStatus } from "@/lib/types";

const sizes = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
} as const;

const statusColor: Record<EmployeeStatus, string> = {
  active: "var(--color-success)",
  idle: "var(--color-warning)",
  training: "var(--color-cyan)",
  offline: "var(--color-muted)",
};

/**
 * Premium "glow" avatar for the AI employees: a pulsing colored aura, a slowly
 * rotating conic light-ring, and a glossy gradient core with the initials.
 * Purely CSS/SVG — no images, instant load, crisp at every size. Animations are
 * disabled automatically under `prefers-reduced-motion` (see globals.css).
 */
export function GlowAvatar({
  name,
  color,
  size = "md",
  status,
  className,
}: {
  name: string;
  color: string;
  size?: keyof typeof sizes;
  status?: EmployeeStatus;
  className?: string;
}) {
  return (
    <span
      className={cn("relative inline-grid shrink-0 place-items-center", sizes[size], className)}
      aria-hidden
    >
      {/* Pulsing aura behind the avatar */}
      <span
        className="absolute -inset-[28%] rounded-full blur-md animate-pulse-soft"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 68%)`, opacity: 0.45 }}
      />
      {/* Slowly rotating conic light-ring */}
      <span
        className="absolute inset-0 rounded-full animate-spin-slow"
        style={{
          background: `conic-gradient(from 140deg, ${color}, transparent 36%, color-mix(in srgb, ${color} 55%, #fff) 58%, transparent 80%, ${color})`,
        }}
      />
      {/* Glossy gradient core */}
      <span
        className="absolute inset-[2px] rounded-full"
        style={{
          background: `radial-gradient(125% 125% at 30% 22%, color-mix(in srgb, ${color} 90%, #fff) 0%, ${color} 44%, color-mix(in srgb, ${color} 56%, #06070d) 100%)`,
        }}
      />
      {/* Top-left specular highlight */}
      <span
        className="absolute inset-[2px] rounded-full"
        style={{ background: "radial-gradient(68% 54% at 32% 20%, rgba(255,255,255,0.5) 0%, transparent 60%)" }}
      />
      {/* Initials */}
      <span className="relative font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
        {initials(name)}
      </span>
      {/* Status pip */}
      {status && (
        <span
          className="absolute bottom-0 right-0 rounded-full p-[2px]"
          style={{ background: "var(--color-surface)" }}
        >
          <span className="block h-2 w-2 rounded-full" style={{ background: statusColor[status] }} />
        </span>
      )}
    </span>
  );
}
