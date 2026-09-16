"use client";

import { useController, useFormContext } from "react-hook-form";

import { RowConnector, SectionChip } from "@/features/policies/components/conditions-ui";
import { PolicyConditionsSection } from "@/features/policies/components/PolicyConditionsSection";
import { PolicyExceptionField } from "@/features/policies/components/PolicyExceptionField";
import { PolicySelect } from "@/features/policies/components/PolicySelect";
import { policyBuilderContent } from "@/features/policies/content";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";
import type { PolicyCatalogs } from "@/features/policies/types";

const data = policyBuilderContent.data;

/**
 * Print channel's Conditions card PRINTER block — "Printer is"
 * (`print.target`) — plus its EXCEPTION picker (`print.exceptionIds`) below the
 * card — Figma `563:6975` family. Registers only `print.*` (the shared
 * `content.*` block is owned by `PolicyConditionsSection`).
 */
export function PrintConditions({ catalogs }: { catalogs: PolicyCatalogs }) {
  const {
    control,
    formState: { errors },
  } = useFormContext<PolicyAuthoringValues>();
  const targetField = useController({ control, name: "print.target" });

  return (
    <>
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
                placeholder={data.printerPlaceholder}
                error={errors.print?.target?.message}
              />
              <p className="max-w-md text-meta text-dim">{data.printerHelp}</p>
            </div>
          </div>
        </div>
      </PolicyConditionsSection>

      <PolicyExceptionField
        name="print.exceptionIds"
        placeholder={data.printExceptionExample}
        error={errors.print?.exceptionIds?.message}
      />
    </>
  );
}
