import type { ReactNode } from "react";

import { PrismSekLogo } from "@/features/auth/components/prismsek-logo";
import { cn } from "@/lib/utils";

/**
 * The white card at the centre-left of each employee onboarding screen (Figma
 * 2030:*): the PrismSek lockup, an optional lead (a status pill via `eyebrow`,
 * or a `badge` node), a light 18px title, an intro line, the screen body, then a
 * quiet footer separated by a rule. Presentational only — each screen supplies
 * its own body.
 */
export function EmployeeScreen({
  badge,
  eyebrow,
  title,
  intro,
  footer,
  children,
}: {
  badge?: ReactNode;
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-card border border-line-faint bg-chrome p-7 shadow-xl">
      <PrismSekLogo className="w-[150px]" />

      {badge ? <div className="mt-6">{badge}</div> : null}
      {eyebrow ? (
        <div className="mt-6">
          <span className="inline-flex items-center rounded-full border border-line-faint px-3 py-1 text-micro font-medium text-muted">
            {eyebrow}
          </span>
        </div>
      ) : null}

      <h1
        className={cn(
          "text-employee-title font-light text-title",
          badge || eyebrow ? "mt-4" : "mt-6",
        )}
      >
        {title}
      </h1>
      {intro ? <p className="mt-2 text-meta text-muted">{intro}</p> : null}

      {children ? <div className="mt-5">{children}</div> : null}

      {footer ? (
        <div className="mt-6 border-t border-line-faint pt-4 text-meta text-subtle">{footer}</div>
      ) : null}
    </div>
  );
}

/** A label/value row used on the "protected" summary (Figma 2030:7236). */
export function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line-faint py-3 last:border-b-0">
      <span className="text-meta text-muted">{label}</span>
      <span className="text-meta font-medium text-strong">{value}</span>
    </div>
  );
}
