"use client";

import { Controller, useFormContext } from "react-hook-form";

import { PolicySelect } from "@/features/policies/components/PolicySelect";
import { policyBuilderContent, policyBuilderSteps } from "@/features/policies/content";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";
import type { PolicyCatalogOption } from "@/features/policies/types";

/** "Who" — choose the audience (Figma 396:5362 family, the "Applies to" open dropdown). */
export function PolicyWhoStep({ audiences }: { audiences: readonly PolicyCatalogOption[] }) {
  const {
    control,
    formState: { errors },
  } = useFormContext<PolicyAuthoringValues>();

  return (
    <section id="policy-who" aria-label={policyBuilderSteps[1].title} className="mt-8 border-t border-hair-strong pt-8">
      <Controller
        name="appliesTo"
        control={control}
        render={({ field }) => (
          <PolicySelect
            id="policy-who-appliesTo"
            label={policyBuilderContent.who.appliesToLabel}
            value={field.value}
            onChange={field.onChange}
            options={audiences}
            error={errors.appliesTo?.message}
            placeholder={policyBuilderContent.who.appliesToPlaceholder}
            searchable
            searchPlaceholder={policyBuilderContent.who.searchAudiences}
            className="w-policy-select"
          />
        )}
      />
      <p className="mt-2 max-w-md text-meta text-dim">{policyBuilderContent.who.scopeHelp}</p>
    </section>
  );
}
