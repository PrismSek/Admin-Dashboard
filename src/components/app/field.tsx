import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Text input styled for the signed-in screens (denser than the auth control). */
export function AppInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-app border border-hair-strong bg-chrome px-3.5",
        "text-app text-strong placeholder:text-subtle",
        "outline-none focus:border-brand-accent",
        className,
      )}
      {...props}
    />
  );
}

/** Native select styled to match AppInput. */
export function AppSelect({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-10 w-full appearance-none rounded-app border border-hair-strong bg-chrome",
          "py-0 pl-3.5 pr-9 text-app text-strong outline-none focus:border-brand-accent",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-dim"
      >
        ▾
      </span>
    </div>
  );
}

/** Label + control, with optional help text underneath. */
export function AppField({
  id,
  label,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-meta font-semibold text-strong">
        {label}
      </label>
      {children}
      {hint ? <p className="text-meta text-dim">{hint}</p> : null}
    </div>
  );
}

/** Read-only label/value pair, as on the SSO detail grid. */
export function ReadOnlyField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-meta text-dim">{label}</p>
      <p className="mt-1 text-app text-strong">{value}</p>
    </div>
  );
}
