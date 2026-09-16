"use client";

import { useController, useFormContext } from "react-hook-form";

import { FieldError } from "@/components/ui/form-field";
import { CollectionSelect } from "@/features/policies/components/CollectionSelect";
import { RowConnector, SectionChip } from "@/features/policies/components/conditions-ui";
import { PolicyConditionsSection } from "@/features/policies/components/PolicyConditionsSection";
import { PolicySelect } from "@/features/policies/components/PolicySelect";
import { policyBuilderContent, policyRoutes } from "@/features/policies/content";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";
import type { PolicyCatalogs } from "@/features/policies/types";

const data = policyBuilderContent.data;

/**
 * Desktop apps channel's Conditions card APP block (Figma `563:9286`): "App is"
 * (a match operator `appOp` + an app multi-select `applicationIds` over
 * `applications`, with a "Manage" link) and "Fires when" (`firesWhen`). Same
 * PASTE TARGET shape as clipboard, except at least one app is required — the
 * policy watches named apps, so an empty selection is invalid (the error sits
 * under the row). Registers only `desktopApps.*` (the shared `content.*` block
 * is owned by `PolicyConditionFields`); the enforcement escape hatch
 * (`exceptionIds`) is edited in the Enforcement step.
 */
export function DesktopAppConditions({ catalogs }: { catalogs: PolicyCatalogs }) {
  const {
    control,
    formState: { errors },
  } = useFormContext<PolicyAuthoringValues>();
  const appOpField = useController({ control, name: "desktopApps.appOp" });
  const appIdsField = useController({ control, name: "desktopApps.applicationIds" });
  const firesWhenField = useController({ control, name: "desktopApps.firesWhen" });

  const chosen = appIdsField.field.value;
  const appsSummary =
    chosen.length === 0
      ? data.selectApps
      : chosen.length === 1
        ? (catalogs.applications.find((option) => option.value === chosen[0])?.label ?? chosen[0])
        : data.appsSummary(chosen.length);
  const firesWhenNote = data.appFiresWhenNotes[firesWhenField.field.value];
  const appsError = errors.desktopApps?.applicationIds?.message;

  return (
    <PolicyConditionsSection catalogs={catalogs}>
      <div className="flex flex-col items-start gap-3">
        <SectionChip>{data.appChip}</SectionChip>

        {/* App is — match operator + app multi-select */}
        <div className="flex items-start gap-2">
          <RowConnector />
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <PolicySelect
                pill
                id="policy-data-desktop-app-op"
                label={data.appIsLabel}
                value={appOpField.field.value}
                onChange={appOpField.field.onChange}
                options={data.targetOperators}
              />
              <CollectionSelect
                value={chosen}
                options={catalogs.applications}
                onChange={appIdsField.field.onChange}
                summary={appsSummary}
                ariaLabel={data.appSelectLabel}
              />
              <a
                href={policyRoutes.manageApplications}
                className="text-meta font-medium text-brand hover:text-brand-hover"
              >
                {data.manageApps}
              </a>
            </div>
            <p className="max-w-md text-meta text-dim">{data.appsHelp}</p>
            {appsError ? <FieldError id="policy-data-desktop-apps-error">{appsError}</FieldError> : null}
          </div>
        </div>

        {/* Fires when — which app transfer triggers the rule */}
        <div className="flex items-start gap-2">
          <RowConnector />
          <div className="flex min-w-0 flex-col gap-2">
            <PolicySelect
              pill
              id="policy-data-desktop-fires-when"
              label={data.firesWhenLabel}
              value={firesWhenField.field.value}
              onChange={firesWhenField.field.onChange}
              options={data.appFiresWhenOptions}
            />
            {firesWhenNote ? <p className="max-w-md text-meta text-dim">{firesWhenNote}</p> : null}
          </div>
        </div>
      </div>
    </PolicyConditionsSection>
  );
}
