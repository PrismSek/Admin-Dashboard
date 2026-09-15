import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Soft, hairline-bordered badge used across the incident drawer — the status
 * pill and the evidence-timeline tags (Figma 597:* : fill + border + ink per
 * tone, 2px radius). Distinct from the app's solid status `Pill`, so it lives
 * with the Issues feature rather than in the shared set.
 */
const softBadge = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-micro font-medium",
  {
    variants: {
      tone: {
        green: "bg-badge-green-bg border-badge-green-line text-badge-green-fg",
        amber: "bg-badge-amber-bg border-badge-amber-line text-badge-amber-fg",
        blue: "bg-badge-blue-bg border-badge-blue-line text-badge-blue-fg",
        neutral: "bg-surface border-line text-copy",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function SoftBadge({
  tone,
  children,
  className,
}: VariantProps<typeof softBadge> & { children: ReactNode; className?: string }) {
  return <span className={cn(softBadge({ tone }), className)}>{children}</span>;
}

export type BadgeTone = NonNullable<VariantProps<typeof softBadge>["tone"]>;
