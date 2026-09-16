"use client";

import { useController, useFormContext } from "react-hook-form";

import { CollectionSelect } from "@/features/policies/components/CollectionSelect";
import { RowConnector, SectionChip } from "@/features/policies/components/conditions-ui";
import { PolicyConditionsSection } from "@/features/policies/components/PolicyConditionsSection";
import { PolicySelect } from "@/features/policies/components/PolicySelect";
import { policyBuilderContent, policyRoutes } from "@/features/policies/content";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";
import type { PolicyCatalogs } from "@/features/policies/types";

const data = policyBuilderContent.data;

/**
 * Clipboard channel's Conditions card: the shared CONTENT block plus the
 * PASTE TARGET block — "Paste into" (`clipboard.targetOp` + `clipboard.targetIds`)
 * and "Fires when" (`clipboard.firesWhen`) — Figma `396:4868` / `512:421`.
 * "Paste into" is a match operator ("one of" / "not one of") next to a
 * category-tagged paste-target multi-select summarising as "any target" /
 * "N targets", with a "Manage" link inline to its right; "Fires when" is a
 * single-select for the paste kind. Registers only `clipboard.*` (the shared
 * `content.*` block is owned by `PolicyConditionFields`).
 */
export function ClipboardConditions({ catalogs }: { catalogs: PolicyCatalogs }) {
  const { control } = useFormContext<PolicyAuthoringValues>();
  const targetOpField = useController({ control, name: "clipboard.targetOp" });
  const targetIdsField = useController({ control, name: "clipboard.targetIds" });
  const firesWhenField = useController({ control, name: "clipboard.firesWhen" });

  const chosen = targetIdsField.field.value;
  const targetSummary =
    chosen.length === 0
      ? data.anyTarget
      : chosen.length === 1
        ? (catalogs.pasteTargets.find((option) => option.value === chosen[0])?.label ?? chosen[0])
        : data.targetsSummary(chosen.length);
  const targetHelp =
    chosen.length === 0
      ? data.targetHelp
      : targetOpField.field.value === "not-one-of"
        ? data.targetHelpNotOneOf
        : data.targetHelpOneOf;
  const firesWhenNote = data.firesWhenNotes[firesWhenField.field.value];

  return (
    <PolicyConditionsSection catalogs={catalogs}>
      <div className="flex flex-col items-start gap-3">
        <SectionChip>{data.pasteTargetChip}</SectionChip>

        {/* Paste into — match operator + category-tagged target multi-select */}
        <div className="flex items-start gap-2">
          <RowConnector />
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <PolicySelect
                pill
                id="policy-data-clipboard-target-op"
                label={data.pasteInto}
                value={targetOpField.field.value}
                onChange={targetOpField.field.onChange}
                options={data.targetOperators}
              />
              <CollectionSelect
                value={chosen}
                options={catalogs.pasteTargets}
                onChange={targetIdsField.field.onChange}
                summary={targetSummary}
                ariaLabel={data.targetSelectLabel}
              />
              <a href={policyRoutes.manageDomains} className="text-meta font-medium text-brand hover:text-brand-hover">
                {data.manageTargets}
              </a>
            </div>
            <p className="max-w-md text-meta text-dim">{targetHelp}</p>
          </div>
        </div>

        {/* Fires when — which kind of paste triggers the rule */}
        <div className="flex items-start gap-2">
          <RowConnector />
          <div className="flex min-w-0 flex-col gap-2">
            <PolicySelect
              pill
              id="policy-data-clipboard-fires-when"
              label={data.firesWhenLabel}
              value={firesWhenField.field.value}
              onChange={firesWhenField.field.onChange}
              options={data.firesWhenOptions}
            />
            {firesWhenNote ? <p className="max-w-md text-meta text-dim">{firesWhenNote}</p> : null}
          </div>
        </div>
      </div>
    </PolicyConditionsSection>
  );
}
