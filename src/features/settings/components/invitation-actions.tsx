"use client";

import { useState, useTransition } from "react";

import { buttonVariants } from "@/components/ui/button";
import type { ActionResult } from "@/features/settings/actions";
import { resendInvite, revokeInvite } from "@/features/settings/actions";
import type { ApiInviteStatus } from "@/features/settings/schemas";

/**
 * Per-row invitation controls. Which actions apply follows the gateway's rules:
 * a pending invitation can be resent or revoked; an expired one can only be
 * resent (revoking it changes nothing); accepted and revoked rows are history
 * and offer nothing. On success the Server Action revalidates the list, so the
 * row re-renders with its new status.
 */
export function InvitationActions({ id, status }: { id: string; status: ApiInviteStatus }) {
  const [confirmingRevoke, setConfirmingRevoke] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canResend = status === "pending" || status === "expired";
  const canRevoke = status === "pending";
  if (!canResend && !canRevoke) {
    return <span className="text-meta text-subtle">—</span>;
  }

  function act(action: () => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) setConfirmingRevoke(false);
      else setError(result.error);
    });
  }

  const linkish = buttonVariants({ variant: "ghost", size: "appSm", width: "auto" });

  return (
    <div className="flex flex-col items-end gap-1.5">
      {confirmingRevoke ? (
        <div className="flex items-center gap-2">
          <span className="text-meta text-dim">Revoke?</span>
          <button
            type="button"
            disabled={pending}
            onClick={() => act(() => revokeInvite(id))}
            className={buttonVariants({ variant: "destructive", size: "appSm", width: "auto" })}
          >
            Revoke
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmingRevoke(false)}
            className={linkish}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          {canResend ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => act(() => resendInvite(id))}
              className={linkish}
            >
              Resend
            </button>
          ) : null}
          {canRevoke ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmingRevoke(true)}
              className={linkish}
            >
              Revoke
            </button>
          ) : null}
        </div>
      )}
      {error ? (
        <p role="alert" className="text-meta text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
