import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Endpoint protection posture, shared by the Endpoints fleet and the Manage
 * users/endpoints tables. "unknown" is a first-class state, never a fallback —
 * an endpoint whose protection evidence could not be established is never shown
 * as Protected.
 */
export type Protection = "protected" | "attention" | "unknown";

export const protectionLabel: Record<Protection, string> = {
  protected: "Protected",
  attention: "Attention",
  unknown: "Unknown",
};

const marks: Record<Protection, { Icon: typeof Shield; className: string }> = {
  protected: { Icon: ShieldCheck, className: "text-allow" },
  attention: { Icon: ShieldAlert, className: "text-block" },
  unknown: { Icon: Shield, className: "text-monitor" },
};

/** Coloured protection shield. `labelled` adds the text (default); off for a bare icon cell. */
export function ProtectionCell({
  value,
  labelled = true,
  className,
}: {
  value: Protection;
  labelled?: boolean;
  className?: string;
}) {
  const { Icon, className: tone } = marks[value];
  if (!labelled) {
    return <Icon aria-label={protectionLabel[value]} className={cn("size-5 shrink-0", tone, className)} />;
  }
  return (
    <span className={cn("inline-flex items-center gap-2 text-app text-strong", className)}>
      <Icon aria-hidden className={cn("size-4 shrink-0", tone)} />
      {protectionLabel[value]}
    </span>
  );
}
