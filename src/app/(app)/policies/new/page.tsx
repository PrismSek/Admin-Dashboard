import type { Metadata } from "next";

import { PolicyBuilder } from "@/features/policies/components/PolicyBuilder";
import { getPolicyCatalogs } from "@/features/policies/data";

export const metadata: Metadata = { title: "Create a policy" };

/**
 * Thin Server Component: fetch the authoring catalogs (audiences, channels,
 * findings, and the rest — see `PolicyCatalogs`) and hand them to the client
 * `PolicyBuilder`, which owns the whole seven-step form. All markup and
 * interactivity live in `features/policies/components` (§4 of
 * CODING_STANDARDS — `app/` stays thin).
 */
export default async function CreatePolicyPage() {
  const catalogs = await getPolicyCatalogs();
  return <PolicyBuilder catalogs={catalogs} />;
}
