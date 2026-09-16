"use client";

import type { MouseEvent } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { policyBuilderContent, policyBuilderSteps } from "@/features/policies/content";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";
import { computeStepCompletion } from "@/features/policies/step-completion";
import { cn } from "@/lib/utils";

/**
 * Vertical orientation rail beside the create-policy form (Figma 396:4444,
 * the `Aside` frame). The seven stages are fixed and always shown together —
 * the builder is one long scrollable form, not a paged wizard.
 *
 * The rail doubles as live progress and as navigation:
 *   - Each stage is greyed until its own required fields are filled, then it
 *     colours in (brand). Completeness comes from `computeStepCompletion`, which
 *     splits `policyAuthoringSchema`'s requiredness rules by stage.
 *   - Clicking a stage scrolls its section to the top of the scroll area
 *     (`scrollIntoView`), bringing it into view when it is off-screen.
 *
 * Geometry is read straight off the frame: a 20px badge (`--size-step-node`)
 * centred in a 59px row (`--space-step-row`); the connector fills the row above
 * and below the badge in equal halves via `flex-1`, so it never needs a
 * hardcoded offset.
 */
export function PolicyStepRail() {
  const { control, getValues } = useFormContext<PolicyAuthoringValues>();
  // Subscribe to every field so the rail re-renders as the admin fills the form;
  // `getValues()` then hands `computeStepCompletion` the fully-typed snapshot it
  // needs (a nameless `useWatch` return is a deep-partial, which it is not).
  useWatch({ control });
  const completion = computeStepCompletion(getValues());

  function handleNavigate(event: MouseEvent<HTMLAnchorElement>, id: string) {
    const section = document.getElementById(`policy-${id}`);
    if (!section) return; // No section found — let the native #anchor jump run.
    event.preventDefault();
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav aria-label={policyBuilderContent.stepRailLabel}>
      <ol>
        {policyBuilderSteps.map((step, index) => {
          const isFirst = index === 0;
          const isLast = index === policyBuilderSteps.length - 1;
          const done = completion[step.id];

          return (
            <li key={step.id} data-complete={done} className="min-h-step-row flex items-stretch gap-3">
              <div className="flex w-step-node shrink-0 flex-col items-center">
                <span
                  aria-hidden
                  className={cn("w-0.5 flex-1", done ? "bg-brand" : "bg-line-strong", isFirst && "invisible")}
                />
                <span
                  aria-hidden
                  className={cn(
                    "flex size-step-node shrink-0 items-center justify-center rounded-full text-micro font-medium transition-colors",
                    done ? "bg-brand text-brand-fg" : "bg-line-strong text-muted",
                  )}
                >
                  {index + 1}
                </span>
                <span
                  aria-hidden
                  className={cn("w-0.5 flex-1", done ? "bg-brand" : "bg-line-strong", isLast && "invisible")}
                />
              </div>

              <a
                href={`#policy-${step.id}`}
                onClick={(event) => handleNavigate(event, step.id)}
                className="flex flex-col justify-center py-1"
              >
                <span className={cn("text-app font-medium transition-colors", done ? "text-strong" : "text-muted")}>
                  {step.title}
                </span>
                <span className={cn("text-micro transition-colors", done ? "text-dim" : "text-subtle")}>
                  {step.detail}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
