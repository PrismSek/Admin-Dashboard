import Link from "next/link";

import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { PolicyListEmpty } from "@/features/policies/components/PolicyListEmpty";
import { PolicyTable } from "@/features/policies/components/PolicyTable";
import { PolicyTabs } from "@/features/policies/components/PolicyTabs";
import { PolicyToolbar } from "@/features/policies/components/PolicyToolbar";
import { policyListContent } from "@/features/policies/content";
import {
  policyListHref,
  type PolicyListSelection,
  type PolicyListState,
} from "@/features/policies/list-state";
import { cn } from "@/lib/utils";

export type PolicyListProps = {
  state: PolicyListState;
  selection: PolicyListSelection;
};

/**
 * The full Policy list screen: title, tabs, toolbar, result count, the table
 * (or its empty state), and the pagination footer. Purely presentational —
 * `state`/`selection` arrive as props from the (thin) route — so this stays
 * a plain component a component test can render without a server boundary.
 */
export function PolicyList({ state, selection }: PolicyListProps) {
  const { visible, total, counts, page, pageCount, pageSize } = selection;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="px-12 py-8">
      <h1 className="text-page-title font-normal text-strong">{policyListContent.title}</h1>

      <PolicyTabs state={state} counts={counts} className="mt-5" />
      <PolicyToolbar state={state} className="mt-5" />

      <p className="mt-3 text-right text-meta text-dim">
        {policyListContent.resultsSummary(total, counts.all)}
      </p>

      <div className="mt-3 overflow-hidden rounded-app border border-policy-table-border bg-chrome">
        {visible.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <PolicyTable rows={visible} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-policy-table-border px-5 py-3.5">
              <p className="text-meta text-dim">{policyListContent.pageSummary(from, to, total)}</p>
              <div className="flex items-center gap-1">
                <PageArrow
                  direction="previous"
                  href={page > 1 ? policyListHref(state, { page: page - 1 }) : undefined}
                />
                <span className="px-2 text-meta text-dim">
                  {page} / {pageCount}
                </span>
                <PageArrow
                  direction="next"
                  href={page < pageCount ? policyListHref(state, { page: page + 1 }) : undefined}
                />
              </div>
            </div>
          </>
        ) : (
          <PolicyListEmpty />
        )}
      </div>
    </div>
  );
}

const pageArrowClass =
  "flex size-icon-button items-center justify-center rounded-app text-dim transition-colors hover:bg-hover";

/** One pagination arrow. Renders as a disabled-looking, non-focusable span
 * at a list boundary (page 1's "previous", the last page's "next") rather
 * than a link to nowhere. */
function PageArrow({ direction, href }: { direction: "previous" | "next"; href?: string }) {
  const icon: AppIconName = direction === "previous" ? "chevron-left" : "chevron-right";
  const label = direction === "previous" ? "Previous page" : "Next page";

  if (!href) {
    return (
      <span aria-hidden className={cn(pageArrowClass, "pointer-events-none text-subtle opacity-50")}>
        <AppIcon name={icon} className="size-app-icon" />
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className={pageArrowClass}>
      <AppIcon name={icon} className="size-app-icon" />
    </Link>
  );
}
