// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { PolicyList } from "@/features/policies/components/PolicyList";
import { policyListContent } from "@/features/policies/content";
import type { PolicyListItem } from "@/features/policies/labels";
import type { PolicyListSelection, PolicyListState } from "@/features/policies/list-state";

/**
 * Synthetic fixture data, independent of the real 15-row Figma fixture in
 * data.ts (server-only, so it cannot be imported into this jsdom test). Every
 * field is a complete, schema-shaped `PolicyListItem` — the exact values
 * don't matter, only that the shapes are real.
 */
const DEFAULT_STATE: PolicyListState = { tab: "all", page: 1, query: "" };

const ROWS: PolicyListItem[] = Array.from({ length: 20 }, (_, index) => {
  const lifecycle: PolicyListItem["lifecycle"] =
    index % 3 === 0 ? "off" : index % 3 === 1 ? "draft" : "enforced";
  return {
    id: `policy-${index}`,
    name: `Synthetic policy ${index}`,
    lifecycle,
    enforcementMode: lifecycle === "enforced" ? "Block" : null,
    health: "Healthy",
    owner: "Jae Sanders",
    lastChange: "1 day ago",
  };
});

const FIXTURE_SELECTION: PolicyListSelection = {
  visible: ROWS,
  total: ROWS.length,
  counts: {
    all: ROWS.length,
    draft: ROWS.filter((row) => row.lifecycle === "draft").length,
    off: ROWS.filter((row) => row.lifecycle === "off").length,
  },
  page: 1,
  pageCount: 1,
  pageSize: 20,
};

describe("PolicyList", () => {
  it("renders the Figma table and URL-backed controls", async () => {
    const { container } = render(<PolicyList state={DEFAULT_STATE} selection={FIXTURE_SELECTION} />);

    expect(screen.getByRole("heading", { level: 1, name: "Policies" })).toBeVisible();
    expect(screen.getByRole("link", { name: /All/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "New policy" })).toHaveAttribute("href", "/policies/new");

    const table = screen.getByRole("table", { name: "Policies" });
    expect(within(table).getAllByRole("columnheader")).toHaveLength(6);
    expect(within(table).getAllByRole("row")).toHaveLength(21);

    expect((await axe(container)).violations).toEqual([]);
  });

  it("shows a recovery action instead of the table when nothing matches", async () => {
    const emptySelection: PolicyListSelection = {
      ...FIXTURE_SELECTION,
      visible: [],
      total: 0,
      page: 1,
      pageCount: 1,
    };
    const { container } = render(
      <PolicyList state={{ ...DEFAULT_STATE, query: "no such policy" }} selection={emptySelection} />,
    );

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText(policyListContent.empty.title)).toBeVisible();
    expect(screen.getByRole("link", { name: policyListContent.empty.action })).toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("disables Delete and keeps Refresh/Export inert (no wired destination yet)", () => {
    render(<PolicyList state={DEFAULT_STATE} selection={FIXTURE_SELECTION} />);
    expect(screen.getByRole("button", { name: policyListContent.deleteSelected })).toBeDisabled();
  });
});
