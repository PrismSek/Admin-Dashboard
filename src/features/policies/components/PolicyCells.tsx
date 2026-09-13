import { AppIcon } from "@/components/icons/AppIcon";
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
 * Deployment-health indicator: a leading glyph plus one of the five Figma
 * health labels (Healthy / Degraded / Approval pending / Stale / Not
 * deployed). The glyph is decorative — the label text carries the meaning,
 * per the coding standards' "never colour alone" rule.
 */
export function HealthCell({ value }: { value: Health }) {
  return (
    <span className="inline-flex items-center gap-2 text-policy-table-body text-subtle-alt">
      <AppIcon name="minus" className="size-app-icon shrink-0" />
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
