import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Screen title (and optional supporting line) for the split layout.
 * Centralised so heading size, weight and colour are set in one place.
 */
export function AuthHeading({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Figma sign-in / password titles are Light (300); see FIGMA-DEVIATIONS §7. */}
      <h1 className="text-heading font-light text-title">{title}</h1>
      {subtitle ? <p className="text-body text-muted">{subtitle}</p> : null}
    </div>
  );
}

/**
 * Title + centred body copy for the outcome screens.
 * `body` accepts multiple lines; each renders on its own row as in the design.
 */
export function AuthOutcomeHeading({
  title,
  body,
  className,
}: {
  title: string;
  body?: readonly string[] | ReactNode;
  className?: string;
}) {
  const lines = Array.isArray(body) ? (body as readonly string[]) : null;

  return (
    <div className={cn("flex flex-col items-center gap-4 text-center", className)}>
      <h1 className="text-heading text-title">{title}</h1>
      {lines ? (
        <p className="text-body text-prose">
          {lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      ) : body ? (
        <div className="text-body text-prose">{body}</div>
      ) : null}
    </div>
  );
}
