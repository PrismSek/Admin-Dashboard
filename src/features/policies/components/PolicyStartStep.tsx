"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { AppInput } from "@/components/app/field";
import { FieldError } from "@/components/ui/form-field";
import { policyBuilderContent, policyBuilderSteps } from "@/features/policies/content";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";

const NAME_ID = "policy-name";
const NAME_ERROR_ID = "policy-name-error";
const DESCRIPTION_ID = "policy-description";
const DESCRIPTION_ERROR_ID = "policy-description-error";

/**
 * "Start" — name & describe the policy (Figma 396:4444's first field group).
 * The description is optional in the schema, and stays collapsed behind
 * "+ Add a description" until opened; because the form's `shouldUnregister`
 * is `false`, collapsing it again never discards what was typed.
 */
export function PolicyStartStep() {
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext<PolicyAuthoringValues>();
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(() => getValues("description").length > 0);

  return (
    <section id="policy-start" aria-label={policyBuilderSteps[0].title} className="mt-8">
      <div className="flex flex-col gap-2">
        <label htmlFor={NAME_ID} className="text-body font-medium text-label">
          {policyBuilderContent.start.nameLabel}
        </label>
        <AppInput
          id={NAME_ID}
          {...register("name")}
          placeholder={policyBuilderContent.start.namePlaceholder}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? NAME_ERROR_ID : undefined}
        />
        {errors.name ? <FieldError id={NAME_ERROR_ID}>{errors.name.message}</FieldError> : null}
      </div>

      {isDescriptionOpen ? (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between gap-4">
            <label htmlFor={DESCRIPTION_ID} className="text-body font-medium text-label">
              {policyBuilderContent.start.descriptionLabel}
            </label>
            <button
              type="button"
              onClick={() => setIsDescriptionOpen(false)}
              className="text-meta font-medium text-brand hover:text-brand-hover"
            >
              {policyBuilderContent.start.removeDescription}
            </button>
          </div>
          <textarea
            id={DESCRIPTION_ID}
            {...register("description")}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? DESCRIPTION_ERROR_ID : undefined}
            rows={3}
            placeholder={policyBuilderContent.start.descriptionPlaceholder}
            className="w-full rounded-app border border-hair-strong bg-chrome px-3.5 py-2.5 text-app text-strong outline-none placeholder:text-subtle focus:border-brand-accent"
          />
          {errors.description ? (
            <FieldError id={DESCRIPTION_ERROR_ID}>{errors.description.message}</FieldError>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsDescriptionOpen(true)}
          className="mt-2 inline-block text-meta font-medium text-brand hover:text-brand-hover"
        >
          {policyBuilderContent.start.addDescription}
        </button>
      )}
    </section>
  );
}
