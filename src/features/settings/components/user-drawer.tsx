"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";

import { AppField, AppInput, AppSelect } from "@/components/app/field";
import { Pill } from "@/components/app/pill";
import { Button, buttonVariants } from "@/components/ui/button";
import type { ActionResult } from "@/features/settings/actions";
import { deactivateUser, purgeUser, reactivateUser, setUserRole, suspendUser } from "@/features/settings/actions";
import type { OrgUserDetail } from "@/features/settings/api";
import { roleLabels, roleValues } from "@/features/settings/roles";

const statusTone = { active: "ok", suspended: "neutral", pending: "pending", deactivated: "neutral" } as const;
const statusLabel = { active: "Active", suspended: "Suspended", pending: "Pending", deactivated: "Deactivated" } as const;

/**
 * Detail panel for one user, opened as a left drawer over the list. Open state
 * lives in the URL (`?user=<id>`), so the server fetches the user and the link
 * is shareable; only the interactive controls are client-side. Each action
 * calls a Server Action and, on success, the revalidated route re-renders this
 * drawer with fresh data.
 */
export function UserDrawer({ user, closeHref }: { user: OrgUserDetail; closeHref: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [role, setRole] = useState<string>(user.role);
  const [confirming, setConfirming] = useState<null | "deactivate" | "delete">(null);
  const [deleteInput, setDeleteInput] = useState("");
  const [message, setMessage] = useState<{ tone: "error" | "ok"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  function act(action: () => Promise<ActionResult>, okText: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setConfirming(null);
        setDeleteInput("");
        setMessage({ tone: "ok", text: okText });
      } else {
        setMessage({ tone: "error", text: result.error });
      }
    });
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="user-drawer-title"
      onCancel={(event) => {
        event.preventDefault();
        window.location.href = closeHref;
      }}
      className="m-0 mr-auto h-dvh max-h-dvh w-[calc(100vw-3rem)] max-w-[34rem] rounded-none border-0 border-r border-hair-strong bg-chrome p-0 text-strong backdrop:bg-black/40"
    >
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="flex items-start justify-between gap-4 p-6 pb-0">
          <div className="min-w-0">
            <p className="text-micro font-semibold uppercase tracking-wide text-dim">User</p>
            <h2 id="user-drawer-title" className="mt-1 truncate text-title font-semibold text-strong">
              {user.name}
            </h2>
            <p className="mt-0.5 text-meta text-dim">{user.roleLabel}</p>
          </div>
          <Link
            href={closeHref}
            aria-label="Close"
            className="-mr-1 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-app text-dim transition-colors hover:bg-hover"
          >
            <X aria-hidden className="size-4" />
          </Link>
        </div>

        <div className="flex flex-col gap-6 p-6">
          <div className="overflow-hidden rounded-card border border-hair-strong">
            <DetailRow label="Email" value={<span className="break-all">{user.email}</span>} />
            <DetailRow
              label="Status"
              value={<Pill tone={statusTone[user.status]}>{statusLabel[user.status]}</Pill>}
            />
            <DetailRow label="Added" value={user.addedOn} />
            <DetailRow label="Last sign-in" value={user.lastSignIn} last />
          </div>

          <section className="flex flex-col gap-2.5">
            <p className="text-micro font-semibold uppercase tracking-wide text-dim">Role</p>
            <AppSelect
              aria-label="Role"
              value={role}
              disabled={pending}
              onChange={(event) => setRole(event.target.value)}
            >
              {roleValues.map((value) => (
                <option key={value} value={value}>
                  {roleLabels[value]}
                </option>
              ))}
            </AppSelect>
            <Button
              variant="appPrimary"
              size="app"
              width="full"
              disabled={pending || role === user.role}
              onClick={() => act(() => setUserRole(user.id, role), "Role updated.")}
            >
              Save role
            </Button>
          </section>

          <section className="flex flex-col gap-2.5 border-t border-hair pt-6">
            <p className="text-micro font-semibold uppercase tracking-wide text-dim">Account actions</p>

            {user.status === "suspended" ? (
              <ActionButton
                disabled={pending}
                onClick={() => act(() => reactivateUser(user.id), "User reactivated.")}
              >
                Reactivate user
              </ActionButton>
            ) : user.status === "active" ? (
              <ActionButton
                disabled={pending}
                onClick={() => act(() => suspendUser(user.id), "User suspended.")}
              >
                Suspend user
              </ActionButton>
            ) : null}

            {user.status !== "deactivated" ? (
              confirming === "deactivate" ? (
                <ConfirmPanel
                  prompt={`Deactivate ${user.name}? This permanently revokes access and can't be undone.`}
                  confirmLabel="Deactivate user"
                  pending={pending}
                  onCancel={() => setConfirming(null)}
                  onConfirm={() => act(() => deactivateUser(user.id), "User deactivated.")}
                />
              ) : (
                <ActionButton disabled={pending} onClick={() => setConfirming("deactivate")}>
                  Deactivate user
                </ActionButton>
              )
            ) : null}

            {confirming === "delete" ? (
              <div className="flex flex-col gap-3 rounded-app border border-destructive/40 p-4">
                <AppField
                  id="drawer-delete-confirm"
                  label="Type the email to confirm"
                  hint={user.email}
                >
                  <AppInput
                    id="drawer-delete-confirm"
                    value={deleteInput}
                    onChange={(event) => setDeleteInput(event.target.value)}
                    placeholder={user.email}
                    autoComplete="off"
                  />
                </AppField>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
                    onClick={() => {
                      setConfirming(null);
                      setDeleteInput("");
                    }}
                  >
                    Cancel
                  </button>
                  <Button
                    variant="destructive"
                    size="app"
                    width="auto"
                    disabled={pending || deleteInput.trim().toLowerCase() !== user.email.toLowerCase()}
                    onClick={() => act(() => purgeUser(user.id), "Personal data deleted.")}
                  >
                    Delete personal data
                  </Button>
                </div>
              </div>
            ) : (
              <ActionButton
                tone="destructive"
                disabled={pending}
                onClick={() => setConfirming("delete")}
              >
                Delete personal data
              </ActionButton>
            )}

            <p className="text-meta text-dim">
              Deleting personal data is available to Org Owners only. Audit records are retained.
            </p>
          </section>

          {message ? (
            <p
              role={message.tone === "error" ? "alert" : "status"}
              className={message.tone === "error" ? "text-meta text-destructive" : "text-meta text-brand-accent"}
            >
              {message.text}
            </p>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}

function DetailRow({ label, value, last }: { label: string; value: ReactNode; last?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 ${last ? "" : "border-b border-hair"}`}
    >
      <span className="text-meta text-dim">{label}</span>
      <span className="text-app text-strong">{value}</span>
    </div>
  );
}

/** A full-width, left-aligned account-action button. */
function ActionButton({
  children,
  onClick,
  disabled,
  tone = "default",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "destructive";
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={buttonVariants({
        variant: tone === "destructive" ? "destructive" : "appSecondary",
        size: "app",
        width: "full",
        className: "justify-start",
      })}
    >
      {children}
    </button>
  );
}

function ConfirmPanel({
  prompt,
  confirmLabel,
  pending,
  onConfirm,
  onCancel,
}: {
  prompt: string;
  confirmLabel: string;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-app border border-hair-strong p-4">
      <p className="text-meta text-dim">{prompt}</p>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
          onClick={onCancel}
        >
          Cancel
        </button>
        <Button variant="destructive" size="app" width="auto" disabled={pending} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
