import Link from "next/link";

import { AppIcon } from "@/components/icons/AppIcon";
import { buttonVariants } from "@/components/ui/button";
import { policyListContent, policyRoutes } from "@/features/policies/content";
import type { PolicyListState } from "@/features/policies/list-state";
import { cn } from "@/lib/utils";

export type PolicyToolbarProps = {
  state: PolicyListState;
  className?: string;
};

const squareButtonClass =
  "flex size-icon-button shrink-0 items-center justify-center rounded-app border border-hair-strong " +
  "bg-chrome text-dim transition-colors hover:bg-hover disabled:pointer-events-none disabled:opacity-50";

/**
 * GET search form (Figma "Policies" toolbar). A hidden `tab` field keeps the
 * active tab across a search submit; omitting a `page` field means every
 * submit resets pagination to page 1 (list-state.ts's URL contract).
 *
 * Refresh and Export have no wired destination yet — there is no live data
 * feed or export endpoint behind this fixture screen — so they render as
 * inert buttons rather than fake affordances. Delete is always disabled:
 * this list has no row-selection mechanism to delete.
 */
export function PolicyToolbar({ state, className }: PolicyToolbarProps) {
  return (
    <form
      action={policyRoutes.list}
      role="search"
      className={cn("flex flex-wrap items-center gap-3", className)}
    >
      {state.tab === "all" ? null : <input type="hidden" name="tab" value={state.tab} />}

      <button type="button" aria-label={policyListContent.refresh} className={squareButtonClass}>
        <AppIcon name="refresh" className="size-app-icon" />
      </button>
      <button type="button" aria-label={policyListContent.deleteSelected} disabled className={squareButtonClass}>
        <AppIcon name="delete" className="size-app-icon" />
      </button>
      <button type="button" aria-label={policyListContent.export} className={squareButtonClass}>
        <AppIcon name="export" className="size-app-icon" />
      </button>

      <div className="relative min-w-0 flex-1">
        <AppIcon
          name="search"
          className="pointer-events-none absolute left-3 top-1/2 size-app-icon -translate-y-1/2 text-subtle"
        />
        <label htmlFor="policy-search" className="sr-only">
          {policyListContent.searchPlaceholder}
        </label>
        <input
          id="policy-search"
          type="search"
          name="q"
          defaultValue={state.query}
          placeholder={policyListContent.searchPlaceholder}
          className="h-9 w-full rounded-app border border-hair-strong bg-chrome pl-9 pr-3.5 text-app text-strong placeholder:text-subtle outline-none focus:border-brand-accent"
        />
      </div>

      <Link
        href={policyRoutes.create}
        className={buttonVariants({ variant: "appPrimary", size: "app", width: "auto" })}
      >
        <AppIcon name="plus" className="size-app-icon" />
        {policyListContent.newPolicy}
      </Link>
    </form>
  );
}
