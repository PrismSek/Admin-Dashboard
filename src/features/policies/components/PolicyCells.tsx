import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { healthLabel, lifecycleLabel, type Health, type Lifecycle } from "@/features/policies/labels";
import { cn } from "@/lib/utils";

/**
 * Cell renderers shared by the Policy list table (used from
 * `PolicyListRow`). Kept in one file — each is a few lines built from the
 * same lifecycle/health vocabulary in labels.ts, not enough to justify
 * separate files.
 */

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
 * Per-health glyph + colour token (Figma list capture 398:16105): Healthy is a
 * green check, Degraded a warning triangle in the warn tint. The glyph is
 * decorative — the label text carries the meaning, per the coding standards'
 * "never colour alone" rule. States with no distinct Figma mark yet fall back
 * to the neutral dash below; a live-API row has no health at all (the gateway
 * carries no deployment telemetry), so `null` renders the same "—" placeholder
 * the enforcement-mode column uses.
 */
const healthStyles: Partial<Record<Health, { icon: AppIconName; className: string }>> = {
  Healthy: { icon: "check", className: "text-state-ok" },
  Degraded: { icon: "warning", className: "text-pill-warn-fg" },
};

const healthNeutral = { icon: "minus", className: "text-subtle-alt" } as const;

export function HealthCell({ value }: { value: Health | null }) {
  if (value === null) {
    return (
      <span className="inline-flex text-subtle-alt">
        <AppIcon name="minus" className="size-app-icon" />
      </span>
    );
  }
  const style = healthStyles[value] ?? healthNeutral;
  return (
    <span className={cn("inline-flex items-center gap-2 text-policy-table-body", style.className)}>
      <AppIcon name={style.icon} className="size-app-icon shrink-0" />
      {healthLabel[value]}
    </span>
  );
}

/**
 * Enforcement mode: the mode string for a deployed/simulated policy, or a
 * dash glyph (decorative — the column header already names the field) for
 * Draft/Off rows that carry none.
 */
export function EnforcementModeCell({ value }: { value: string | null }) {
  if (value === null) {
    return (
      <span className="inline-flex text-subtle-alt">
        <AppIcon name="minus" className="size-app-icon" />
      </span>
    );
  }
  return <span className="text-policy-table-body text-copy">{value}</span>;
}
