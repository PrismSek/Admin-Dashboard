import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Shared input shell. Owns the border, height, radius and focus treatment so
 * every field in the app looks identical; `Input` and `PasswordInput` both
 * render through it.
 */
export const inputShellClasses = cn(
  "flex h-control w-full items-center gap-2.5 rounded-control",
  "border border-line bg-surface px-3.5",
  "transition-colors duration-150",
  "focus-within:border-brand",
  "has-[input[aria-invalid='true']]:border-danger",
);

export const inputTextClasses = cn(
  "w-full bg-transparent text-body text-ink",
  "placeholder:text-subtle",
  "outline-none",
);

export type InputProps = ComponentProps<"input"> & {
  /** Leading adornment, typically a 16px lucide icon. */
  icon?: ReactNode;
  /** Trailing adornment, e.g. the password reveal toggle. */
  trailing?: ReactNode;
};

export function Input({ className, icon, trailing, ...props }: InputProps) {
  return (
    <div className={cn(inputShellClasses, className)}>
      {icon ? <span className="shrink-0 text-subtle [&_svg]:size-4">{icon}</span> : null}
      <input className={inputTextClasses} {...props} />
      {trailing ? <span className="shrink-0">{trailing}</span> : null}
    </div>
  );
}
