"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { defaultPolicyAuthoringValues } from "@/features/policies/authoring-defaults";
import { PolicyDataStep } from "@/features/policies/components/PolicyDataStep";
import { PolicyStartStep } from "@/features/policies/components/PolicyStartStep";
import { PolicyStepRail } from "@/features/policies/components/PolicyStepRail";
import { PolicyWhereStep } from "@/features/policies/components/PolicyWhereStep";
import { PolicyWhoStep } from "@/features/policies/components/PolicyWhoStep";
import { policyBuilderContent } from "@/features/policies/content";
import { policyAuthoringSchema, type PolicyAuthoringValues } from "@/features/policies/schemas";
import type { PolicyCatalogs } from "@/features/policies/types";

/**
 * The Policy authoring shell (Figma "Create policy" frames, `396:4444` and
 * variants). One `react-hook-form` instance backs the whole seven-step form —
 * the design is a single scrollable page beside a step rail, not a paged
 * wizard — so every step reads and writes the same `PolicyAuthoringValues`
 * through `FormProvider`.
 *
 * Only Start/Who/Where are built here; `shouldUnregister: false` keeps the
 * remaining four steps' default values intact so Data/Enforcement/
 * Notification/Finish (later tasks) can slot in without disturbing what's
 * already wired. A valid submit only flips local UI state — there is no
 * policy-creation API yet (see `policyBuilderContent.finish.localOnlyNotice`),
 * so nothing here calls a mutation.
 */
export function PolicyBuilder({ catalogs }: { catalogs: PolicyCatalogs }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const form = useForm<PolicyAuthoringValues>({
    resolver: zodResolver(policyAuthoringSchema),
    defaultValues: defaultPolicyAuthoringValues,
    mode: "onBlur",
    shouldUnregister: false,
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(() => setIsSubmitted(true))}
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

            {isSubmitted ? (
              <p role="status" className="mt-4 text-meta text-success">
                {policyBuilderContent.finish.localOnlyNotice}
              </p>
            ) : null}

            <PolicyStartStep />
            <PolicyWhoStep audiences={catalogs.audiences} />
            <PolicyWhereStep channels={catalogs.channels} />
            <PolicyDataStep catalogs={catalogs} />

            {/* Enforcement & Message / End-user Notification / Finish slot in
                here once their own tasks land — the form values and
                validation for all three already exist in the schema and
                defaults, so adding them is additive, not a rewire. */}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
