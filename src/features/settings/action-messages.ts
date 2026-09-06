/**
 * User-facing copy for the account actions in the user drawer, mapped from the
 * gateway's status codes. Pure and centralised so the wording lives in one
 * place and the Server Actions stay thin. Kept out of `actions.ts` because a
 * `"use server"` module may export only async actions.
 */

export type UserAction =
  | "role"
  | "suspend"
  | "reactivate"
  | "deactivate"
  | "purge"
  | "invite"
  | "resend"
  | "revoke";

const GENERIC: Record<UserAction, string> = {
  role: "Couldn't update the role. Try again.",
  suspend: "Couldn't suspend the user. Try again.",
  reactivate: "Couldn't reactivate the user. Try again.",
  deactivate: "Couldn't deactivate the user. Try again.",
  purge: "Couldn't delete personal data. Try again.",
  invite: "Couldn't send the invitation. Try again.",
  resend: "Couldn't resend the invitation. Try again.",
  revoke: "Couldn't revoke the invitation. Try again.",
};

const SPECIFIC: Record<UserAction, Record<number, string>> = {
  role: {
    400: "That role isn't recognised.",
    403: "You can only assign a role you already hold — and not to your own account.",
    404: "That user no longer exists.",
  },
  suspend: {
    403: "You don't have permission to suspend this user.",
    404: "That user no longer exists.",
    409: "This account can't be suspended — it may be the last active Org Owner.",
  },
  reactivate: {
    403: "You don't have permission to reactivate this user.",
    404: "That user no longer exists.",
    409: "Only a suspended account can be reactivated.",
  },
  deactivate: {
    403: "You don't have permission to deactivate this user.",
    404: "That user no longer exists.",
    409: "This account can't be deactivated — it may be the last active Org Owner.",
  },
  purge: {
    403: "Only an Org Owner can delete personal data.",
    501: "Personal-data deletion isn't available yet.",
  },
  invite: {
    400: "Enter a valid email address and a role.",
    403: "You can only invite someone at a role you already hold.",
    409: "That email already belongs to an account in this organization.",
  },
  resend: {
    403: "You don't have permission to resend this invitation.",
    404: "That invitation no longer exists.",
    409: "Only a pending or expired invitation can be resent.",
  },
  revoke: {
    403: "You don't have permission to revoke this invitation.",
    404: "That invitation no longer exists.",
    409: "Only a pending invitation can be revoked.",
  },
};

/** The message to show when `action` failed with gateway `status` (or none). */
export function describeUserActionError(action: UserAction, status: number | undefined): string {
  return (status !== undefined && SPECIFIC[action][status]) || GENERIC[action];
}
