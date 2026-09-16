"use client";

import { useController, useFormContext } from "react-hook-form";

import { ApplicationSelect } from "@/features/policies/components/ApplicationSelect";
import { RowConnector, SectionChip } from "@/features/policies/components/conditions-ui";
import { PolicyConditionsSection } from "@/features/policies/components/PolicyConditionsSection";
import { PolicyExceptionField } from "@/features/policies/components/PolicyExceptionField";
import { policyBuilderContent } from "@/features/policies/content";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";
import type { PolicyCatalogs } from "@/features/policies/types";

const data = policyBuilderContent.data;

/**
 * Desktop apps channel's Conditions card APP block — "App is"
 * (`desktopApps.applicationIds`) — plus its EXCEPTION picker
 * (`desktopApps.exceptionIds`) below the card — Figma `563:9286` family.
 * Registers only `desktopApps.*` (the shared `content.*` block is owned by
 * `PolicyConditionsSection`).
 */
export function DesktopAppConditions({ catalogs }: { catalogs: PolicyCatalogs }) {
  const {
    control,
    formState: { errors },
  } = useFormContext<PolicyAuthoringValues>();
  const appsField = useController({ control, name: "desktopApps.applicationIds" });

  return (
    <>
      <PolicyConditionsSection catalogs={catalogs}>
        <div className="flex flex-col items-start gap-3">
          <SectionChip>{data.appChip}</SectionChip>
          <div className="flex items-start gap-2">
            <RowConnector />
            <div className="flex min-w-0 flex-col gap-2">
              <ApplicationSelect
                value={appsField.field.value}
                options={catalogs.applications}
                onChange={appsField.field.onChange}
                error={errors.desktopApps?.applicationIds?.message}
              />
              <p className="max-w-md text-meta text-dim">{data.appsHelp}</p>
            </div>
          </div>
        </div>
      </PolicyConditionsSection>

      <PolicyExceptionField
        name="desktopApps.exceptionIds"
        placeholder={data.desktopExceptionExample}
        error={errors.desktopApps?.exceptionIds?.message}
      />
    </>
  );
}
