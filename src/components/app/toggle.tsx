import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * On/off switch.
 *
 * A real checkbox under the styling, so it is keyboard operable and submits
 * with a form. The visible track is driven by `peer-checked`.
 */
export type ToggleProps = Omit<ComponentProps<"input">, "type">;

export function Toggle({ className, ...props }: ToggleProps) {
  return (
    <span className="relative inline-flex shrink-0 items-center">
      <input
        type="checkbox"
        className={cn(
          "peer h-6 w-11 cursor-pointer appearance-none rounded-full",
          "bg-hair-strong transition-colors",
          "checked:bg-state-ok",
          className,
        )}
        {...props}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-0.5 size-5 rounded-full bg-chrome shadow-sm",
          "transition-transform peer-checked:translate-x-5",
        )}
      />
    </span>
  );
}

/**
 * Toggle with its label and description, as used across the SSO and
 * notification screens. The whole row is clickable via the label association.
 */
export function ToggleRow({
  id,
  title,
  description,
  defaultChecked,
  className,
}: {
  id: string;
  title: string;
  description?: string;
  defaultChecked?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-6", className)}>
      <div className="min-w-0">
        <label htmlFor={id} className="text-section font-medium text-strong">
          {title}
        </label>
        {description ? <p className="mt-1 text-meta text-dim">{description}</p> : null}
      </div>
      <Toggle id={id} defaultChecked={defaultChecked} />
    </div>
  );
}
