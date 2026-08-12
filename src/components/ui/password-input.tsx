"use client";

import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useId, useState, type ComponentProps, type ReactNode } from "react";

import { inputShellClasses, inputTextClasses } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type PasswordInputProps = Omit<ComponentProps<"input">, "type"> & {
  /** Leading icon. Defaults to the key mark used on the sign-in screen. */
  icon?: ReactNode;
};

/**
 * Password field with a reveal toggle.
 *
 * The toggle is a real <button> so it is keyboard reachable, and it announces
 * its state via aria-pressed rather than relying on the icon alone.
 */
export function PasswordInput({ className, icon, ...props }: PasswordInputProps) {
  const [revealed, setRevealed] = useState(false);
  const describedById = useId();

  return (
    <div className={cn(inputShellClasses, className)}>
      <span className="shrink-0 text-subtle [&_svg]:size-4">{icon ?? <KeyRound />}</span>
      <input type={revealed ? "text" : "password"} className={inputTextClasses} {...props} />
      <button
        type="button"
        onClick={() => setRevealed((value) => !value)}
        aria-pressed={revealed}
        aria-label={revealed ? "Hide password" : "Show password"}
        aria-describedby={describedById}
        className="shrink-0 rounded-sm text-subtle transition-colors hover:text-muted [&_svg]:size-4"
      >
        {revealed ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
      </button>
      <span id={describedById} className="sr-only">
        {revealed ? "Password is visible" : "Password is hidden"}
      </span>
    </div>
  );
}
