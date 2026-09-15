import type { Metadata } from "next";

import { EmployeeScreen } from "@/features/employee/components/employee-screen";

export const metadata: Metadata = { title: "IT approval" };

export default function ItApprovalPage() {
  return (
    <EmployeeScreen
      title="IT has been asked to approve this"
      intro="Your Windows account cannot approve the prompt. Keep this page open — the install continues on its own once IT approves."
      footer="You can close this page and come back to the same link later."
    >
      <div className="rounded-app border border-line-faint px-4 py-3">
        <p className="text-meta font-medium text-strong">Reference REQ-7412</p>
        <p className="mt-0.5 text-meta text-muted">
          it-help@northwind.com · usually answered within 2 hours
        </p>
      </div>
    </EmployeeScreen>
  );
}
