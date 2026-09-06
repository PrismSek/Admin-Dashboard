"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { AppField, AppInput, AppSelect } from "@/components/app/field";
import { Modal } from "@/components/app/modal";
import { Button, buttonVariants } from "@/components/ui/button";
import { createInvite } from "@/features/settings/actions";
import { roleLabels, roleValues } from "@/features/settings/roles";

const FORM_ID = "invite-user-form";

/**
 * The "Invite a user" dialog. Opened by `?dialog=invite`; the shell and open
 * state come from the URL, but the fields and submit are client-side so the
 * invite can be sent without leaving the list. On success the invitations tab
 * is revalidated by the Server Action, so the new row appears on the next view.
 */
export function InviteUserDialog({ orgName, closeHref }: { orgName: string; closeHref: string }) {
  const [role, setRole] = useState<string>("analyst");
  const [message, setMessage] = useState<{ tone: "error" | "ok"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    setMessage(null);
    startTransition(async () => {
      const result = await createInvite(typeof email === "string" ? email : "", role);
      if (result.ok) {
        setMessage({
          tone: "ok",
          text: result.mailFailed
            ? "Invitation created, but the email didn't send. Resend it from the Invitations tab."
            : "Invitation sent.",
        });
      } else {
        setMessage({ tone: "error", text: result.error });
      }
    });
  }

  return (
    <Modal
      title="Invite a user"
      description={`They'll receive an email to join ${orgName} on PrismSek.`}
      closeHref={closeHref}
      footer={
        <>
          <Link
            href={closeHref}
            className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
          >
            Close
          </Link>
          <Button
            variant="appPrimary"
            size="app"
            width="auto"
            type="submit"
            form={FORM_ID}
            disabled={pending}
          >
            {pending ? "Sending…" : "Send invitation"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="flex flex-col gap-5">
        <AppField id="invite-email" label="Email address">
          <AppInput
            id="invite-email"
            name="email"
            type="email"
            required
            autoComplete="off"
            placeholder="name@company.com"
          />
        </AppField>

        <AppField id="invite-role" label="Role">
          <AppSelect
            id="invite-role"
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            {roleValues.map((value) => (
              <option key={value} value={value}>
                {roleLabels[value]}
              </option>
            ))}
          </AppSelect>
        </AppField>

        {message ? (
          <p
            role={message.tone === "error" ? "alert" : "status"}
            className={
              message.tone === "error" ? "text-meta text-destructive" : "text-meta text-brand-accent"
            }
          >
            {message.text}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
