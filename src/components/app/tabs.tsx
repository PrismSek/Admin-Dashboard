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
export function Tabs({
  items,
  separator = "parens",
  className,
}: {
  items: TabItem[];
  separator?: "parens" | "dot";
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
            {item.count !== undefined
              ? separator === "parens"
                ? ` (${item.count})`
                : ` · ${item.count}`
              : null}
          </Link>
        ))}
      </nav>
    </div>
  );
}
