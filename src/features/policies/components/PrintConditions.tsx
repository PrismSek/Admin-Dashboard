"use client";

import { useController, useFormContext } from "react-hook-form";

import { PolicyConditionFields } from "@/features/policies/components/PolicyConditionFields";
import { PolicyExceptionField } from "@/features/policies/components/PolicyExceptionField";
import { PolicySelect } from "@/features/policies/components/PolicySelect";
import { policyBuilderContent } from "@/features/policies/content";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";
import type { PolicyCatalogs } from "@/features/policies/types";

const data = policyBuilderContent.data;

/**
 * Print channel's PRINTER section — "Printer is" (`print.target`) — and its
 * EXCEPTION picker (`print.exceptionIds`) — Figma `563:6975`/`563:7670`/
 * `563:8722`. Registers only `print.*` (plus the shared `content.*` CONTENT
 * block).
 */
export function PrintConditions({ catalogs }: { catalogs: PolicyCatalogs }) {
  const {
    control,
    formState: { errors },
  } = useFormContext<PolicyAuthoringValues>();
  const targetField = useController({ control, name: "print.target" });

  return (
    <>
      <PolicyConditionFields findings={catalogs.findings} />

      <section className="mt-6">
        <span className="text-micro font-medium tracking-wide text-subtle">{data.printerChip}</span>
        <div className="mt-2">
          <PolicySelect
            id="policy-data-print-target"
            label={data.printerIsLabel}
            value={targetField.field.value}
            onChange={targetField.field.onChange}
            options={catalogs.printerTargets}
            error={errors.print?.target?.message}
          />
          <p className="mt-2 max-w-md text-meta text-dim">{data.printerHelp}</p>
        </div>
      </section>

      <PolicyExceptionField
        name="print.exceptionIds"
        placeholder={data.printExceptionExample}
        error={errors.print?.exceptionIds?.message}
      />
    </>
  );
}
