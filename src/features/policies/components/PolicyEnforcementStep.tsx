"use client";

import { Controller, useFormContext } from "react-hook-form";

import { AppInput } from "@/components/app/field";
import { FieldError } from "@/components/ui/form-field";
import { PolicySelect } from "@/features/policies/components/PolicySelect";
import { policyBuilderContent, policyBuilderSteps } from "@/features/policies/content";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";
import type { PolicyCatalogOption } from "@/features/policies/types";

const enforcement = policyBuilderContent.enforcement;

/**
 * "Enforcement & Message" — set the action (Figma `396:4444`'s Enforcement
 * card; the "Do this instead" single select's open/hover/selected states are
 * the four named `Required-1..4` frames, `397:13609`/`397:13610`/
 * `397:13968`/`397:14326` — one `PolicySelect` reproduces all four as
 * interaction states of the same control, rather than four separate
 * controls). `action` and `onUnknown` share the same four-value action
 * catalog (`catalogs.actions`); `reasonCode`/`message` are the shared
 * MESSAGE fields ("They see").
 *
 * The Data step's per-channel EXCEPTION picker (`letItThroughIf`) is a
 * different, channel-scoped field (`removableMedia.exceptionIds` etc. — see
 * `PolicyExceptionField`) and has no counterpart here; `enforcement` has no
 * exception field in the schema, so none is rendered in this step.
 */
export function PolicyEnforcementStep({ actions }: { actions: readonly PolicyCatalogOption[] }) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<PolicyAuthoringValues>();

  const reasonCodeErrorId = "policy-enforcement-reasonCode-error";
  const messageErrorId = "policy-enforcement-message-error";

  // A single live region for the whole step: the per-field `FieldError`s
  // below already use `role="alert"`, but the step can carry several errors
  // at once, so this summarises the current set on every change rather than
  // relying on each alert to interrupt independently.
  const validationSummary = [
    errors.enforcement?.action?.message,
    errors.enforcement?.onUnknown?.message,
    errors.enforcement?.reasonCode?.message,
    errors.enforcement?.message?.message,
  ]
    .filter((message): message is string => Boolean(message))
    .join(" ");

  return (
    <section id="policy-enforcement" aria-label={policyBuilderSteps[4].title} className="mt-8">
      <h2 className="text-section font-medium text-strong">{enforcement.title}</h2>
      <p className="mt-1 max-w-md text-meta text-dim">{enforcement.help}</p>

      <p aria-live="polite" className="sr-only">
        {validationSummary}
      </p>

      <div className="mt-4">
        <span className="text-micro font-medium tracking-wide text-subtle">{enforcement.actionChip}</span>
        <div className="mt-2 max-w-xs">
          <Controller
            name="enforcement.action"
            control={control}
            render={({ field }) => (
              <PolicySelect
                id="policy-enforcement-action"
                label={enforcement.doThis}
                value={field.value}
                onChange={field.onChange}
                options={actions}
                error={errors.enforcement?.action?.message}
              />
            )}
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-2">
          <span className="text-micro font-medium tracking-wide text-subtle">{enforcement.ifCantTellChip}</span>
          <span className="inline-flex items-center rounded-app border border-hair-strong px-1.5 py-0.5 text-micro font-medium text-dim">
            {enforcement.required}
          </span>
        </div>
        <div className="mt-2 max-w-xs">
          <Controller
            name="enforcement.onUnknown"
            control={control}
            render={({ field }) => (
              <PolicySelect
                id="policy-enforcement-onUnknown"
                label={enforcement.doThisInstead}
                value={field.value}
                onChange={field.onChange}
                options={actions}
                error={errors.enforcement?.onUnknown?.message}
              />
            )}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <span className="text-micro font-medium tracking-wide text-subtle">{enforcement.messageChip}</span>

        <div className="flex flex-col gap-2">
          <label htmlFor="policy-enforcement-reasonCode" className="text-body font-medium text-label">
            {enforcement.reasonCode}
          </label>
          <AppInput
            id="policy-enforcement-reasonCode"
            {...register("enforcement.reasonCode")}
            aria-invalid={Boolean(errors.enforcement?.reasonCode)}
            aria-describedby={errors.enforcement?.reasonCode ? reasonCodeErrorId : undefined}
          />
          {errors.enforcement?.reasonCode ? (
            <FieldError id={reasonCodeErrorId}>{errors.enforcement.reasonCode.message}</FieldError>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="policy-enforcement-message" className="text-body font-medium text-label">
            {enforcement.theySee}
          </label>
          <AppInput
            id="policy-enforcement-message"
            {...register("enforcement.message")}
            aria-invalid={Boolean(errors.enforcement?.message)}
            aria-describedby={errors.enforcement?.message ? messageErrorId : undefined}
          />
          {errors.enforcement?.message ? (
            <FieldError id={messageErrorId}>{errors.enforcement.message.message}</FieldError>
          ) : null}
        </div>
      </div>
    </section>
  );
}
