import { policyRoutes } from "@/features/policies/content";
import type { PolicyListItem } from "@/features/policies/labels";

/**
 * URL-addressable state for the Policy list. The list is shareable: tab,
 * search, and page all live in the URL rather than component state (§7 of
 * the coding standards). Unknown values normalize to the canonical default
 * instead of throwing, and a canonical URL omits its defaults.
 */

export const POLICY_PAGE_SIZE = 20;

export type PolicyTab = "all" | "draft" | "off";

export type PolicyListState = {
  tab: PolicyTab;
  page: number;
  query: string;
};

export type PolicyListSelection = {
  visible: readonly PolicyListItem[];
  total: number;
  counts: Record<PolicyTab, number>;
  page: number;
  pageCount: number;
  pageSize: 20;
};

function isPolicyTab(value: string): value is PolicyTab {
  return value === "all" || value === "draft" || value === "off";
}

/** Next.js search params may repeat a key; the first value wins. */
function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | string[] | undefined): number {
  const raw = Number(firstValue(value));
  return Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 1;
}

/**
 * Parse the awaited Next.js `searchParams` record into canonical list state.
 * Unknown/invalid values fall back to their default rather than crashing.
 * The `q` value is trimmed but not lowercased — it is the display value shown
 * back in the search field; comparisons lowercase separately in
 * `selectPolicyRows`. A stray `policy=` value (an invented detail-drawer
 * param from an earlier build) is ignored: the current Figma frame set has no
 * Policy detail surface.
 */
export function parsePolicyListState(
  searchParams: Record<string, string | string[] | undefined>,
): PolicyListState {
  const tabValue = firstValue(searchParams.tab) ?? "all";
  const tab = isPolicyTab(tabValue) ? tabValue : "all";
  const page = parsePage(searchParams.page);
  const query = (firstValue(searchParams.q) ?? "").trim();
  return { tab, page, query };
}

/**
 * Filter, count, and page a set of Policy rows for the given list state.
 * `enforced` rows are only ever visible under the `all` tab. Search is
 * case-insensitive; `counts` reflects each tab's total regardless of the
 * current search text (for the tab badges), while `total`/`visible` reflect
 * the active tab and search combined.
 */
export function selectPolicyRows(
  rows: readonly PolicyListItem[],
  state: PolicyListState,
): PolicyListSelection {
  const needle = state.query.trim().toLowerCase();
  const matchesQuery = (row: PolicyListItem) =>
    needle === "" || row.name.toLowerCase().includes(needle);

  const counts: Record<PolicyTab, number> = {
    all: rows.length,
    draft: rows.filter((row) => row.lifecycle === "draft").length,
    off: rows.filter((row) => row.lifecycle === "off").length,
  };

  const inTab = rows.filter((row) => state.tab === "all" || row.lifecycle === state.tab);
  const matched = inTab.filter(matchesQuery);
  const total = matched.length;
  const pageCount = Math.max(1, Math.ceil(total / POLICY_PAGE_SIZE));
  const page = Math.min(Math.max(1, state.page), pageCount);
  const start = (page - 1) * POLICY_PAGE_SIZE;
  const visible = matched.slice(start, start + POLICY_PAGE_SIZE);

  return { visible, total, counts, page, pageCount, pageSize: POLICY_PAGE_SIZE };
}

/**
 * Build a `/policies` URL for the given state, merging an optional patch.
 * Canonical defaults are omitted from the query string: `tab=all`, a blank
 * `q`, and `page=1`. Tab/search changes should pass (or imply) `page: 1` in
 * the patch; pagination changes pass the requested page unchanged.
 */
export function policyListHref(state: PolicyListState, patch?: Partial<PolicyListState>): string {
  const merged: PolicyListState = { ...state, ...patch };
  const params = new URLSearchParams();
  if (merged.tab !== "all") params.set("tab", merged.tab);
  if (merged.query !== "") params.set("q", merged.query);
  if (merged.page !== 1) params.set("page", String(merged.page));

  const query = params.toString();
  return query ? `${policyRoutes.list}?${query}` : policyRoutes.list;
}
