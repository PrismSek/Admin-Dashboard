"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * Confirmation gate before SAML SSO is switched on (Figma "Authentication/SSO
 * activation"). Turning on SSO changes how everyone signs in, so the confirm
 * button stays disabled until the admin explicitly acknowledges the impact.
 *
 * Client-side because the acknowledgement gate is interactive; the dialog is
 * opened by a `?dialog=activate` link on the review step, so the URL stays
 * shareable/back-navigable (consistent with the app's other dialogs).
 */
export function SsoActivateDialog({
  orgName,
  provider,
  closeHref,
}: {
  orgName: string;
  provider: string;
  closeHref: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="sso-activate-title"
      onCancel={(event) => {
        event.preventDefault();
        window.location.href = closeHref;
      }}
      className="m-auto w-[calc(100vw-2rem)] max-w-lg rounded-card border border-hair-strong bg-chrome p-0 text-strong backdrop:bg-black/40"
    >
      <div className="p-6">
        <h2 id="sso-activate-title" className="text-section font-medium text-strong">
          Activate single sign-on?
        </h2>
        <p className="mt-2 text-meta text-dim">
          Everyone in {orgName} will sign in through Northwind {provider}. Existing sessions
          continue, but SSO is required at the next sign-in or reauthentication.
        </p>

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-app border border-hair-strong px-4 py-3.5">
          <Checkbox
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
            className="mt-0.5"
          />
          <span className="text-meta text-copy">
            I understand that everyone in {orgName} will be required to sign in through the identity
            provider.
          </span>
        </label>
      </div>

      <div className="flex justify-end gap-3 px-6 pb-6">
        <Link
          href={closeHref}
          className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
        >
          Cancel
        </Link>
        <Button variant="appPrimary" size="app" width="auto" type="button" disabled={!acknowledged}>
          Activate SSO
        </Button>
      </div>
    </dialog>
  );
}
