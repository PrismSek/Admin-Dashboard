"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import type { ActionResult } from "@/features/policies/actions";
import { discardPolicyDraft, enforcePolicy, rollbackPolicy, turnPolicyOff } from "@/features/policies/actions";
import type { PolicyDetail } from "@/features/policies/api";
import { LifecyclePill } from "@/features/policies/components/policy-cells";
import { actionLabels, lifecycleForState, stateLabel } from "@/features/policies/labels";
import type { Intent, PolicyVersion } from "@/features/policies/schemas";

/**
 * Detail panel for one policy, opened as a left drawer over the list. Open state
 * lives in the URL (`?policy=<id>`), so the server fetches the policy and its
 * ETag; the lifecycle actions run as Server Actions and, on success, the
 * revalidated route re-renders this drawer with a fresh ETag.
 */
export function PolicyDrawer({ detail, closeHref }: { detail: PolicyDetail; closeHref: string }) {
  const { policy, etag, versions } = detail;
  const ref = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState<{ tone: "error" | "ok"; text: string } | null>(null);
  const [rollbackTo, setRollbackTo] = useState<string>("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const hasDraft = policy.draft !== undefined || policy.draftState !== undefined;
  const publishedVersions = versions.filter((version) => version.version > 0);
  // Every mutation needs the current ETag as If-Match; without it, disable them.
  const canAct = etag !== null && !pending;

  function act(action: (etag: string) => Promise<ActionResult>, okText: string) {
    if (etag === null) return;
    setMessage(null);
    startTransition(async () => {
      const result = await action(etag);
      if (result.ok) setMessage({ tone: "ok", text: okText });
      else setMessage({ tone: "error", text: result.error });
    });
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="policy-drawer-title"
      onCancel={(event) => {
        event.preventDefault();
        window.location.href = closeHref;
      }}
      className="m-0 mr-auto h-dvh max-h-dvh w-[calc(100vw-3rem)] max-w-[36rem] rounded-none border-0 border-r border-hair-strong bg-chrome p-0 text-strong backdrop:bg-black/40"
    >
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="flex items-start justify-between gap-4 p-6 pb-0">
          <div className="min-w-0">
            <p className="text-micro font-semibold uppercase tracking-wide text-dim">Policy</p>
            <h2 id="policy-drawer-title" className="mt-1 text-title font-semibold text-strong">
              {policy.name}
            </h2>
            <div className="mt-2">
              <LifecyclePill value={lifecycleForState(policy.state)} />
            </div>
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
            <DetailRow label="State" value={stateLabel[policy.state]} />
            <DetailRow label="Published version" value={policy.headVersion ? `v${policy.headVersion}` : "None"} />
            <DetailRow label="Owner" value={policy.updatedBy ?? policy.createdBy ?? "—"} />
            <DetailRow label="Updated" value={policy.updatedAt ? formatDate(policy.updatedAt) : "—"} />
            <DetailRow
              label="Draft"
              value={
                hasDraft
                  ? `Open${policy.draftSourceVersion ? ` · from v${policy.draftSourceVersion}` : ""}${policy.draftComplete === false ? " · incomplete" : ""}`
                  : "None"
              }
              last
            />
          </div>

          <IntentSummary intent={policy.intent} />

          <section className="flex flex-col gap-2.5 border-t border-hair pt-6">
            <p className="text-micro font-semibold uppercase tracking-wide text-dim">Lifecycle</p>

            {policy.state === "Active" ? (
              <ActionButton disabled={!canAct} onClick={() => act((e) => turnPolicyOff(policy.id, e), "Policy turned off.")}>
                Turn off
              </ActionButton>
            ) : (
              <ActionButton disabled={!canAct} onClick={() => act((e) => enforcePolicy(policy.id, e), "Policy activated.")}>
                Activate
              </ActionButton>
            )}

            {hasDraft ? (
              <ActionButton
                tone="destructive"
                disabled={!canAct}
                onClick={() => act((e) => discardPolicyDraft(policy.id, e), "Draft discarded.")}
              >
                Discard draft
              </ActionButton>
            ) : null}

            {publishedVersions.length > 0 ? (
              <div className="mt-1 flex items-end gap-3">
                <label className="flex flex-1 flex-col gap-1.5">
                  <span className="text-meta text-dim">Roll back to</span>
                  <select
                    value={rollbackTo}
                    disabled={!canAct}
                    onChange={(event) => setRollbackTo(event.target.value)}
                    className="h-9 w-full appearance-none rounded-app border border-hair-strong bg-chrome px-3 text-meta text-strong outline-none focus:border-brand-accent"
                  >
                    <option value="">Choose a version…</option>
                    {publishedVersions.map((version) => (
                      <option key={version.version} value={version.version}>
                        v{version.version}
                        {version.restoredFromPolicyVersion ? ` (from v${version.restoredFromPolicyVersion})` : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  disabled={!canAct || rollbackTo === ""}
                  onClick={() => act((e) => rollbackPolicy(policy.id, e, Number(rollbackTo)), "Version restored.")}
                  className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
                >
                  Restore
                </button>
              </div>
            ) : null}
          </section>

          {publishedVersions.length > 0 ? (
            <section className="flex flex-col gap-2.5 border-t border-hair pt-6">
              <p className="text-micro font-semibold uppercase tracking-wide text-dim">Version history</p>
              <ul className="flex flex-col divide-y divide-hair overflow-hidden rounded-card border border-hair-strong">
                {[...publishedVersions].reverse().map((version) => (
                  <VersionRow key={version.version} version={version} />
                ))}
              </ul>
            </section>
          ) : null}

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

function IntentSummary({ intent }: { intent: Intent | undefined }) {
  if (!intent) return null;
  const action = intent.response?.action;
  const onUnknown = intent.response?.onUnknown;
  const channels = Object.entries(intent.channels ?? {})
    .filter(([, config]) => config.on !== false)
    .map(([id]) => id);
  const what = intent.what;

  return (
    <section className="flex flex-col gap-2.5 border-t border-hair pt-6">
      <p className="text-micro font-semibold uppercase tracking-wide text-dim">Intent</p>
      <div className="overflow-hidden rounded-card border border-hair-strong">
        <DetailRow label="Action" value={action ? actionLabels[action] : "—"} />
        <DetailRow label="If unknown" value={onUnknown ? actionLabels[onUnknown] : "—"} />
        <DetailRow label="Channels" value={channels.length ? channels.join(", ") : "—"} />
        <DetailRow
          label="Content"
          value={
            what?.mode === "any"
              ? "Any content"
              : what?.definitionIds?.length
                ? `${what.definitionIds.length} definition${what.definitionIds.length === 1 ? "" : "s"}`
                : "—"
          }
          last
        />
      </div>
    </section>
  );
}

function VersionRow({ version }: { version: PolicyVersion }) {
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-app font-medium text-strong">
        v{version.version}
        {version.restoredFromPolicyVersion ? (
          <span className="ml-2 text-meta text-dim">from v{version.restoredFromPolicyVersion}</span>
        ) : null}
      </span>
      <span className="text-meta text-dim">
        {version.actor ? `${version.actor}` : ""}
        {version.at ? `${version.actor ? " · " : ""}${formatDate(version.at)}` : ""}
      </span>
    </li>
  );
}

function DetailRow({ label, value, last }: { label: string; value: ReactNode; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 px-4 py-3 ${last ? "" : "border-b border-hair"}`}>
      <span className="text-meta text-dim">{label}</span>
      <span className="text-app text-strong">{value}</span>
    </div>
  );
}

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

/** An ISO timestamp as "12 Jan 2024", formatted in UTC for a stable render. */
function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
