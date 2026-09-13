import { policyListContent } from "@/features/policies/content";
import { cn } from "@/lib/utils";

/** One pulsing placeholder bar. Height/width are plain Tailwind spacing
 * utilities (shape only), never a design token — a skeleton bar isn't a
 * themeable value, unlike the colour it's painted with. */
function Bar({ className }: { className?: string }) {
  return <div className={cn("rounded-app bg-line", className)} />;
}

/**
 * Streaming fallback for the Policy list (`app/(app)/policies/loading.tsx`).
 * Reproduces the real screen's shape — title, tabs, toolbar, the six-column
 * header row, and eight row bars — as `animate-pulse` placeholders, so the
 * layout doesn't jump once the real `PolicyList` streams in. Every part below
 * the title depends on data that isn't known yet (tab counts, search state),
 * so it renders as shape only, never guessed text.
 */
export function PolicyListSkeleton() {
  return (
    <div className="px-12 py-8">
      <h1 className="text-page-title font-normal text-strong">{policyListContent.title}</h1>

      <div
        role="status"
        aria-label={policyListContent.loading}
        className="animate-pulse motion-reduce:animate-none"
      >
        {/* Tabs: All / Draft / Off */}
        <div className="mt-5 flex items-center gap-6">
          <Bar className="h-5 w-12" />
          <Bar className="h-5 w-14" />
          <Bar className="h-5 w-10" />
        </div>

        {/* Toolbar: refresh / delete / export, search, new policy */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Bar className="size-icon-button shrink-0" />
          <Bar className="size-icon-button shrink-0" />
          <Bar className="size-icon-button shrink-0" />
          <Bar className="h-9 min-w-0 flex-1" />
          <Bar className="h-9 w-32 shrink-0" />
        </div>

        {/* Results summary */}
        <Bar className="mt-3 ml-auto h-4 w-40" />

        <div className="mt-3 overflow-hidden rounded-app border border-policy-table-border bg-chrome">
          <div className="grid grid-cols-6 gap-4 border-b border-policy-table-head-border bg-policy-table-head px-5 py-3">
            {policyListContent.columns.map((column) => (
              <Bar key={column} className="h-3 w-3/4" />
            ))}
          </div>

          <div className="divide-y divide-policy-table-border">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                data-testid="policy-skeleton-row"
                className="grid grid-cols-6 items-center gap-4 px-5 py-4"
              >
                <Bar className="h-4 w-5/6" />
                <Bar className="h-6 w-16 rounded-app" />
                <Bar className="h-4 w-2/3" />
                <Bar className="h-4 w-4/5" />
                <Bar className="h-4 w-2/3" />
                <Bar className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
