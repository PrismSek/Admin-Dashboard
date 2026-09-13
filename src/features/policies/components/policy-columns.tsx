import { createColumnHelper, tableFeatures } from "@tanstack/react-table";

import { policyListContent } from "@/features/policies/content";
import type { PolicyListItem } from "@/features/policies/labels";

/**
 * TanStack Table v9 requires an explicit (even empty) `tableFeatures()` set,
 * and column defs bound to it via `createColumnHelper` — the v8
 * `useReactTable({ getCoreRowModel: getCoreRowModel() })` shape used by
 * earlier drafts of this table no longer exists (see
 * node_modules/@tanstack/react-table/skills/getting-started). This table
 * registers no optional feature: sorting/filtering/pagination all live in
 * the URL via list-state.ts, not in the table instance.
 */
export const policyTableFeatures = tableFeatures({});

const columnHelper = createColumnHelper<typeof policyTableFeatures, PolicyListItem>();

/**
 * Column definitions for the Policy list table (Figma node 398:16105, six
 * columns, in visual order — see `policyListContent.columns`). Only the
 * header is used from these defs: every cell is rendered directly by
 * `PolicyListRow` from `row.original`.
 */
export const policyColumns = columnHelper.columns([
  columnHelper.accessor("name", { header: policyListContent.columns[0] }),
  columnHelper.accessor("lifecycle", { header: policyListContent.columns[1] }),
  columnHelper.accessor("enforcementMode", { header: policyListContent.columns[2] }),
  columnHelper.accessor("health", { header: policyListContent.columns[3] }),
  columnHelper.accessor("owner", { header: policyListContent.columns[4] }),
  columnHelper.accessor("lastChange", { header: policyListContent.columns[5] }),
]);
