import type { Row } from "@tanstack/react-table";

import { EnforcementModeCell, HealthCell, LifecyclePill } from "@/features/policies/components/PolicyCells";
import type { policyTableFeatures } from "@/features/policies/components/policy-columns";
import type { PolicyListItem } from "@/features/policies/labels";

/**
 * One native `<tr>` for the Policy list table, in the Figma column order.
 * No cell is a click target: the current Figma frame set has no Policy
 * detail surface to link to (the old `?policy=` drawer route was invented,
 * not designed — see list-state.ts's parsing note).
 */
export function PolicyListRow({ row }: { row: Row<typeof policyTableFeatures, PolicyListItem> }) {
  const policy = row.original;
  return (
    <tr>
      <td className="px-5 py-4 text-policy-table-body font-medium text-strong">{policy.name}</td>
      <td className="px-5 py-4">
        <LifecyclePill value={policy.lifecycle} />
      </td>
      <td className="whitespace-nowrap px-5 py-4">
        <EnforcementModeCell value={policy.enforcementMode} />
      </td>
      <td className="px-5 py-4">
        <HealthCell value={policy.health} />
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-policy-table-body text-copy">{policy.owner}</td>
      <td className="whitespace-nowrap px-5 py-4 text-policy-table-body text-copy">{policy.lastChange}</td>
    </tr>
  );
}
