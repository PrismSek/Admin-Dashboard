import { Check } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Checkbox built on a real <input type="checkbox">, visually replaced via the
 * peer pattern. Keeps native keyboard behaviour and form semantics intact.
 */
export type CheckboxProps = Omit<ComponentProps<"input">, "type">;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center">
      <input
        type="checkbox"
        className={cn(
          "peer size-4 cursor-pointer appearance-none rounded-[4px]",
          "border border-line-strong bg-card",
          "checked:border-link checked:bg-link",
          "aria-[invalid=true]:border-danger",
          className,
        )}
        {...props}
      />
      <Check
        aria-hidden
        className={cn(
          "pointer-events-none absolute size-3 text-brand-fg opacity-0",
          "peer-checked:opacity-100",
        )}
      />
    </span>
  );
}
