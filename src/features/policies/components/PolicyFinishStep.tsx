"use client";

import { useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { PolicyJsonPreview } from "@/features/policies/components/PolicyJsonPreview";
import { PolicySelect } from "@/features/policies/components/PolicySelect";
import { UnsavedChangesGuard } from "@/features/policies/components/UnsavedChangesGuard";
import { policyBuilderContent, policyBuilderSteps } from "@/features/policies/content";
import { policyAuthoringSchema, type PolicyAuthoringValues } from "@/features/policies/schemas";
import type { PolicyCatalogOption } from "@/features/policies/types";

const finish = policyBuilderContent.finish;

/**
 * "Finish" — deploy and save (Figma `397:15047`/`397:15048`/`397:15406`,
 * "Draft-1/2/3": the `deployAs` menu's closed/open/selected states, all one
 * `PolicySelect` restricted to exactly Draft/Active/Off).
 *
 * A valid submit never calls a mutation — there is no create-policy API yet
 * (`finish.localOnlyNotice`) — it only flips `isSubmitted`, owned by
 * `PolicyBuilder`'s `handleValidSubmit`, to show the confirmation banner
 * here instead of the button row.
 */
export function PolicyFinishStep({
  deployStates,
  isSubmitted,
  cancelHref,
}: {
  deployStates: readonly PolicyCatalogOption[];
  isSubmitted: boolean;
  cancelHref: string;
}) {
  const {
    control,
    getValues,
    formState: { errors, isDirty },
  } = useFormContext<PolicyAuthoringValues>();
  const [isJsonOpen, setIsJsonOpen] = useState(false);

  // Create and View JSON are clickable only once the whole form satisfies
  // `policyAuthoringSchema` — name, audience, channel, that channel's
  // conditions/target, the required "If we can't tell" fallback, and the
  // message block when the action interrupts. Both actions share this one
  // gate, so the JSON preview never shows a half-filled, non-parseable policy.
  // Re-parsing the watched values
  // (rather than reading `formState.isValid`, which the form's `mode: "onBlur"`
  // leaves stale until a blur) tracks completeness live on every change, while
  // leaving the on-blur error display untouched — this gate never shows an error.
  const values = useWatch({ control });
  const isComplete = policyAuthoringSchema.safeParse(values).success;

  // `getValues()`, not `useWatch` with no `name` — the latter's return type
  // is a deep-partial of the form (every field optional), which doesn't
  // satisfy `PolicyJsonPreviewProps.values: PolicyAuthoringValues`.
  // `getValues()` is fully typed and re-read on every render this component
  // already produces (e.g. the `isJsonOpen` toggle that opens the dialog).

  return (
    <section id="policy-finish" aria-label={policyBuilderSteps[6].title} className="mt-8 border-t border-hair-strong pt-8">
      {/* One row (Figma `397:15047`): "Deploy as: [Draft ▾]" on the left, the
          actions on the right; they stack on narrow widths. */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-body font-medium text-label">{finish.deployAsLabel}</span>
          <Controller
            name="deployAs"
            control={control}
            render={({ field }) => (
              <PolicySelect
                pill
                dropUp
                id="policy-finish-deployAs"
                label={finish.deployAsLabel}
                ariaLabel={finish.deployAsLabel}
                value={field.value}
                onChange={field.onChange}
                options={deployStates}
                placeholder={policyBuilderContent.chooseOne}
                error={errors.deployAs?.message}
              />
            )}
          />
        </div>

        {isSubmitted ? null : (
          <div className="flex items-center gap-3">
            <UnsavedChangesGuard isDirty={isDirty} cancelHref={cancelHref} />

            <Button
              type="button"
              variant="appSecondary"
              size="app"
              width="auto"
              onClick={() => setIsJsonOpen(true)}
              disabled={!isComplete}
            >
              {finish.viewJson}
            </Button>

            <Button type="submit" variant="appPrimary" size="app" width="auto" disabled={!isComplete}>
              {finish.create}
            </Button>
          </div>
        )}
      </div>

      {isSubmitted ? (
        <p
          role="status"
          className="mt-6 rounded-app border border-success/40 bg-success/10 px-4 py-3 text-meta text-success"
        >
          {finish.localOnlyNotice}
        </p>
      ) : null}

      <PolicyJsonPreview values={getValues()} isOpen={isJsonOpen} onClose={() => setIsJsonOpen(false)} />
    </section>
  );
}
