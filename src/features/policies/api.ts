import "server-only";

import { RELATIVE_TIME_PLACEHOLDER, formatRelativeTime } from "@/features/policies/relative-time";
import { actionLabels, lifecycleForState, type PolicyListItem } from "@/features/policies/labels";
import {
  type Policy,
  type PolicyVersion,
  listPoliciesResponseSchema,
  listPolicyVersionsResponseSchema,
  policyChannelsResponseSchema,
  policySchema,
} from "@/features/policies/schemas";
import { apiErrorStatus, apiFetch, apiFetchWithEtag } from "@/lib/api-client";

/**
 * Server-only reads for the Policy surface. Every response is re-parsed with
 * the `schemas.ts` zod contracts at the boundary (§6) so a backend shape
 * change fails loudly here rather than as `undefined` in the UI.
 */

/**
 * Project one gateway `Policy` onto the list row the table renders. Three of
 * the six Figma columns have no gateway field (see the integration note):
 * `health` is always `null` (rendered "—") because the admin-policy API
 * carries no deployment telemetry; `owner` is the policy's `createdBy`; and
 * `enforcementMode` is only meaningful for an enforced policy with a published
 * intent (the Figma "Simulation" values have no Phase 1 equivalent).
 */
export function toPolicyListItem(policy: Policy): PolicyListItem {
  const lifecycle = lifecycleForState(policy.state);
  const action = policy.intent?.response?.action;
  return {
    id: policy.id,
    name: policy.name,
    lifecycle,
    enforcementMode: lifecycle === "enforced" && action ? actionLabels[action] : null,
    health: null,
    owner: policy.createdBy ?? RELATIVE_TIME_PLACEHOLDER,
    lastChange: formatRelativeTime(policy.updatedAt),
  };
}

/** The tenant's policies (`GET /v1/policies`), mapped to the list row shape. */
export async function listPolicies(): Promise<readonly PolicyListItem[]> {
  const body = await apiFetch("/v1/policies");
  const { policies } = listPoliciesResponseSchema.parse(body);
  return policies.map(toPolicyListItem);
}

export type PolicyDetail = {
  policy: Policy;
  /** The concurrency token to send as `If-Match` on the next mutation. */
  etag: string | null;
  versions: PolicyVersion[];
};

/** Read one policy plus its version history (`GET /v1/policies/{id}` + `/versions`). */
export async function getPolicyDetail(id: string): Promise<PolicyDetail | null> {
  let result: { data: unknown; etag: string | null };
  try {
    result = await apiFetchWithEtag(`/v1/policies/${id}`);
  } catch (error) {
    if (apiErrorStatus(error) === 404) return null;
    throw error;
  }
  const policy = policySchema.parse(result.data);
  const versions = await listPolicyVersions(id);
  return { policy, etag: result.etag ?? policy.etag ?? null, versions };
}

/** The policy's immutable version history, oldest first (`GET /v1/policies/{id}/versions`). */
export async function listPolicyVersions(id: string): Promise<PolicyVersion[]> {
  const body = await apiFetch(`/v1/policies/${id}/versions`);
  return listPolicyVersionsResponseSchema.parse(body).versions;
}

/** The canonical Phase 1 channel registry (`GET /v1/policy-channels`). */
export async function listPolicyChannels() {
  const body = await apiFetch("/v1/policy-channels");
  return policyChannelsResponseSchema.parse(body);
}
