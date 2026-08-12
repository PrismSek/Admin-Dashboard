import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type Stat = {
  label: string;
  value: ReactNode;
  /** Small line beneath the figure. */
  detail?: ReactNode;
};

/**
 * The horizontal band of figures above the endpoints and department tables.
 * `note` renders as a final, wider cell of explanatory text.
 */
export function StatTiles({
  stats,
  note,
  className,
}: {
  stats: Stat[];
  note?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid overflow-hidden rounded-app border border-hair-strong bg-chrome",
        "divide-x divide-hair-strong",
        note ? "grid-cols-[repeat(auto-fit,minmax(0,1fr))]" : "grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="px-5 py-4">
          <p className="text-meta text-dim">{stat.label}</p>
          <p className="mt-1.5 text-stat font-medium text-strong">{stat.value}</p>
          {stat.detail ? <p className="mt-1 text-meta text-dim">{stat.detail}</p> : null}
        </div>
      ))}
      {note ? (
        <div className="px-5 py-4 text-meta leading-relaxed text-dim">{note}</div>
      ) : null}
    </div>
  );
}
