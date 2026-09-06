/**
 * User-facing copy for the policy actions, mapped from the gateway's status
 * codes. Pure and centralised so the wording lives in one place and the Server
 * Actions stay thin (a `"use server"` module may export only async actions).
 */

export type PolicyActionKind =
  | "create"
  | "update"
  | "startDraft"
  | "saveDraft"
  | "discardDraft"
  | "enforce"
  | "off"
  | "rollback";

/** Shared across actions; a per-action SPECIFIC entry overrides these. */
const COMMON: Record<number, string> = {
  403: "You don't have permission to make this change.",
  404: "That policy no longer exists.",
  412: "This policy changed since you opened it. Reopen it and try again.",
  428: "This change needs the policy's current version. Reopen it and try again.",
};

const GENERIC: Record<PolicyActionKind, string> = {
  create: "Couldn't create the policy. Try again.",
  update: "Couldn't save the policy. Try again.",
  startDraft: "Couldn't open a draft. Try again.",
  saveDraft: "Couldn't save the draft. Try again.",
  discardDraft: "Couldn't discard the draft. Try again.",
  enforce: "Couldn't activate the policy. Try again.",
  off: "Couldn't turn the policy off. Try again.",
  rollback: "Couldn't roll the policy back. Try again.",
};

const SPECIFIC: Partial<Record<PolicyActionKind, Record<number, string>>> = {
  create: {
    409: "A policy with that name already exists.",
    422: "The policy isn't valid — fix the highlighted problems and try again.",
  },
  update: {
    409: "This policy is already published — open a draft to edit it.",
    422: "The policy isn't valid — fix the highlighted problems and try again.",
  },
  startDraft: {
    409: "A draft is already open, or nothing is published yet.",
  },
  saveDraft: {
    409: "No draft is open, or it needs reconciling against a newer version.",
  },
  discardDraft: {
    409: "There's no draft to discard.",
  },
  enforce: {
    409: "This policy can't be activated from its current state.",
  },
  off: {
    409: "This policy can't be turned off from its current state.",
  },
  rollback: {
    409: "That version doesn't exist, or nothing is published yet.",
  },
};

/** The message to show when `action` failed with gateway `status` (or none). */
export function describePolicyActionError(
  action: PolicyActionKind,
  status: number | undefined,
): string {
  if (status === undefined) return GENERIC[action];
  return SPECIFIC[action]?.[status] ?? COMMON[status] ?? GENERIC[action];
}
