"use client";

import { Controller, useFormContext } from "react-hook-form";

import { PolicySelect } from "@/features/policies/components/PolicySelect";
import { policyBuilderContent, policyBuilderSteps } from "@/features/policies/content";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";
import type { PolicyCatalogs } from "@/features/policies/types";

/**
 * "Where" — pick channel & destination (Figma 396:7175 family, the generic
 * Channel dropdown). Exactly one channel per policy; the other three
 * channel-specific rule objects stay populated in the form (`shouldUnregister:
 * false`) so switching back and forth never drops an admin's edits.
 */
export function PolicyWhereStep({ channels }: { channels: PolicyCatalogs["channels"] }) {
  const {
    control,
    formState: { errors },
  } = useFormContext<PolicyAuthoringValues>();

  return (
    <section id="policy-where" aria-label={policyBuilderSteps[2].title} className="mt-6">
      {/* Label on its own line, then the dropdown + "Enforced today" badge +
          "One channel per policy" note sit inline on the row below it. */}
      <span className="text-body font-medium text-label">{policyBuilderContent.where.channelLabel}</span>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Controller
          name="channel"
          control={control}
          render={({ field }) => (
            <PolicySelect
              id="policy-where-channel"
              label={policyBuilderContent.where.channelLabel}
              ariaLabel={policyBuilderContent.where.channelLabel}
              value={field.value}
              onChange={field.onChange}
              options={channels}
              error={errors.channel?.message}
              placeholder={policyBuilderContent.where.channelPlaceholder}
              searchable
              searchPlaceholder={policyBuilderContent.where.searchChannels}
              className="w-policy-select"
            />
          )}
        />
        <span className="inline-flex items-center rounded-app border border-brand/50 bg-brand-halo px-2.5 py-1 text-micro font-medium text-brand">
          {policyBuilderContent.where.enforcedToday}
        </span>
        <span className="text-meta text-subtle">{policyBuilderContent.where.oneChannelPerPolicy}</span>
      </div>
    </section>
  );
}
