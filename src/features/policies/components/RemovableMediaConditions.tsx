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
 * Removable media channel's DEVICE section — "Registered as"
 * (`removableMedia.target`) — and its EXCEPTION picker
 * (`removableMedia.exceptionIds`) — Figma `563:3248`/`563:4039`/`563:4421`/
 * `563:4823`/`563:5257`/`563:6411`. Registers only `removableMedia.*` (plus
 * the shared `content.*` CONTENT block).
 */
export function RemovableMediaConditions({ catalogs }: { catalogs: PolicyCatalogs }) {
  const {
    control,
    formState: { errors },
  } = useFormContext<PolicyAuthoringValues>();
  const targetField = useController({ control, name: "removableMedia.target" });

  return (
    <>
      <PolicyConditionFields findings={catalogs.findings} />

      <section className="mt-6">
        <span className="text-micro font-medium tracking-wide text-subtle">{data.deviceChip}</span>
        <div className="mt-2">
          <PolicySelect
            id="policy-data-removable-target"
            label={data.registeredAsLabel}
            value={targetField.field.value}
            onChange={targetField.field.onChange}
            options={catalogs.removableTargets}
            error={errors.removableMedia?.target?.message}
          />
          <p className="mt-2 max-w-md text-meta text-dim">{data.registeredAsHelp}</p>
        </div>
      </section>

      <PolicyExceptionField
        name="removableMedia.exceptionIds"
        placeholder={data.removableExceptionExample}
        error={errors.removableMedia?.exceptionIds?.message}
      />
    </>
  );
}
