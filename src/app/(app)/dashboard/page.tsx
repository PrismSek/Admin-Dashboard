import type { Metadata } from "next";

import { NotDesignedYet } from "@/features/app-shell/components/not-designed-yet";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <NotDesignedYet
      title="Dashboard"
      description="Fleet posture, policy coverage, and recent activity at a glance."
    />
  );
}
