/**
 * Disposition — how a domain or application is governed. Shared by
 * Manage → Domains and Manage → Applications. The label is dark ink at the
 * call site; only the shield icon carries colour (see DispositionCell).
 */
export type Disposition = "allowed" | "blocked" | "monitored";

export const dispositionLabel: Record<Disposition, string> = {
  allowed: "Allowed",
  blocked: "Blocked",
  monitored: "Monitored",
};
