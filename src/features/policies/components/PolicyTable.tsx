"use client";

import { useTable } from "@tanstack/react-table";

import { policyColumns, policyTableFeatures } from "@/features/policies/components/policy-columns";
import { PolicyListRow } from "@/features/policies/components/PolicyListRow";
import { policyListContent } from "@/features/policies/content";
import type { PolicyListItem } from "@/features/policies/labels";

export type PolicyTableProps = {
  rows: readonly PolicyListItem[];
};

/**
 * The six-column Policy table (Figma node 398:16105). TanStack Table v9 is
 * used headlessly for the header row only — `PolicyListRow` renders each
 * row's cells directly from `row.original`, since no column needs a custom
 * cell renderer, sort, or filter (those live in the URL via list-state.ts,
 * not the table). `useTable` is a hook, so this is the one Client Component
 * boundary in the list; everything above it stays server-rendered.
 */
export function PolicyTable({ rows }: PolicyTableProps) {
  const table = useTable({
    features: policyTableFeatures,
    columns: policyColumns,
    data: [...rows],
    getRowId: (row) => row.id,
  });

  return (
    <table aria-label={policyListContent.title} className="w-full border-collapse text-left">
      <thead className="border-b border-policy-table-head-border bg-policy-table-head">
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
              <th
                key={header.id}
                scope="col"
                className="px-5 py-3 text-policy-table-head font-medium tracking-policy-table-head text-strong"
              >
                {header.isPlaceholder ? null : <table.FlexRender header={header} />}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="divide-y divide-policy-table-border">
        {table.getRowModel().rows.map((row) => (
          <PolicyListRow key={row.id} row={row} />
        ))}
      </tbody>
    </table>
  );
}
