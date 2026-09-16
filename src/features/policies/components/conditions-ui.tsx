import type { ReactNode } from "react";

import { AppIcon } from "@/components/icons/AppIcon";
import { cn } from "@/lib/utils";

/**
 * Shared visual primitives for the Data step's Conditions card (Figma
 * `396:4839` and the four channel frames). The card, its section chips, the
 * per-row corner connector, the read-only value pill, and the `×` / `+` icon
 * buttons are the same across every channel, so they live here rather than
 * being re-styled inside each channel's conditions component.
 */

/** The bordered white card wrapping CONTENT + the channel's destination block. */
export function ConditionsCard({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 flex flex-col gap-5 rounded-card border border-hair-strong bg-chrome p-4">
      {children}
    </div>
  );
}

/** A grey uppercase section chip — CONTENT / DESTINATION / DEVICE / PRINTER / APP. */
export function SectionChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-app bg-hair px-2 py-0.5 text-micro font-medium tracking-wide text-copy">
      {children}
    </span>
  );
}

/** The small "└" corner drawn to the left of each finding / destination row. */
export function RowConnector() {
  return <span aria-hidden className="mt-1 h-2.5 w-3 shrink-0 rounded-bl-sm border-b border-l border-hair-strong" />;
}

/**
 * A read-only value pill: a muted leading label divided from one or more value
 * segments (Figma's "Finding │ Aadhaar number" chip). Values are joined with
 * the same hairline divider the `PolicySelect` pill uses.
 */
export function ReadonlyPill({ label, values }: { label: string; values: readonly string[] }) {
  return (
    <span className="inline-flex h-select-control max-w-full items-center gap-2.5 rounded-app border border-hair-strong bg-chrome px-3 text-app">
      <span className="shrink-0 text-dim">{label}</span>
      {values.map((value, index) => (
        <span key={index} className="flex min-w-0 items-center gap-2.5">
          <span aria-hidden className="h-4 w-px shrink-0 bg-hair-strong" />
          <span className="truncate text-strong">{value}</span>
        </span>
      ))}
    </span>
  );
}

/** The square outlined "×" button that removes a row. */
export function RemoveIconButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex size-6 shrink-0 items-center justify-center rounded-app border border-hair-strong text-dim hover:bg-hover disabled:opacity-40"
    >
      <AppIcon name="close" className="size-app-icon" />
    </button>
  );
}

/** The square orange-tinted "+" button that adds a row. */
export function AddIconButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-app border border-brand-accent",
        "bg-brand-halo text-brand hover:bg-hover disabled:opacity-50",
      )}
    >
      <AppIcon name="plus" className="size-app-icon" />
    </button>
  );
}
