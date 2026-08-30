import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Toolbar + footer controls shared by the Manage list screens (Domains,
 * Applications, Users & Groups, Endpoints). The Figma "manage" tables use a
 * distinct chrome from the Settings tables: a scope filter with a brand accent,
 * square icon buttons, an in-card footer with an outlined page control and a
 * per-page select.
 */

/** Bordered square icon button. Renders as a link when `href` is given. */
export function SquareIconButton({
  label,
  href,
  children,
  className,
}: {
  label: string;
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  const classes = cn(
    "flex size-10 shrink-0 items-center justify-center rounded-app border border-hair-strong bg-chrome text-dim transition-colors hover:bg-hover [&_svg]:size-4",
    className,
  );
  if (href) {
    return (
      <Link href={href} aria-label={label} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} className={classes}>
      {children}
    </button>
  );
}

/**
 * Filter select shown as "Prefix = Value" with a brand accent on the leading
 * edge (Figma). Submits its enclosing GET form on change (see FilterBar).
 */
export function ScopeSelect({
  name,
  prefix,
  defaultValue,
  options,
}: {
  name: string;
  prefix: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <label htmlFor={`scope-${name}`} className="sr-only">
        {prefix}
      </label>
      <select
        id={`scope-${name}`}
        name={name}
        defaultValue={defaultValue}
        className={cn(
          "h-10 appearance-none rounded-app border border-hair-strong border-l-[3px] border-l-brand bg-chrome",
          "py-0 pl-3.5 pr-9 text-app text-strong outline-none focus:border-brand-accent",
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {`${prefix} = ${option.label}`}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-dim"
      />
    </div>
  );
}

/** Orange "+ label" action link. */
export function AddAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 whitespace-nowrap text-app font-medium text-brand transition-colors hover:text-brand-hover"
    >
      {children}
    </Link>
  );
}

/** Dark, sentence-case table header cell used by the manage tables. */
export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th scope="col" className={cn("px-5 py-3.5 text-meta font-medium text-strong", className)}>
      {children}
    </th>
  );
}

/**
 * In-card footer: "Showing X to Y of N" + an outlined page control (active page
 * carries a brand outline, per Figma) and a per-page select. Pass `page`,
 * `pageCount` and `hrefFor` for real navigation; omit them for a single page.
 */
export function ListFooter({
  from,
  to,
  total,
  page = 1,
  pageCount = 1,
  hrefFor,
  perPage = 20,
}: {
  from: number;
  to: number;
  total: number;
  page?: number;
  pageCount?: number;
  hrefFor?: (page: number) => string;
  perPage?: number;
}) {
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hair px-5 py-3.5">
      <p className="text-meta text-dim">
        Showing {from} to {to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <PageStep href={hrefFor?.(page - 1)} disabled={page <= 1} label="‹" srLabel="Previous page" />
        {pages.map((entry) => (
          <PageNumber
            key={entry}
            entry={entry}
            active={entry === page}
            href={hrefFor?.(entry)}
          />
        ))}
        <PageStep href={hrefFor?.(page + 1)} disabled={page >= pageCount} label="›" srLabel="Next page" />
        <div className="relative ml-1">
          <select
            aria-label="Rows per page"
            defaultValue={perPage}
            className="h-8 appearance-none rounded-app border border-hair-strong bg-chrome py-0 pl-2.5 pr-7 text-meta text-copy outline-none"
          >
            <option value={perPage}>{perPage} / page</option>
          </select>
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-dim"
          />
        </div>
      </div>
    </div>
  );
}

function PageNumber({ entry, active, href }: { entry: number; active: boolean; href?: string }) {
  const classes = cn(
    "flex h-8 min-w-8 items-center justify-center rounded-app px-2 text-meta",
    active
      ? "border border-brand font-medium text-brand"
      : "border border-hair-strong text-copy hover:bg-hover",
  );
  if (active || !href) {
    return (
      <span aria-current={active ? "page" : undefined} className={classes}>
        {entry}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={`Page ${entry}`} className={classes}>
      {entry}
    </Link>
  );
}

function PageStep({
  href,
  disabled,
  label,
  srLabel,
}: {
  href?: string;
  disabled: boolean;
  label: string;
  srLabel: string;
}) {
  const classes = "flex h-8 items-center justify-center rounded-app px-2 text-meta";
  if (disabled || !href) {
    return (
      <span aria-disabled className={cn(classes, "text-subtle")}>
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

/** Search input with a leading magnifier, sized for a toolbar. */
export function ToolbarSearch({
  name = "q",
  placeholder,
  defaultValue,
  className,
  ...props
}: ComponentProps<"input"> & { placeholder: string }) {
  return (
    <div className={cn("relative", className)}>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <label htmlFor={`search-${name}`} className="sr-only">
        {placeholder}
      </label>
      <input
        id={`search-${name}`}
        type="search"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-10 w-full rounded-app border border-hair-strong bg-chrome pl-9 pr-3.5 text-app text-strong placeholder:text-subtle outline-none focus:border-brand-accent"
        {...props}
      />
    </div>
  );
}
