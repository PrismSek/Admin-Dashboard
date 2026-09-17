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
 * Removable media channel's Conditions card DEVICE block (Figma `563:3248`):
 * "Device is" (`removableMedia.deviceClass`), "Registered as" (a match operator
 * `registrationOp` + a registration-list multi-select `registrationIds` over
 * `removableTargets`, with a "Manage" link), and "Transfer is"
 * (`removableMedia.transfer`). Registers only `removableMedia.*` (the shared
 * `content.*` block is owned by `PolicyConditionFields`); the enforcement escape
 * hatch (`exceptionIds`) is edited in the Enforcement step.
 */
export function RemovableMediaConditions({ catalogs }: { catalogs: PolicyCatalogs }) {
  const {
    control,
    formState: { errors },
  } = useFormContext<PolicyAuthoringValues>();
  const deviceClassField = useController({ control, name: "removableMedia.deviceClass" });
  const registrationOpField = useController({ control, name: "removableMedia.registrationOp" });
  const registrationIdsField = useController({ control, name: "removableMedia.registrationIds" });
  const transferField = useController({ control, name: "removableMedia.transfer" });

  const chosen = registrationIdsField.field.value;
  const registrationSummary =
    chosen.length === 0
      ? data.anyList
      : chosen.length === 1
        ? (catalogs.removableTargets.find((option) => option.value === chosen[0])?.label ?? chosen[0])
        : data.listsSummary(chosen.length);
  const registrationHelp =
    chosen.length === 0
      ? data.registeredAsHelp
      : registrationOpField.field.value === "not-one-of"
        ? data.registeredAsHelpNotOneOf
        : data.registeredAsHelpOneOf;
  const deviceClassNote = data.deviceClassNotes[deviceClassField.field.value];

  return (
    <PolicyConditionsSection catalogs={catalogs}>
      <div className="flex flex-col items-start gap-3">
        <SectionChip>{data.deviceChip}</SectionChip>

        {/* Device is — the device class */}
        <div className="flex items-start gap-2">
          <RowConnector />
          <div className="flex min-w-0 flex-col gap-2">
            <PolicySelect
              pill
              id="policy-data-removable-device-class"
              label={data.deviceIsLabel}
              value={deviceClassField.field.value}
              onChange={deviceClassField.field.onChange}
              options={catalogs.deviceClasses}
              placeholder={policyBuilderContent.chooseOne}
              error={errors.removableMedia?.deviceClass?.message}
            />
            {deviceClassNote ? <p className="max-w-md text-meta text-dim">{deviceClassNote}</p> : null}
          </div>
        </div>

        {/* Registered as — match operator + registration-list multi-select */}
        <div className="flex items-start gap-2">
          <RowConnector />
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <PolicySelect
                pill
                id="policy-data-removable-registration-op"
                label={data.registeredAsLabel}
                value={registrationOpField.field.value}
                onChange={registrationOpField.field.onChange}
                options={data.targetOperators}
                placeholder={policyBuilderContent.chooseOne}
                error={errors.removableMedia?.registrationOp?.message}
              />
              <CollectionSelect
                value={chosen}
                options={catalogs.removableTargets}
                onChange={registrationIdsField.field.onChange}
                summary={registrationSummary}
                ariaLabel={data.registrationSelectLabel}
              />
              <a href={policyRoutes.manageDomains} className="text-meta font-medium text-brand hover:text-brand-hover">
                {data.manageRegistrations}
              </a>
            </div>
            <p className="max-w-md text-meta text-dim">{registrationHelp}</p>
          </div>
        </div>

        {/* Transfer is — the transfer direction */}
        <div className="flex items-start gap-2">
          <RowConnector />
          <div className="flex min-w-0 flex-col gap-2">
            <PolicySelect
              pill
              id="policy-data-removable-transfer"
              label={data.transferLabel}
              value={transferField.field.value}
              onChange={transferField.field.onChange}
              options={catalogs.transfers}
              placeholder={policyBuilderContent.chooseOne}
              error={errors.removableMedia?.transfer?.message}
            />
          </div>
        </div>
      </div>
    </PolicyConditionsSection>
  );
}
