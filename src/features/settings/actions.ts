"use server";

import { revalidatePath } from "next/cache";

import { describeUserActionError, type UserAction } from "@/features/settings/action-messages";
import {
  apiUserRoleSchema,
  createInviteRequestSchema,
  createInviteResponseSchema,
} from "@/features/settings/schemas";
import { apiErrorStatus, apiFetch } from "@/lib/api-client";

/**
 * Server Actions for the account controls in the user drawer. Each reads the
 * session cookie server-side (via the api client), calls the gateway, and
 * revalidates the users route so the drawer and list reflect the change on the
 * next render. Authorization is the gateway's job — these re-check nothing the
 * gateway would not (CODING_STANDARDS §12); a hidden button is UX, not access
 * control.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * A sent invitation. `mailFailed` means the invite row exists but the email did
 * not go out, so the caller should suggest a resend rather than assume delivery.
 */
export type InviteResult = { ok: true; mailFailed: boolean } | { ok: false; error: string };

const USERS_PATH = "/settings/users";

/**
 * Run one mutation and normalise the outcome. A gateway error becomes a
 * friendly per-action message; a `redirect()` (expired session) or an
 * unexpected fault is re-thrown so it is never silently swallowed.
 */
async function run(action: UserAction, request: () => Promise<unknown>): Promise<ActionResult> {
  try {
    await request();
  } catch (error) {
    const status = apiErrorStatus(error);
    if (status === undefined) throw error;
    return { ok: false, error: describeUserActionError(action, status) };
  }
  revalidatePath(USERS_PATH);
  return { ok: true };
}

/** Change a user's role (`PATCH /v1/users/{id}/role`). */
export async function setUserRole(userId: string, role: string): Promise<ActionResult> {
  const parsed = apiUserRoleSchema.safeParse(role);
  if (!parsed.success) return { ok: false, error: describeUserActionError("role", 400) };
  return run("role", () =>
    apiFetch(`/v1/users/${userId}/role`, { method: "PATCH", body: { role: parsed.data } }),
  );
}

/** Suspend a user — a reversible access freeze (`POST /v1/users/{id}/suspend`). */
export async function suspendUser(userId: string): Promise<ActionResult> {
  return run("suspend", () => apiFetch(`/v1/users/${userId}/suspend`, { method: "POST" }));
}

/** Restore a suspended user (`POST /v1/users/{id}/reactivate`). */
export async function reactivateUser(userId: string): Promise<ActionResult> {
  return run("reactivate", () => apiFetch(`/v1/users/${userId}/reactivate`, { method: "POST" }));
}

/** Permanently revoke access — terminal in V1 (`POST /v1/users/{id}/deactivate`). */
export async function deactivateUser(userId: string): Promise<ActionResult> {
  return run("deactivate", () => apiFetch(`/v1/users/${userId}/deactivate`, { method: "POST" }));
}

/** GDPR erasure (`POST /v1/users/{id}/purge`) — returns 501 today; surfaced as unavailable. */
export async function purgeUser(userId: string): Promise<ActionResult> {
  return run("purge", () => apiFetch(`/v1/users/${userId}/purge`, { method: "POST" }));
}

/**
 * Invite a user to this tenant (`POST /v1/invites`). The gateway emails the
 * single-use token to the invitee; we deliberately do not surface the raw token
 * the 201 carries. Reports `mailFailed` so the UI can nudge a resend when the
 * message did not go out.
 */
export async function createInvite(email: string, role: string): Promise<InviteResult> {
  const parsed = createInviteRequestSchema.safeParse({ email, role });
  if (!parsed.success) return { ok: false, error: describeUserActionError("invite", 400) };

  let body: unknown;
  try {
    body = await apiFetch("/v1/invites", { method: "POST", body: parsed.data });
  } catch (error) {
    const status = apiErrorStatus(error);
    if (status === undefined) throw error;
    return { ok: false, error: describeUserActionError("invite", status) };
  }

  const { mailFailed } = createInviteResponseSchema.parse(body);
  revalidatePath(USERS_PATH);
  return { ok: true, mailFailed: mailFailed ?? false };
}

/** Reissue a pending or expired invitation (`POST /v1/invites/{id}/resend`). */
export async function resendInvite(inviteId: string): Promise<ActionResult> {
  return run("resend", () => apiFetch(`/v1/invites/${inviteId}/resend`, { method: "POST" }));
}

/** Revoke a pending invitation (`POST /v1/invites/{id}/revoke`) — kept as history. */
export async function revokeInvite(inviteId: string): Promise<ActionResult> {
  return run("revoke", () => apiFetch(`/v1/invites/${inviteId}/revoke`, { method: "POST" }));
}
