"use client";

import { useController, useFormContext } from "react-hook-form";

import { ApplicationSelect } from "@/features/policies/components/ApplicationSelect";
import { PolicyConditionFields } from "@/features/policies/components/PolicyConditionFields";
import { PolicyExceptionField } from "@/features/policies/components/PolicyExceptionField";
import { policyBuilderContent } from "@/features/policies/content";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";
import type { PolicyCatalogs } from "@/features/policies/types";

const data = policyBuilderContent.data;

/**
 * Desktop apps channel's APP section — "App is" (`desktopApps.
 * applicationIds`) — and its EXCEPTION picker (`desktopApps.exceptionIds`) —
 * Figma `563:9286`/`563:10020`/`563:10405`/`563:12255`. Registers only
 * `desktopApps.*` (plus the shared `content.*` CONTENT block).
 */
export function DesktopAppConditions({ catalogs }: { catalogs: PolicyCatalogs }) {
  const {
    control,
    formState: { errors },
  } = useFormContext<PolicyAuthoringValues>();
  const appsField = useController({ control, name: "desktopApps.applicationIds" });

  return (
    <>
      <PolicyConditionFields findings={catalogs.findings} />

      <section className="mt-6">
        <span className="text-micro font-medium tracking-wide text-subtle">{data.appChip}</span>
        <div className="mt-2">
          <ApplicationSelect
            value={appsField.field.value}
            options={catalogs.applications}
            onChange={appsField.field.onChange}
            error={errors.desktopApps?.applicationIds?.message}
          />
          <p className="mt-2 max-w-md text-meta text-dim">{data.appsHelp}</p>
        </div>
      </section>

      <PolicyExceptionField
        name="desktopApps.exceptionIds"
        placeholder={data.desktopExceptionExample}
        error={errors.desktopApps?.exceptionIds?.message}
      />
    </>
  );
}
