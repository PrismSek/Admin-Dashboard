import type { Metadata } from "next";

import { EmployeeScreen } from "@/features/employee/components/employee-screen";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Installing PrismSek" };

type Step = { label: string; state: "done" | "active" | "pending" };

const STEPS: Step[] = [
  { label: "Compatibility checks passed", state: "done" },
  { label: "Agent installed", state: "done" },
  { label: "Joining Northwind", state: "active" },
  { label: "Applying company policy", state: "pending" },
  { label: "Allow the PrismSek extension in Chrome", state: "pending" },
];

export default function InstallingPage() {
  return (
    <EmployeeScreen
      title="Installing PrismSek"
      intro="Keep this laptop on and connected. This usually takes two to three minutes."
      footer="Step 2 of 3 · Do not restart while this runs."
    >
      <div className="h-1.5 overflow-hidden rounded-full bg-line-faint">
        <div className="h-full w-2/5 rounded-full bg-brand" />
      </div>
      <ul className="mt-5 flex flex-col gap-3">
        {STEPS.map((step) => (
          <li key={step.label} className="flex items-center gap-3">
            <span
              aria-hidden
              className={cn(
                "size-4 shrink-0 rounded-full",
                step.state === "done" && "bg-state-ok",
                step.state === "active" && "border-2 border-brand",
                step.state === "pending" && "border-2 border-line-faint",
              )}
            />
            <span
              className={cn(
                "text-meta",
                step.state === "pending" ? "text-muted" : "font-medium text-strong",
              )}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ul>
    </EmployeeScreen>
  );
}
