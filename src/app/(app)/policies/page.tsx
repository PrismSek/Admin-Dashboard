import type { Metadata } from "next";

import { listPolicies } from "@/features/policies/api";
import { PolicyList } from "@/features/policies/components/PolicyList";
import { parsePolicyListState, selectPolicyRows } from "@/features/policies/list-state";

export const metadata: Metadata = { title: "Policies" };

export default async function PoliciesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const state = parsePolicyListState(await searchParams);
  const policies = await listPolicies();
  const selection = selectPolicyRows(policies, state);
  return <PolicyList state={state} selection={selection} />;
}
