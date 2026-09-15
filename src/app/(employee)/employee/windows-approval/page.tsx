import type { Metadata } from "next";

import { EmployeeScreen } from "@/features/employee/components/employee-screen";

export const metadata: Metadata = { title: "Windows approval" };

export default function WindowsApprovalPage() {
  return (
    <EmployeeScreen
      title="Windows will ask for approval"
      intro="Choose Yes when the prompt appears. No password is ever typed on this page."
      footer="Step 1 of 3 · Approve, install, protect"
    >
      {/* Windows UAC prompt, recreated so the employee recognises it. */}
      <div className="overflow-hidden rounded-app border border-hair-strong">
        <p className="bg-uac-titlebar px-3.5 py-2 text-micro text-chrome">User Account Control</p>
        <div className="px-3.5 py-3">
          <p className="text-meta font-medium text-strong">
            Do you want to allow this app to make changes to your device?
          </p>
          <p className="mt-1.5 text-meta text-copy">PrismSek Endpoint Agent</p>
          <p className="mt-0.5 text-meta text-muted">
            Verified publisher: Skyrion Labs Private Limited
          </p>
          <div className="mt-3 flex gap-2">
            <span className="flex-1 rounded-sm bg-uac-accent py-1.5 text-center text-meta text-chrome">
              Yes
            </span>
            <span className="flex-1 rounded-sm border border-hair-strong bg-canvas py-1.5 text-center text-meta text-strong">
              No
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="mt-3 w-full rounded-app border border-hair-strong bg-canvas py-2.5 text-center text-app text-copy transition-colors hover:bg-hover"
      >
        I do not have administrator rights
      </button>
    </EmployeeScreen>
  );
}
