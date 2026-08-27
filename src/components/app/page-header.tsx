import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Title, supporting line and optional right-hand action at the top of every
 * signed-in page. Defined once so heading size and spacing stay consistent.
 */
export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-6", className)}>
      <div className="min-w-0">
        <h1 className="text-page-title font-normal text-strong">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-meta text-dim">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * Page-level section heading (h2) — larger and lighter than a card title
 * (Figma draws these at 20px/regular, distinct from the 16px/medium card
 * titles). Defined once so the two never drift.
 */
export function SectionHeading({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("text-app-heading font-normal text-strong", className)}>{children}</h2>
  );
}

/** Standard page padding + vertical rhythm for content under the header. */
export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-12 py-8", className)}>{children}</div>;
}
