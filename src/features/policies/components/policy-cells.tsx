import { Minus } from "lucide-react";

import { healthLabel, lifecycleLabel, type Health, type Lifecycle } from "@/features/policies/labels";
import { cn } from "@/lib/utils";

const lifecycleStyles: Record<Lifecycle, string> = {
  enforced: "border-transparent bg-pill-ok-bg text-pill-ok-fg",
  draft: "border-hair-strong bg-chrome text-dim",
  off: "border-transparent bg-pill-neutral-bg text-pill-neutral-fg",
};

/** Policy lifecycle pill: Enforced (green) / Draft / Off. */
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

/**
 * Deployment-health indicator. The admin-policy API carries no health telemetry,
 * so every row reads "Unknown" until a deployment feed is wired.
 */
export function HealthCell({ value }: { value: Health }) {
  return (
    <span className="inline-flex items-center gap-2 text-app text-subtle-alt">
      <Minus aria-hidden className="size-4 shrink-0" />
      {healthLabel[value]}
    </span>
  );
}
