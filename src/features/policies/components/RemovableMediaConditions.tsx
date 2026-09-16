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
 * Removable media channel's Conditions card DEVICE block — "Registered as"
 * (`removableMedia.target`) — plus its EXCEPTION picker
 * (`removableMedia.exceptionIds`) below the card — Figma `563:3248` family.
 * Registers only `removableMedia.*` (the shared `content.*` block is owned by
 * `PolicyConditionsSection`).
 */
export function RemovableMediaConditions({ catalogs }: { catalogs: PolicyCatalogs }) {
  const {
    control,
    formState: { errors },
  } = useFormContext<PolicyAuthoringValues>();
  const targetField = useController({ control, name: "removableMedia.target" });

  return (
    <>
      <PolicyConditionsSection catalogs={catalogs}>
        <div className="flex flex-col items-start gap-3">
          <SectionChip>{data.deviceChip}</SectionChip>
          <div className="flex items-start gap-2">
            <RowConnector />
            <div className="flex min-w-0 flex-col gap-2">
              <PolicySelect
                pill
                id="policy-data-removable-target"
                label={data.registeredAsLabel}
                value={targetField.field.value}
                onChange={targetField.field.onChange}
                options={catalogs.removableTargets}
                placeholder={data.registeredAsPlaceholder}
                error={errors.removableMedia?.target?.message}
              />
              <p className="max-w-md text-meta text-dim">{data.registeredAsHelp}</p>
            </div>
          </div>
        </div>
      </PolicyConditionsSection>

      <PolicyExceptionField
        name="removableMedia.exceptionIds"
        placeholder={data.removableExceptionExample}
        error={errors.removableMedia?.exceptionIds?.message}
      />
    </>
  );
}
