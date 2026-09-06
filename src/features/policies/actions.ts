"use server";

import { revalidatePath } from "next/cache";

import { describePolicyActionError, type PolicyActionKind } from "@/features/policies/action-messages";
import { type Intent, intentSchema } from "@/features/policies/schemas";
import { apiErrorStatus, apiFetch } from "@/lib/api-client";

/**
 * Server Actions for the admin-policy mutations. Every write against an existing
 * policy sends the caller's ETag as `If-Match`, so a change made since the
 * drawer was opened is rejected (412) rather than silently overwriting a
 * concurrent edit. Authorization is the gateway's job (§12).
 *
 * Lifecycle actions (enforce/off/rollback/discardDraft) are wired to the drawer.
 * The authoring actions (create/update/startDraft/saveDraft) are complete but
 * await the Intent builder UI before they have a caller.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

const POLICIES_PATH = "/policies";

async function run(action: PolicyActionKind, request: () => Promise<unknown>): Promise<ActionResult> {
  try {
    await request();
  } catch (error) {
    const status = apiErrorStatus(error);
    if (status === undefined) throw error;
    return { ok: false, error: describePolicyActionError(action, status) };
  }
  revalidatePath(POLICIES_PATH);
  return { ok: true };
}

/** The If-Match header carrying a policy's current ETag. */
function ifMatch(etag: string): Record<string, string> {
  return { "if-match": etag };
}

/** Create a policy as a Draft (`POST /v1/policies`). */
export async function createPolicy(name: string, intent: Intent): Promise<ActionResult> {
  const parsed = intentSchema.safeParse(intent);
  if (!parsed.success) return { ok: false, error: describePolicyActionError("create", 422) };
  return run("create", () => apiFetch("/v1/policies", { method: "POST", body: { name, intent: parsed.data } }));
}

/** Edit an unpublished Draft in place (`PUT /v1/policies/{id}`). */
export async function updatePolicy(id: string, etag: string, intent: Intent): Promise<ActionResult> {
  const parsed = intentSchema.safeParse(intent);
  if (!parsed.success) return { ok: false, error: describePolicyActionError("update", 422) };
  return run("update", () =>
    apiFetch(`/v1/policies/${id}`, { method: "PUT", body: { intent: parsed.data }, headers: ifMatch(etag) }),
  );
}

/** Open a draft against a published policy (`POST /v1/policies/{id}/draft`). */
export async function startPolicyDraft(id: string, etag: string, intent: Intent): Promise<ActionResult> {
  return run("startDraft", () =>
    apiFetch(`/v1/policies/${id}/draft`, { method: "POST", body: { intent }, headers: ifMatch(etag) }),
  );
}

/** Autosave in-progress draft work, unvalidated (`PUT /v1/policies/{id}/draft`). */
export async function savePolicyDraftPartial(id: string, etag: string, intent: Intent): Promise<ActionResult> {
  return run("saveDraft", () =>
    apiFetch(`/v1/policies/${id}/draft`, { method: "PUT", body: { intent }, headers: ifMatch(etag) }),
  );
}

/** Abandon a pending draft (`DELETE /v1/policies/{id}/draft`). */
export async function discardPolicyDraft(id: string, etag: string): Promise<ActionResult> {
  return run("discardDraft", () =>
    apiFetch(`/v1/policies/${id}/draft`, { method: "DELETE", headers: ifMatch(etag) }),
  );
}

/** Activate the policy (`POST /v1/policies/{id}/enforce`). */
export async function enforcePolicy(id: string, etag: string): Promise<ActionResult> {
  return run("enforce", () =>
    apiFetch(`/v1/policies/${id}/enforce`, { method: "POST", headers: ifMatch(etag) }),
  );
}

/** Stop enforcing (`POST /v1/policies/{id}/off`). */
export async function turnPolicyOff(id: string, etag: string): Promise<ActionResult> {
  return run("off", () => apiFetch(`/v1/policies/${id}/off`, { method: "POST", headers: ifMatch(etag) }));
}

/** Restore an earlier version's content as a new version (`POST /v1/policies/{id}/rollback`). */
export async function rollbackPolicy(id: string, etag: string, toVersion: number): Promise<ActionResult> {
  return run("rollback", () =>
    apiFetch(`/v1/policies/${id}/rollback`, { method: "POST", body: { toVersion }, headers: ifMatch(etag) }),
  );
}
