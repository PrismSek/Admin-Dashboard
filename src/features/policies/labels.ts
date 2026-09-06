import type { PolicyAction, PolicyChannelId, PolicyState } from "@/features/policies/schemas";

/**
 * Display labels and the UI list shape for policies. Kept free of `server-only`
 * so both the list (Server Component) and the detail drawer (client) can import
 * them; the API mapping lives in `api.ts`.
 */

/** The UI's lifecycle vocabulary. The API's `Active` maps to `enforced`. */
export type Lifecycle = "enforced" | "draft" | "off";

/** Deployment health is separate telemetry the admin-policy API does not carry. */
export type Health = "unknown";

export type PolicyListItem = {
  id: string;
  name: string;
  lifecycle: Lifecycle;
  /** Enforcement mode label for an active policy; null (rendered "—") otherwise. */
  enforcementMode: string | null;
  health: Health;
  owner: string;
  lastChange: string;
};

export const lifecycleLabel: Record<Lifecycle, string> = {
  enforced: "Enforced",
  draft: "Draft",
  off: "Off",
};

export const healthLabel: Record<Health, string> = {
  unknown: "Unknown",
};

/** Enforcement action → display label. */
export const actionLabels: Record<PolicyAction, string> = {
  AuditOnly: "Audit only",
  WarnJustify: "Warn & justify",
  BlockWithOverride: "Block with override",
  Block: "Block",
};

export const stateLabel: Record<PolicyState, string> = {
  Draft: "Draft",
  Active: "Active",
  Off: "Off",
};

/** Project a gateway state onto the UI lifecycle. */
export function lifecycleForState(state: PolicyState): Lifecycle {
  return state === "Active" ? "enforced" : state === "Off" ? "off" : "draft";
}

/**
 * Display text for a channel code. The gateway's channel ids are the source of
 * truth, so labels are derived rather than kept as a separate copy table: split
 * camelCase word boundaries while keeping acronyms whole (`BrowserUpload` →
 * "Browser Upload", `AIAgent` → "AI Agent", `USB` → "USB").
 */
export function channelLabel(id: PolicyChannelId): string {
  return id
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
}
