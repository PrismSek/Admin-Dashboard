import { buttonVariants } from "@/components/ui/button";
import { policyListContent } from "@/features/policies/content";

export type PolicyListErrorProps = {
  /** Re-attempt the failed load — wired to the route boundary's `retry()`. */
  retry: () => void;
  /** Fixed, support-safe stand-in for the thrown error. Never the error's own
   * message or any policy content: see CODING_STANDARDS.md §11/§12. */
  correlationId: string;
};

/**
 * Route-level failure state for the Policy list (`app/(app)/policies/error.tsx`).
 * Deliberately renders no detail from the thrown error — only a fixed
 * correlation label an admin can hand to support — because the thrown error
 * may otherwise carry backend/gateway detail this product must not leak.
 */
export function PolicyListError({ retry, correlationId }: PolicyListErrorProps) {
  return (
    <div className="px-12 py-8">
      <section
        aria-labelledby="policy-error-title"
        className="mt-4 flex flex-col items-center gap-3 rounded-app border border-policy-table-border bg-chrome px-5 py-16 text-center"
      >
        <h1 id="policy-error-title" className="text-app-heading font-normal text-strong">
          {policyListContent.error.title}
        </h1>
        <p className="max-w-md text-app text-dim">{policyListContent.error.description}</p>
        <p className="text-meta text-subtle">{policyListContent.error.correlationLabel(correlationId)}</p>
        <button
          type="button"
          onClick={retry}
          className={buttonVariants({ variant: "appPrimary", size: "app", width: "auto" })}
        >
          {policyListContent.error.retry}
        </button>
      </section>
    </div>
  );
}
