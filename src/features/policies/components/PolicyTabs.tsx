import { Tabs } from "@/components/app/tabs";
import { policyListContent } from "@/features/policies/content";
import { policyListHref, type PolicyListSelection, type PolicyListState } from "@/features/policies/list-state";

export type PolicyTabsProps = {
  state: PolicyListState;
  counts: PolicyListSelection["counts"];
  className?: string;
};

/**
 * All / Draft / Off. The selected tab lives in the URL (via `policyListHref`,
 * not component state), and each tab shows its own count as a muted number —
 * the Figma "Policies" tab-bar treatment (`Tabs`'s `mutedCount`).
 */
export function PolicyTabs({ state, counts, className }: PolicyTabsProps) {
  return (
    <Tabs
      className={className}
      mutedCount
      items={[
        {
          label: policyListContent.tabs.all,
          href: policyListHref(state, { tab: "all", page: 1 }),
          count: counts.all,
          active: state.tab === "all",
        },
        {
          label: policyListContent.tabs.draft,
          href: policyListHref(state, { tab: "draft", page: 1 }),
          count: counts.draft,
          active: state.tab === "draft",
        },
        {
          label: policyListContent.tabs.off,
          href: policyListHref(state, { tab: "off", page: 1 }),
          count: counts.off,
          active: state.tab === "off",
        },
      ]}
    />
  );
}
