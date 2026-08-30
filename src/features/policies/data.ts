import "server-only";

/**
 * DLP policy list data for the Policies screen. Server-only fixtures matching
 * the Figma content (frame "Policies"). Swap `getPolicies` for an API call when
 * the backend exists; the signature is already async.
 */

export type Lifecycle = "enforced" | "simulation" | "draft" | "off";
export type Health = "healthy" | "degraded" | "approval-pending" | "not-deployed" | "stale";

export type Policy = {
  id: string;
  name: string;
  lifecycle: Lifecycle;
  /** Enforcement mode label, or null for draft/off policies (rendered as "—"). */
  enforcementMode: string | null;
  health: Health;
  owner: string;
  lastChange: string;
};

export const lifecycleLabel: Record<Lifecycle, string> = {
  enforced: "Enforced",
  simulation: "Simulation",
  draft: "Draft",
  off: "Off",
};

export const healthLabel: Record<Health, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  "approval-pending": "Approval pending",
  "not-deployed": "Not deployed",
  stale: "Stale",
};

const policies: Policy[] = [
  { id: "p01", name: "Financial records to unmanaged cloud", lifecycle: "enforced", enforcementMode: "Block with override", health: "healthy", owner: "R. Advani", lastChange: "2 days ago" },
  { id: "p02", name: "Customer PII to web destinations", lifecycle: "enforced", enforcementMode: "Warn & justify", health: "degraded", owner: "R. Advani", lastChange: "4 hours ago" },
  { id: "p03", name: "India Aadhaar & PAN — removable media", lifecycle: "simulation", enforcementMode: "Simulation with tips", health: "approval-pending", owner: "S. Iyer", lastChange: "1 day ago" },
  { id: "p04", name: "Source code to personal Git remotes", lifecycle: "draft", enforcementMode: null, health: "not-deployed", owner: "M. Okafor", lastChange: "25 minutes ago" },
  { id: "p05", name: "Highly Confidential label — print", lifecycle: "enforced", enforcementMode: "Block", health: "stale", owner: "Compliance", lastChange: "3 weeks ago" },
  { id: "p06", name: "Contract drafts to AI assistants", lifecycle: "simulation", enforcementMode: "Simulation", health: "healthy", owner: "Legal Ops", lastChange: "6 days ago" },
  { id: "p07", name: "Patient records to email attachments", lifecycle: "enforced", enforcementMode: "Block with override", health: "healthy", owner: "Compliance", lastChange: "5 days ago" },
  { id: "p08", name: "Payroll exports to network shares", lifecycle: "off", enforcementMode: null, health: "not-deployed", owner: "S. Iyer", lastChange: "1 month ago" },
  { id: "p09", name: "Cardholder data to removable media", lifecycle: "enforced", enforcementMode: "Block", health: "healthy", owner: "Compliance", lastChange: "3 days ago" },
  { id: "p10", name: "Board minutes to personal email", lifecycle: "enforced", enforcementMode: "Block with override", health: "healthy", owner: "R. Advani", lastChange: "4 days ago" },
  { id: "p11", name: "Screen capture in payroll application", lifecycle: "enforced", enforcementMode: "Block", health: "degraded", owner: "M. Okafor", lastChange: "8 days ago" },
  { id: "p12", name: "CRM bulk export to browser downloads", lifecycle: "simulation", enforcementMode: "Simulation with tips", health: "approval-pending", owner: "S. Iyer", lastChange: "2 days ago" },
  { id: "p13", name: "Vendor contracts to unmanaged sync", lifecycle: "enforced", enforcementMode: "Warn & justify", health: "healthy", owner: "Legal Ops", lastChange: "11 days ago" },
  { id: "p14", name: "Credentials and API keys to any channel", lifecycle: "enforced", enforcementMode: "Block", health: "healthy", owner: "Compliance", lastChange: "6 days ago" },
  { id: "p15", name: "HR case files to print", lifecycle: "simulation", enforcementMode: "Simulation", health: "stale", owner: "Compliance", lastChange: "7 days ago" },
  { id: "p16", name: "Design files to external file sharing", lifecycle: "enforced", enforcementMode: "Block with override", health: "healthy", owner: "R. Advani", lastChange: "9 days ago" },
  { id: "p17", name: "Meeting recordings to personal cloud", lifecycle: "simulation", enforcementMode: "Simulation", health: "healthy", owner: "Legal Ops", lastChange: "12 days ago" },
  { id: "p18", name: "Legacy PII export tool", lifecycle: "off", enforcementMode: null, health: "not-deployed", owner: "S. Iyer", lastChange: "2 months ago" },
  { id: "p19", name: "Customer list to clipboard", lifecycle: "enforced", enforcementMode: "Block", health: "healthy", owner: "Compliance", lastChange: "5 days ago" },
];

export async function getPolicies(): Promise<Policy[]> {
  return policies;
}

export async function getPolicyCounts() {
  return {
    all: policies.length,
    draft: policies.filter((p) => p.lifecycle === "draft").length,
    off: policies.filter((p) => p.lifecycle === "off").length,
  };
}
