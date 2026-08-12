"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AppInput } from "@/components/app/field";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type Candidate = {
  id: string;
  name: string;
  detail: string;
  status: string;
  statusTone: "ok" | "unknown";
};

/**
 * Right-hand drawer for adding users or endpoints to a department.
 *
 * Opened by `?panel=add-users` / `?panel=add-endpoints`, so the server renders
 * the candidate list and the URL stays shareable. Selection is local state —
 * it is transient and never worth a round trip.
 */
export function AddMembersDrawer({
  departmentLabel,
  kind,
  candidates,
  closeHref,
}: {
  departmentLabel: string;
  kind: "users" | "endpoints";
  candidates: Candidate[];
  closeHref: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const visible = candidates.filter(
    (candidate) =>
      !query ||
      candidate.name.toLowerCase().includes(query.toLowerCase()) ||
      candidate.detail.toLowerCase().includes(query.toLowerCase()),
  );

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  return (
    <dialog
      ref={ref}
      aria-labelledby="drawer-title"
      onCancel={(event) => {
        event.preventDefault();
        window.location.href = closeHref;
      }}
      className={cn(
        "fixed inset-y-0 right-0 left-auto m-0 h-dvh w-full max-w-xl",
        "border-l border-hair-strong bg-chrome p-0 text-strong backdrop:bg-black/40",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="p-6">
          <p className="text-meta font-semibold text-brand-accent">{departmentLabel}</p>
          <h2 id="drawer-title" className="mt-2 text-page-title text-strong">
            Add {kind} to this group
          </h2>
          <p className="mt-2 text-meta text-dim">
            {kind === "endpoints"
              ? "Direct assignment is an override. Use it for shared or unassigned devices — an endpoint that belongs to a member's user is already inherited."
              : "Adding a user brings their assigned endpoints with them. Endpoints they are not assigned stay where they are."}
          </p>

          <AppInput
            className="mt-5"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              kind === "endpoints"
                ? "Search by name, email, or device identifier"
                : "Search by name or email"
            }
            aria-label="Search candidates"
          />
        </div>

        <ul className="min-h-0 flex-1 divide-y divide-hair overflow-y-auto border-y border-hair">
          {visible.map((candidate) => (
            <li key={candidate.id} className="flex items-center gap-4 px-6 py-4">
              <Checkbox
                id={`candidate-${candidate.id}`}
                checked={selected.includes(candidate.id)}
                onChange={() => toggle(candidate.id)}
              />
              <label
                htmlFor={`candidate-${candidate.id}`}
                className="min-w-0 flex-1 cursor-pointer"
              >
                <span className="block text-app font-semibold text-strong">
                  {candidate.name}
                </span>
                <span className="mt-0.5 block text-meta text-subtle">{candidate.detail}</span>
              </label>
              <span
                className={cn(
                  "shrink-0 text-meta",
                  candidate.statusTone === "ok" ? "text-state-ok" : "text-subtle",
                )}
              >
                {candidate.status}
              </span>
            </li>
          ))}
          {visible.length === 0 ? (
            <li className="px-6 py-12 text-center text-meta text-dim">
              Nothing matches that search.
            </li>
          ) : null}
        </ul>

        <p className="px-6 py-4 text-meta text-dim">
          Membership changes policy scope only. Rollout ring, agent version, and protection
          state are unaffected, and the change is written to the audit trail before it takes
          effect.
        </p>

        <div className="flex items-center justify-between gap-4 border-t border-hair px-6 py-4">
          <p className="text-meta text-strong">{selected.length} selected</p>
          <div className="flex items-center gap-3">
            <Link
              href={closeHref}
              className={buttonVariants({ variant: "ghost", size: "app", width: "auto" })}
            >
              Cancel
            </Link>
            <Button
              variant="appPrimary"
              size="app"
              width="auto"
              type="submit"
              disabled={selected.length === 0}
            >
              Add {selected.length} member{selected.length === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
