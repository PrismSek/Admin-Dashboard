import type { Metadata } from "next";

import { PolicyList } from "@/features/policies/components/PolicyList";
import { getPolicyFixtures } from "@/features/policies/data";
import { parsePolicyListState, selectPolicyRows } from "@/features/policies/list-state";

export const metadata: Metadata = { title: "Policies" };

export default async function PoliciesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const state = parsePolicyListState(await searchParams);
  const policies = await getPolicyFixtures();
  const selection = selectPolicyRows(policies, state);
  return <PolicyList state={state} selection={selection} />;
}
