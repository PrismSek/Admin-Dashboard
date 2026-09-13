import { describe, expect, it } from "vitest";

import {
  parsePolicyListState,
  policyListHref,
  selectPolicyRows,
} from "@/features/policies/list-state";

describe("Policy list URL state", () => {
  it("normalizes unknown values and omits canonical defaults", () => {
    expect(parsePolicyListState({ tab: "bad", page: "-8", q: "  Cloud  " })).toEqual({
      tab: "all",
      page: 1,
      query: "Cloud",
    });
    expect(policyListHref({ tab: "all", page: 1, query: "" })).toBe("/policies");
  });

  it("filters case-insensitively and pages twenty rows", () => {
    const rows = Array.from({ length: 21 }, (_, index) => ({
      id: `p${index}`,
      name: index === 20 ? "Cloud export" : `Policy ${index}`,
      lifecycle: index % 2 === 0 ? ("draft" as const) : ("off" as const),
      enforcementMode: null,
      // A valid `health` literal; the schema widened past "unknown" once the
      // real Figma list capture turned out to carry five distinct values
      // (see schemas.ts / data.ts) — the exact value is not asserted here.
      health: "Healthy" as const,
      owner: "Jae Sanders",
      lastChange: "1 day ago",
    }));
    const selected = selectPolicyRows(rows, { tab: "all", page: 2, query: "" });
    expect(selected.visible).toHaveLength(1);
    expect(selected.pageSize).toBe(20);
    expect(selectPolicyRows(rows, { tab: "all", page: 1, query: "cloud" }).total).toBe(1);
  });
});
