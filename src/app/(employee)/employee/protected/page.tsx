import { Check } from "lucide-react";
import type { Metadata } from "next";

import { EmployeeScreen, SummaryRow } from "@/features/employee/components/employee-screen";

export const metadata: Metadata = { title: "Device protected" };

export default function ProtectedPage() {
  return (
    <EmployeeScreen
      badge={
        <span className="flex size-12 items-center justify-center rounded-full bg-pill-ok-bg text-state-ok">
          <Check aria-hidden className="size-6" />
        </span>
      }
      title="Your device is protected."
      intro="PrismSek is active on this laptop and reporting to Northwind. Nothing else is needed from you."
      footer="Step 3 of 3 · You can close this page."
    >
      <div>
        <SummaryRow label="Device" value="WKS-ATL-0142" />
        <SummaryRow label="Company" value="Northwind" />
        <SummaryRow label="Browser protection" value="Chrome · Edge" />
      </div>
    </EmployeeScreen>
  );
}
