import { policyBuilderContent, policyBuilderSteps } from "@/features/policies/content";
import { cn } from "@/lib/utils";

/**
 * Vertical orientation rail beside the create-policy form (Figma 396:4444,
 * the `Aside` frame). The seven stages are fixed and always shown together —
 * the builder is one long scrollable form, not a paged wizard — so every
 * node renders "reached" rather than as live progress, and each links to its
 * section's anchor.
 *
 * Geometry is read straight off the frame: a 20px badge (`--size-step-node`)
 * centred in a 59px row (`--space-step-row`); the brand-coloured connector
 * fills the row above and below the badge in equal halves via `flex-1`, so
 * it never needs a hardcoded offset.
 */
export function PolicyStepRail() {
  return (
    <nav aria-label={policyBuilderContent.stepRailLabel}>
      <ol>
        {policyBuilderSteps.map((step, index) => {
          const isFirst = index === 0;
          const isLast = index === policyBuilderSteps.length - 1;

          return (
            <li key={step.id} className="min-h-step-row flex items-stretch gap-3">
              <div className="flex w-step-node shrink-0 flex-col items-center">
                <span aria-hidden className={cn("w-0.5 flex-1 bg-brand", isFirst && "invisible")} />
                <span
                  aria-hidden
                  className="flex size-step-node shrink-0 items-center justify-center rounded-full bg-brand text-micro font-medium text-brand-fg"
                >
                  {index + 1}
                </span>
                <span aria-hidden className={cn("w-0.5 flex-1 bg-brand", isLast && "invisible")} />
              </div>

              <a href={`#policy-${step.id}`} className="flex flex-col justify-center py-1">
                <span className="text-app font-medium text-strong">{step.title}</span>
                <span className="text-micro text-dim">{step.detail}</span>
              </a>
            </li>
          );
        })}
      </ol>

      <p className="mt-6 max-w-60 text-micro text-brand">{policyBuilderContent.stepRailNote}</p>
    </nav>
  );
}
