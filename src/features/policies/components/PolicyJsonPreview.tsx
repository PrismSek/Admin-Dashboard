"use client";

import { useEffect, useRef } from "react";

import { AppIcon } from "@/components/icons/AppIcon";
import { policyBuilderContent } from "@/features/policies/content";
import { serializePolicyPreview, type PolicyPreview } from "@/features/policies/serialize-policy";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";

export type PolicyJsonPreviewProps = {
  values: PolicyAuthoringValues;
  isOpen: boolean;
  onClose: () => void;
};

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * The Finish step's "View JSON" review dialog (Figma `398:19229` "Json" —
 * the schema-parsed authoring preview, not that frame's "Compiled bundle"
 * example, which carries `tenantId`/`deviceId` this dialog must never show).
 * Only mounted while `isOpen`, so its focus-trap effects never run against a
 * hidden dialog and every hook above stays unconditional (rules of hooks).
 */
export function PolicyJsonPreview({ values, isOpen, onClose }: PolicyJsonPreviewProps) {
  if (!isOpen) return null;
  return <PolicyJsonDialog values={values} onClose={onClose} />;
}

function PolicyJsonDialog({ values, onClose }: { values: PolicyAuthoringValues; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Retain the trigger, focus the close button, and restore the trigger's
  // focus when this dialog unmounts (Escape / close button / outside close
  // all route through `onClose`, which flips `isOpen` and unmounts us).
  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    return () => {
      previouslyFocusedRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // `serializePolicyPreview` re-parses with the authoring schema — it never
  // reads a field the schema doesn't declare, so there is no token,
  // credential, or tenantId path for it to expose. A mid-edit invalid form
  // (e.g. a field cleared but not yet corrected) simply shows nothing rather
  // than throwing through this dialog.
  let preview: PolicyPreview | null = null;
  try {
    preview = serializePolicyPreview(values);
  } catch {
    preview = null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-json-title"
        className="flex max-h-96 w-full max-w-2xl flex-col rounded-panel border border-hair-strong bg-chrome p-6 shadow-dropdown"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="policy-json-title" className="text-section font-medium text-strong">
            {policyBuilderContent.jsonTitle}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={policyBuilderContent.closeJson}
            className="flex size-icon-button shrink-0 items-center justify-center rounded-app text-dim hover:bg-hover"
          >
            <AppIcon name="close" className="size-app-icon" />
          </button>
        </div>

        <pre className="mt-4 overflow-auto rounded-app bg-canvas p-4 text-meta text-strong">
          {preview ? JSON.stringify(preview, null, 2) : ""}
        </pre>
      </div>
    </div>
  );
}
