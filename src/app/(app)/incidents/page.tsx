import type { Metadata } from "next";

import { NotDesignedYet } from "@/features/app-shell/components/not-designed-yet";

export const metadata: Metadata = { title: "Incidents" };

export default function IncidentsPage() {
  return (
    <NotDesignedYet
      title="Incidents"
      description="Data-loss findings raised by your policies, and their triage state."
    />
  );
}
