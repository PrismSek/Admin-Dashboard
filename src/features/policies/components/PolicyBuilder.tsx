"use client";

import { useState } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { defaultPolicyAuthoringValues } from "@/features/policies/authoring-defaults";
import { PolicyDataStep } from "@/features/policies/components/PolicyDataStep";
import { PolicyEnforcementStep } from "@/features/policies/components/PolicyEnforcementStep";
import { PolicyFinishStep } from "@/features/policies/components/PolicyFinishStep";
import { PolicyNotificationStep } from "@/features/policies/components/PolicyNotificationStep";
import { PolicyStartStep } from "@/features/policies/components/PolicyStartStep";
import { PolicyStepRail } from "@/features/policies/components/PolicyStepRail";
import { PolicyWhereStep } from "@/features/policies/components/PolicyWhereStep";
import { PolicyWhoStep } from "@/features/policies/components/PolicyWhoStep";
import { policyBuilderContent, policyRoutes } from "@/features/policies/content";
import { policyAuthoringSchema, type PolicyAuthoringValues } from "@/features/policies/schemas";
import type { PolicyCatalogs } from "@/features/policies/types";

const zodPolicyResolver = zodResolver(policyAuthoringSchema);

/**
 * `name` is the one required field in the schema with no custom zod message
 * (every sibling field's message lives inline in `schemas.ts` — see
 * `content.ts`'s `errors` doc comment) — the approved schema stays untouched,
 * so the friendlier copy is applied here, once, after `zodResolver` runs.
 */
const policyFormResolver: Resolver<PolicyAuthoringValues> = async (values, context, options) => {
  const result = await zodPolicyResolver(values, context, options);
  if (result.errors.name) {
    result.errors.name.message = policyBuilderContent.errors.nameRequired;
  }
  return result;
};

/**
 * The Policy authoring shell (Figma "Create policy" frames, `396:4444` and
 * variants). One `react-hook-form` instance backs the whole seven-step form —
 * the design is a single scrollable page beside a step rail, not a paged
 * wizard — so every step reads and writes the same `PolicyAuthoringValues`
 * through `FormProvider`.
 *
 * `shouldUnregister: false` keeps every step's default values intact while
 * another step is on screen, so switching around never disturbs what's
 * already wired. A valid submit only flips local UI state — there is no
 * policy-creation API yet (see `policyBuilderContent.finish.localOnlyNotice`),
 * so nothing here calls a mutation.
 */
export function PolicyBuilder({ catalogs }: { catalogs: PolicyCatalogs }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const form = useForm<PolicyAuthoringValues>({
    resolver: policyFormResolver,
    defaultValues: defaultPolicyAuthoringValues,
    mode: "onBlur",
    shouldUnregister: false,
  });

  /**
   * Named per the task brief, replacing the interim inline callback. Marks
   * the form clean (`form.reset` clears `isDirty`) so `UnsavedChangesGuard`
   * drops its `beforeunload` listener the moment local validation succeeds —
   * nothing is persisted, but there is also nothing left to warn about
   * losing.
   */
  function handleValidSubmit(values: PolicyAuthoringValues) {
    setIsSubmitted(true);
    form.reset(values);
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleValidSubmit)}
        noValidate
        className="flex min-h-full"
        aria-label={policyBuilderContent.pageTitle}
      >
        <aside className="hidden shrink-0 border-r border-hair-strong bg-chrome px-8 py-10 lg:block">
          <PolicyStepRail />
        </aside>

        <div className="min-w-0 flex-1 px-8 py-10 xl:px-14">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-page-title font-normal text-strong">{policyBuilderContent.pageTitle}</h1>
                <p className="mt-2 max-w-xl text-meta text-dim">{policyBuilderContent.scopeNote}</p>
              </div>
              <Button variant="appSecondary" size="app" width="auto" type="button">
                {policyBuilderContent.bundleJson}
              </Button>
            </div>

            <PolicyStartStep />
            <PolicyWhoStep audiences={catalogs.audiences} />
            <PolicyWhereStep channels={catalogs.channels} />
            <PolicyDataStep catalogs={catalogs} />
            <PolicyEnforcementStep actions={catalogs.actions} />
            <PolicyNotificationStep />
            <PolicyFinishStep
              deployStates={catalogs.deployStates}
              isSubmitted={isSubmitted}
              cancelHref={policyRoutes.list}
            />
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
