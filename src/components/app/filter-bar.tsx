"use client";

import { ChevronDown } from "lucide-react";
import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Search + filter row above the list screens.
 *
 * A plain GET form: submitting writes the filters into the URL and the server
 * re-renders the list. That keeps filter state shareable and the list itself a
 * Server Component (docs/CODING_STANDARDS.md §7 — filters belong in the URL,
 * never in useState).
 *
 * The only client behaviour is auto-submitting when a select changes, so the
 * user does not need a separate "Apply" button.
 */
export function FilterBar({
  action,
  children,
  trailing,
  className,
}: {
  /** Route the filters submit to — normally the current path. */
  action: string;
  children: ReactNode;
  trailing?: ReactNode;
  className?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={action}
      method="get"
      onChange={(event) => {
        // Re-run the query when a dropdown changes; typing in the text input
        // still waits for Enter so the page does not reload per keystroke.
        if ((event.target as HTMLElement).tagName === "SELECT") {
          formRef.current?.requestSubmit();
        }
      }}
      className={cn("flex flex-wrap items-center gap-3", className)}
    >
      {children}
      {trailing ? <div className="ml-auto">{trailing}</div> : null}
    </form>
  );
}

/** Text input inside a FilterBar. Submits on Enter. */
export function FilterSearch({
  name = "q",
  defaultValue,
  placeholder,
  className,
}: {
  name?: string;
  defaultValue?: string;
  placeholder: string;
  className?: string;
}) {
  return (
    <>
      <label htmlFor={`filter-${name}`} className="sr-only">
        {placeholder}
      </label>
      <input
        id={`filter-${name}`}
        type="search"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={cn(
          "h-10 min-w-0 flex-1 rounded-app border border-hair-strong bg-chrome px-3.5",
          "text-app text-strong placeholder:text-subtle",
          "outline-none focus:border-brand-accent",
          className,
        )}
      />
    </>
  );
}

/** Native select styled to match the design. Submits the form on change. */
export function FilterSelect({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  /** Visible prefix, e.g. "Protection" renders as "Protection: All". */
  label: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <label htmlFor={`filter-${name}`} className="sr-only">
        {label}
      </label>
      <select
        id={`filter-${name}`}
        name={name}
        defaultValue={defaultValue}
        className={cn(
          "h-10 appearance-none rounded-app border border-hair-strong bg-chrome",
          "py-0 pl-3.5 pr-9 text-app text-strong outline-none focus:border-brand-accent",
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {`${label}: ${option.label}`}
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
