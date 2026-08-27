import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** White panel on the canvas. The base container for every settings section. */
export function Card({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "destructive";
}) {
  return (
    <section
      className={cn(
        "rounded-card border bg-chrome",
        tone === "destructive" ? "border-destructive/40" : "border-hair-strong",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Title + description pair inside a card. */
export function CardSection({
  title,
  description,
  children,
  tone = "default",
  className,
}: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  tone?: "default" | "destructive";
  className?: string;
}) {
  return (
    <div className={cn("p-6", className)}>
      <h2
        className={cn(
          "text-section font-medium",
          tone === "destructive" ? "text-destructive" : "text-strong",
        )}
      >
        {title}
      </h2>
      {description ? <p className="mt-1 text-meta text-dim">{description}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}
