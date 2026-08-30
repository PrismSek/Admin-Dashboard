import { cn } from "@/lib/utils";

/** The seven ordered stages of a policy, shown as an orientation rail. */
export const policySteps = [
  { title: "Start", detail: "Name & describe the policy" },
  { title: "Who", detail: "Choose the audience" },
  { title: "Where", detail: "Pick channel & destination" },
  { title: "Data", detail: "Define trigger actions" },
  { title: "Enforcement & Message", detail: "Set the action" },
  { title: "End user Notification", detail: "Handle the unknown case" },
  { title: "Finish", detail: "Deploy and save" },
] as const;

/**
 * Vertical step rail beside the create-policy form. The stages are fixed and
 * always shown together (the form is one page, not a paged wizard), so every
 * node is rendered filled rather than as live progress.
 */
export function StepRail({ className }: { className?: string }) {
  return (
    <div className={cn("w-64 shrink-0", className)}>
      <ol>
        {policySteps.map((step, index) => {
          const isLast = index === policySteps.length - 1;
          return (
            <li key={step.title} className={cn("relative flex gap-3", !isLast && "pb-7")}>
              {!isLast ? (
                <span
                  aria-hidden
                  className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px bg-brand"
                />
              ) : null}
              <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-micro font-medium text-brand-fg">
                {index + 1}
              </span>
              <div className="pt-0.5">
                <p className="text-app font-medium text-strong">{step.title}</p>
                <p className="text-meta text-dim">{step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 max-w-[15rem] text-meta text-brand">
        The seven-step order is inherited and cannot be reordered or merged.
      </p>
    </div>
  );
}
