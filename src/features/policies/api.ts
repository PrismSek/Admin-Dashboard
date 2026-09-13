import "server-only";

import { getPolicyFixtures } from "@/features/policies/data";
import type { PolicyListItem } from "@/features/policies/labels";
import {
  type Policy,
  type PolicyVersion,
  listPolicyVersionsResponseSchema,
  policyChannelsResponseSchema,
  policySchema,
} from "@/features/policies/schemas";
import { apiErrorStatus, apiFetch, apiFetchWithEtag } from "@/lib/api-client";

/**
 * Server-only reads for the Policy surface. The list is Figma-fixture data for
 * this frontend-only phase (no admin-policy list/create contract exists yet);
 * the detail/version-history/channel-registry reads below still talk to the
 * gateway and are retained for the designed surfaces that will need them.
 */

/** The Figma reference list (see data.ts), in Figma order. */
export async function listPolicies(): Promise<readonly PolicyListItem[]> {
  return getPolicyFixtures();
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
