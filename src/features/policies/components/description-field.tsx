"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The policy's optional description. Hidden by default — the field is optional
 * in the API, so nothing is submitted until the author opens it. "+ Add a
 * description" reveals a focused textarea; "× Remove" collapses it and discards
 * the text (the textarea unmounts, so no `description` is sent).
 */
export function DescriptionField() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 inline-block text-meta font-medium text-brand hover:text-brand-hover"
      >
        + Add a description
      </button>
    );
  }

  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between gap-4">
        <label htmlFor="policy-description" className="text-meta font-medium text-label">
          Description (optional)
        </label>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-meta font-medium text-brand hover:text-brand-hover"
        >
          × Remove
        </button>
      </div>
      <textarea
        ref={ref}
        id="policy-description"
        name="description"
        rows={3}
        placeholder="Why this policy exists, and who to ask about exceptions."
        className="w-full rounded-app border border-hair-strong bg-chrome px-3.5 py-2.5 text-app text-strong outline-none placeholder:text-subtle focus:border-brand-accent"
      />
    </div>
  );
}
