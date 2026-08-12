import type { Metadata } from "next";

import { NotDesignedYet } from "@/features/app-shell/components/not-designed-yet";

export const metadata: Metadata = { title: "Policies" };

export default function PoliciesPage() {
  return (
    <NotDesignedYet
      title="Policies"
      description="DLP policies: detection rules, scope, actions, and exceptions."
    />
  );
}
