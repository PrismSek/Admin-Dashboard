"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { policyBuilderContent } from "@/features/policies/content";

export type UnsavedChangesGuardProps = {
  isDirty: boolean;
  cancelHref: string;
};

/**
 * The Finish step's Cancel control, plus the builder's unsaved-work
 * protection (docs/CODING_STANDARDS.md §8: "never lose a half-written
 * policy").
 *
 * Two separate mechanisms, both scoped to this one screen rather than a
 * global Next.js navigation interceptor:
 *   - `beforeunload` covers leaving the page entirely (tab close, refresh, a
 *     typed URL) while the form is dirty.
 *   - The in-app Cancel click shows its own Stay/Discard confirmation
 *     instead of navigating immediately — a plain `<Link>` whose default
 *     click is only prevented while dirty, not a router-level interceptor,
 *     so every other navigation on the page is unaffected.
 *
 * The listener comes off automatically whenever `isDirty` turns `false` —
 * `PolicyBuilder` does that itself after a successful local validation via
 * `form.reset(values)` — and on a confirmed Discard, since navigating away
 * unmounts this component and runs the effect's own cleanup.
 */
export function UnsavedChangesGuard({ isDirty, cancelHref }: UnsavedChangesGuardProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const copy = policyBuilderContent.unsavedChanges;

  // Checked by `handleBeforeUnload` on every fire, and flipped off in
  // `handleDiscard` before the navigation it triggers — otherwise that
  // navigation is itself a page unload, and the still-armed listener would
  // pop the browser's own native leave-prompt right on top of the Stay/
  // Discard dialog the admin just confirmed.
  const isArmedRef = useRef(true);

  useEffect(() => {
    if (!isDirty) return;
    isArmedRef.current = true;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isArmedRef.current) return;
      event.preventDefault();
      // Chrome only shows its native prompt when `returnValue` is set.
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  function handleCancelClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!isDirty) return; // let the link navigate normally
    event.preventDefault();
    setIsConfirmOpen(true);
  }

  function handleDiscard() {
    isArmedRef.current = false;
    setIsConfirmOpen(false);
    window.location.href = cancelHref;
  }

  return (
    <>
      <Link
        href={cancelHref}
        onClick={handleCancelClick}
        className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
      >
        {policyBuilderContent.finish.cancel}
      </Link>

      {isConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="unsaved-changes-title"
            aria-describedby="unsaved-changes-message"
            className="w-full max-w-sm rounded-panel border border-hair-strong bg-chrome p-6 shadow-dropdown"
          >
            <h2 id="unsaved-changes-title" className="text-section font-medium text-strong">
              {copy.title}
            </h2>
            <p id="unsaved-changes-message" className="mt-2 text-meta text-dim">
              {copy.message}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="appSecondary"
                size="app"
                width="auto"
                onClick={() => setIsConfirmOpen(false)}
              >
                {copy.stay}
              </Button>
              <Button type="button" variant="appDanger" size="app" width="auto" onClick={handleDiscard}>
                {copy.discard}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
