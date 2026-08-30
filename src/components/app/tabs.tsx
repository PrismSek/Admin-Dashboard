import Link from "next/link";

import { cn } from "@/lib/utils";

export type TabItem = {
  label: string;
  href: string;
  /** Trailing count, rendered as "Users (12)" or "Users · 5". */
  count?: number;
  active?: boolean;
};

/**
 * Underlined tab bar.
 *
 * Link-based rather than stateful: the selected tab is part of the URL, so a
 * tab is shareable and the page stays a Server Component
 * (docs/CODING_STANDARDS.md §7).
 */
/**
 * Segmented pill toggle (Figma "Users · 20 / Endpoints · 23"): the active
 * segment is a solid brand fill, the rest are hairline-bordered. Link-based,
 * like `Tabs`, so the selection lives in the URL.
 */
export function PillTabs({ items, className }: { items: TabItem[]; className?: string }) {
  return (
    <nav aria-label="Section" className={cn("inline-flex items-center gap-2", className)}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "inline-flex h-10 items-center rounded-app px-4 text-app transition-colors",
            item.active
              ? "bg-brand-accent font-medium text-brand-fg"
              : "border border-hair-strong bg-chrome text-copy hover:bg-hover",
          )}
        >
          {item.label}
          {item.count !== undefined ? ` · ${item.count}` : null}
        </Link>
      ))}
    </nav>
  );
}

export function Tabs({
  items,
  separator = "parens",
  mutedCount = false,
  className,
}: {
  items: TabItem[];
  separator?: "parens" | "dot";
  /** Render the count as a separate muted span ("All 19"), per the Policies design. */
  mutedCount?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-hair", className)}>
      <nav aria-label="Section" className="flex gap-8">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-0.5 pb-3 text-app transition-colors",
              item.active
                ? "border-brand-accent font-medium text-strong"
                : "border-transparent text-subtle hover:text-copy",
            )}
          >
            {item.label}
            {item.count !== undefined ? (
              mutedCount ? (
                <span className="ml-1.5 text-subtle">{item.count}</span>
              ) : separator === "parens" ? (
                ` (${item.count})`
              ) : (
                ` · ${item.count}`
              )
            ) : null}
          </Link>
        ))}
      </nav>
    </div>
  );
}
