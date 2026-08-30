"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AppField, AppInput } from "@/components/app/field";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * Delete-user confirmation. Removing a person's personal data is irreversible,
 * so the destructive button stays disabled until the admin types the exact
 * email — the type-to-confirm gate the design shows. Client-side because that
 * gate is interactive; opened via `?dialog=delete&user=` like the other dialogs.
 */
export function DeleteUserDialog({
  name,
  email,
  closeHref,
}: {
  name: string;
  email: string;
  closeHref: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState("");
  const confirmed = value.trim().toLowerCase() === email.toLowerCase();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="delete-user-title"
      onCancel={(event) => {
        event.preventDefault();
        window.location.href = closeHref;
      }}
      className="m-auto w-[calc(100vw-2rem)] max-w-lg rounded-card border border-hair-strong bg-chrome p-0 text-strong backdrop:bg-black/40"
    >
      <div className="flex items-start justify-between gap-4 p-6 pb-0">
        <h2 id="delete-user-title" className="text-section font-medium text-strong">
          Delete personal data for {name}?
        </h2>
        <Link
          href={closeHref}
          aria-label="Close dialog"
          className="-mr-1 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-app text-dim transition-colors hover:bg-hover"
        >
          <X aria-hidden className="size-4" />
        </Link>
      </div>

      <div className="flex flex-col gap-5 p-6">
        <p className="text-meta text-dim">
          This permanently removes {name}&rsquo;s name, email and other personal details. It cannot
          be undone. Audit records keep an anonymised attribution so the evidence chain stays
          intact.
        </p>
        <AppField id="delete-confirm" label="Type the user's email to confirm" hint={email}>
          <AppInput
            id="delete-confirm"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={email}
            autoComplete="off"
          />
        </AppField>
      </div>

      <div className="flex justify-end gap-3 border-t border-hair px-6 py-4">
        <Link
          href={closeHref}
          className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
        >
          Cancel
        </Link>
        <Button variant="destructive" size="app" width="auto" type="button" disabled={!confirmed}>
          Delete personal data
        </Button>
      </div>
    </dialog>
  );
}
