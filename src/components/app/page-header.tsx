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
        <h1 className="text-page-title text-strong">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-meta text-dim">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Standard page padding + vertical rhythm for content under the header. */
export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-8 py-8", className)}>{children}</div>;
}
