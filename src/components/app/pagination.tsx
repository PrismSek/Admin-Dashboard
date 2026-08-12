import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Page links for the list screens.
 *
 * Emits real links carrying `?page=`, so pagination is server-rendered,
 * shareable and works without JavaScript.
 */
export function Pagination({
  page,
  pageCount,
  hrefFor,
  labels = "chevron",
}: {
  page: number;
  pageCount: number;
  /** Builds the href for a page number, preserving other search params. */
  hrefFor: (page: number) => string;
  labels?: "chevron" | "words";
}) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= pageCount;

  return (
    <nav aria-label="Pagination" className="flex items-center gap-2">
      <Step
        href={hrefFor(page - 1)}
        disabled={prevDisabled}
        label={labels === "words" ? "Prev" : "‹"}
        srLabel="Previous page"
      />

      {pages.map((entry) => (
        <Link
          key={entry}
          href={hrefFor(entry)}
          aria-current={entry === page ? "page" : undefined}
          aria-label={`Page ${entry}`}
          className={cn(
            "flex h-8 min-w-8 items-center justify-center rounded-app px-2 text-meta transition-colors",
            entry === page
              ? "bg-brand-accent font-semibold text-brand-fg"
              : "border border-hair-strong bg-chrome text-copy hover:bg-hover",
          )}
        >
          {entry}
        </Link>
      ))}

      <Step
        href={hrefFor(page + 1)}
        disabled={nextDisabled}
        label={labels === "words" ? "Next" : "›"}
        srLabel="Next page"
      />
    </nav>
  );
}

function Step({
  href,
  disabled,
  label,
  srLabel,
}: {
  href: string;
  disabled: boolean;
  label: string;
  srLabel: string;
}) {
  const classes = "flex h-8 items-center justify-center rounded-app px-2 text-meta";

  if (disabled) {
    return (
      <span aria-disabled className={cn(classes, "cursor-default text-subtle")}>
        {label}
      </span>
    );
  }

  return (
    <Link href={href} aria-label={srLabel} className={cn(classes, "text-copy hover:bg-hover")}>
      {label}
    </Link>
  );
}
