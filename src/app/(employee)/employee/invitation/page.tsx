import type { Metadata } from "next";

import { EmployeeScreen } from "@/features/employee/components/employee-screen";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Install PrismSek" };

export default function InvitationPage() {
  return (
    <EmployeeScreen
      eyebrow="Invitation from Northwind"
      title="Northwind asks you to install PrismSek on your work laptop."
      intro="It protects company data on this device. It takes about three minutes and needs one Windows administrator approval."
      footer={
        <div className="space-y-1">
          <p>For Priya Nair · p.nair@northwind.com</p>
          <p>Windows 10 or 11 required · Link expires 15 Sep 2026</p>
          <p>Need help? it-help@northwind.com</p>
        </div>
      }
    >
      <button
        type="button"
        className={buttonVariants({ variant: "appPrimary", size: "app", width: "full" })}
      >
        Install PrismSek
      </button>
    </EmployeeScreen>
  );
}
