"use client";

import { useController, useFormContext } from "react-hook-form";

import { RowConnector, SectionChip } from "@/features/policies/components/conditions-ui";
import { PolicyConditionsSection } from "@/features/policies/components/PolicyConditionsSection";
import { PolicySelect } from "@/features/policies/components/PolicySelect";
import { policyBuilderContent } from "@/features/policies/content";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";
import type { PolicyCatalogs } from "@/features/policies/types";

const data = policyBuilderContent.data;

/**
 * Print channel's Conditions card PRINTER block — "Printer is"
 * (`print.target`) — Figma `563:6975` family. The select defaults to "Unknown"
 * and is never empty, so no placeholder or required error is wired. Registers
 * only `print.*` (the shared `content.*` block is owned by
 * `PolicyConditionsSection`); the enforcement escape hatch (`exceptionIds`) is
 * edited in the Enforcement step.
 */
export function PrintConditions({ catalogs }: { catalogs: PolicyCatalogs }) {
  const { control } = useFormContext<PolicyAuthoringValues>();
  const targetField = useController({ control, name: "print.target" });

  return (
    <PolicyConditionsSection catalogs={catalogs}>
      <div className="flex flex-col items-start gap-3">
        <SectionChip>{data.printerChip}</SectionChip>
        <div className="flex items-start gap-2">
          <RowConnector />
          <div className="flex min-w-0 flex-col gap-2">
            <PolicySelect
              pill
              id="policy-data-print-target"
              label={data.printerIsLabel}
              value={targetField.field.value}
              onChange={targetField.field.onChange}
              options={catalogs.printerTargets}
            />
            <p className="max-w-md text-meta text-dim">{data.printerHelp}</p>
          </div>
        </div>
      </div>
    </PolicyConditionsSection>
  );
}
