import "server-only";

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
 * Server-only reads for the admin-policy surface. The list endpoint returns the
 * whole tenant (no server-side filter/paging), so the page filters and pages in
 * memory; the detail read also carries the ETag the drawer needs for mutations.
 */

/** One page of the tenant's policies, mapped to the list's display shape. */
export async function listPolicies(): Promise<PolicyListItem[]> {
  const body = await apiFetch("/v1/policies");
  const { policies } = listPoliciesResponseSchema.parse(body);
  return policies.map(toListItem);
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

/** Project a gateway policy onto the list row. */
function toListItem(policy: Policy): PolicyListItem {
  const lifecycle = lifecycleForState(policy.state);
  const action = policy.intent?.response?.action;
  return {
    id: policy.id,
    name: policy.name,
    lifecycle,
    // Enforcement mode reads as the acting verb, but only once a policy is live.
    enforcementMode: lifecycle === "enforced" && action ? actionLabels[action] : null,
    // Deployment health is separate telemetry the admin-policy API does not carry.
    health: "unknown",
    owner: policy.updatedBy ?? policy.createdBy ?? "—",
    lastChange: policy.updatedAt ? relativeTime(policy.updatedAt) : "—",
  };
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/** An ISO timestamp as "2 days ago" / "25 minutes ago", picking the largest unit. */
function relativeTime(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "always" });
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size) return formatter.format(-Math.floor(seconds / size), unit);
  }
  return formatter.format(-seconds, "second");
}
