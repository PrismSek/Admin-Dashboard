import type { z } from "zod";

import type {
  PolicyAction,
  PolicyChannelId,
  PolicyState,
  healthValueSchema,
  policyListItemSchema,
} from "@/features/policies/schemas";

/**
 * Display labels and the UI list shape for policies. Kept free of `server-only`
 * so both the list (Server Component) and the detail drawer (client) can import
 * them; the API mapping lives in `api.ts`.
 */

/** The Policy list row's display shape, derived from the fixture boundary
 * schema (`policyListItemSchema`) so the data and the UI cannot drift apart. */
export type PolicyListItem = z.infer<typeof policyListItemSchema>;

/** The UI's lifecycle vocabulary. The API's `Active` maps to `enforced`. */
export type Lifecycle = PolicyListItem["lifecycle"];

/** Deployment health, as drawn in the Figma list capture — separate telemetry
 * the admin-policy gateway itself does not carry, so a live-API row's health is
 * `null` (see `PolicyListItem["health"]`). This is the non-null value set. */
export type Health = z.infer<typeof healthValueSchema>;

export const lifecycleLabel: Record<Lifecycle, string> = {
  enforced: "Enforced",
  draft: "Draft",
  off: "Off",
};

export const healthLabel: Record<Health, string> = {
  Healthy: "Healthy",
  Degraded: "Degraded",
  "Approval pending": "Approval pending",
  Stale: "Stale",
  "Not deployed": "Not deployed",
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
