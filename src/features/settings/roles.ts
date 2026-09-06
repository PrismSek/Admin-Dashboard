import type { ApiUserRole } from "@/features/settings/schemas";

/**
 * The tenant roles, as the gateway names them, with their display labels. Kept
 * in its own module (no `server-only`) so both Server Components and the client
 * drawer can import them — the wire value (`org_owner`) and the UI label
 * ("Org Owner") stay defined in one place (CODING_STANDARDS §16).
 */
export const roleValues = ["org_owner", "policy_admin", "analyst", "auditor"] as const satisfies readonly ApiUserRole[];

export const roleLabels: Record<ApiUserRole, string> = {
  org_owner: "Org Owner",
  policy_admin: "Policy Admin",
  analyst: "Analyst",
  auditor: "Auditor",
};
