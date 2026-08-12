import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Table primitives for the list screens.
 *
 * Real <table> semantics rather than divs, so screen readers announce row and
 * column relationships. Wrapped in an overflow-x container per
 * docs/CODING_STANDARDS.md §9 — the page body must never scroll sideways.
 */
export function TableFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-app border border-hair-strong bg-chrome",
        className,
      )}
    >
      <table className="w-full min-w-[720px] border-collapse text-left">{children}</table>
    </div>
  );
}

/**
 * `case` matches the two header treatments in the design: the Users and Access
 * table sets its headers in caps, every other table uses sentence case.
 */
export function THead({
  columns,
  case: casing = "sentence",
}: {
  columns: ReactNode[];
  case?: "sentence" | "caps";
}) {
  return (
    <thead>
      <tr className="border-b border-hair">
        {columns.map((column, index) => (
          <th
            key={index}
            scope="col"
            className={cn(
              "px-5 py-3.5 text-micro font-normal text-subtle",
              casing === "caps" && "tracking-wide uppercase",
            )}
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-hair">{children}</tbody>;
}

export function TR({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn("transition-colors hover:bg-hover", className)}>{children}</tr>;
}

export function TD({
  children,
  className,
  align = "top",
}: {
  children: ReactNode;
  className?: string;
  align?: "top" | "middle";
}) {
  return (
    <td
      className={cn(
        "px-5 py-4 text-app text-strong",
        align === "middle" ? "align-middle" : "align-top",
        className,
      )}
    >
      {children}
    </td>
  );
}

/** Primary label with a quieter second line, the dominant cell shape here. */
export function CellStack({
  primary,
  secondary,
  emphasis = "normal",
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  emphasis?: "normal" | "strong";
}) {
  return (
    <div className="min-w-0">
      <p className={cn("text-app text-strong", emphasis === "strong" && "font-medium")}>
        {primary}
      </p>
      {secondary ? <p className="mt-0.5 text-meta text-subtle">{secondary}</p> : null}
    </div>
  );
}

/**
 * Shown instead of rows when a list is empty. Distinct wording from an error
 * state — "nothing here" and "we could not check" must never look alike in a
 * security product (docs/CODING_STANDARDS.md §9).
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
      <p className="text-app font-medium text-strong">{title}</p>
      {description ? <p className="max-w-sm text-meta text-dim">{description}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
