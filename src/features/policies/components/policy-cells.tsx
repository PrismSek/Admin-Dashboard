import { AlertTriangle, Check, Circle, Clock, Minus } from "lucide-react";

import { healthLabel, lifecycleLabel, type Health, type Lifecycle } from "@/features/policies/data";
import { cn } from "@/lib/utils";

const lifecycleStyles: Record<Lifecycle, string> = {
  enforced: "border-transparent bg-pill-ok-bg text-pill-ok-fg",
  simulation: "border-block/40 bg-brand-halo text-block",
  draft: "border-hair-strong bg-chrome text-dim",
  off: "border-transparent bg-pill-neutral-bg text-pill-neutral-fg",
};

/** Policy lifecycle pill: Enforced (green) / Simulation (orange outline) / Draft / Off. */
export function LifecyclePill({ value }: { value: Lifecycle }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-app border px-2.5 py-1 text-micro font-medium",
        lifecycleStyles[value],
      )}
    >
      {lifecycleLabel[value]}
    </span>
  );
}

const healthMarks: Record<Health, { Icon: typeof Check; className: string }> = {
  healthy: { Icon: Check, className: "text-state-ok" },
  degraded: { Icon: AlertTriangle, className: "text-block" },
  "approval-pending": { Icon: Circle, className: "text-subtle-alt" },
  "not-deployed": { Icon: Minus, className: "text-subtle-alt" },
  stale: { Icon: Clock, className: "text-subtle-alt" },
};

/** Deployment-health indicator: coloured icon + matching label. */
export function HealthCell({ value }: { value: Health }) {
  const { Icon, className } = healthMarks[value];
  return (
    <span className={cn("inline-flex items-center gap-2 text-app", className)}>
      <Icon aria-hidden className="size-4 shrink-0" />
      {healthLabel[value]}
    </span>
  );
}
