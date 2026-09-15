import type { Severity } from "@/features/issues/data";
import { cn } from "@/lib/utils";

export const severityLabel: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const severityText: Record<Severity, string> = {
  critical: "text-sev-critical",
  high: "text-sev-high",
  medium: "text-sev-medium",
  low: "text-sev-low",
};

const severityFill: Record<Severity, string> = {
  critical: "fill-sev-critical",
  high: "fill-sev-high",
  medium: "fill-sev-medium",
  low: "fill-sev-low",
};

const severityRank: Record<Severity, number> = { low: 1, medium: 2, high: 3, critical: 4 };

/** Ascending signal-strength bars, coloured by severity; bars beyond the
 *  level are dimmed so the height reads as the severity (Figma 596:1677). */
function SeverityBars({ severity }: { severity: Severity }) {
  const rank = severityRank[severity];
  const bars = [4, 7, 10, 13];
  return (
    <svg
      aria-hidden
      viewBox="0 0 18 15"
      className={cn("size-4 shrink-0", severityFill[severity])}
      focusable="false"
    >
      {bars.map((height, index) => (
        <rect
          key={height}
          x={index * 5}
          y={15 - height}
          width={3}
          height={height}
          rx={1}
          opacity={index < rank ? 1 : 0.25}
        />
      ))}
    </svg>
  );
}

/** Severity is never colour-only — the bars always sit beside the word. */
export function SeverityLabel({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-app font-medium", severityText[severity], className)}>
      <SeverityBars severity={severity} />
      {severityLabel[severity]}
    </span>
  );
}
