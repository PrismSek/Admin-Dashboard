import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Label + control + help/error scaffolding.
 *
 * Wiring ids and aria-describedby here means individual screens cannot forget
 * to associate an error message with its input.
 */
export type FormFieldProps = {
  id: string;
  label: string;
  /** Rendered under the control when there is no error. */
  hint?: string;
  error?: string;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => ReactNode;
  className?: string;
};

export function FormField({ id, label, hint, error, children, className }: FormFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-body font-medium text-label">
        {label}
      </label>

      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}

      {error ? (
        <FieldError id={errorId}>{error}</FieldError>
      ) : hint ? (
        <p id={hintId} className="text-help text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Inline error message. `role="alert"` so screen readers announce it when
 * validation fails, and the icon means the message is not conveyed by colour
 * alone.
 */
export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="flex items-center gap-1.5 text-help text-danger">
      <CircleAlert aria-hidden className="size-4 shrink-0" />
      {children}
    </p>
  );
}
