import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Status pill. Every status colour in the app is defined here, so a status
 * never gets a one-off colour at a call site.
 */
const pillVariants = cva(
  "inline-flex items-center gap-1.5 rounded-app px-2.5 py-1 text-micro font-semibold",
  {
    variants: {
      tone: {
        ok: "bg-pill-ok-bg text-pill-ok-fg",
        neutral: "bg-pill-neutral-bg text-pill-neutral-fg",
        warn: "bg-pill-warn-bg text-pill-warn-fg",
        info: "bg-pill-info-bg text-pill-info-fg",
        pending: "bg-pill-pending-bg text-pill-pending-fg",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Pill({
  tone,
  children,
  className,
}: VariantProps<typeof pillVariants> & { children: ReactNode; className?: string }) {
  return <span className={cn(pillVariants({ tone }), className)}>{children}</span>;
}

/**
 * Inline state with a coloured square, as used in the endpoints and department
 * tables. The label always accompanies the marker — status is never conveyed
 * by colour alone.
 */
export function StateMarker({
  tone,
  label,
  shape = "square",
}: {
  tone: "ok" | "warn" | "unknown";
  label: string;
  shape?: "square" | "dot";
}) {
  return (
    <span className="inline-flex items-center gap-2 text-app text-strong">
      <span
        aria-hidden
        className={cn(
          "size-2.5 shrink-0",
          shape === "dot" ? "rounded-full" : "rounded-[2px]",
          tone === "ok" && "bg-state-ok",
          tone === "warn" && "bg-state-warn",
          tone === "unknown" && "bg-state-unknown",
        )}
      />
      {label}
    </span>
  );
}

/** Outlined tag, e.g. "Directory-derived" on the department member tables. */
export function OutlineTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-app border border-outline-warm px-2.5 py-1 text-micro text-brand-accent">
      {children}
    </span>
  );
}
