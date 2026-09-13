import { z } from "zod";

/**
 * The admin-policy gateway contract (the `admin-policy` tag of the OpenAPI
 * spec). Every response is re-parsed with these at the boundary so a backend
 * shape change fails loudly here rather than as `undefined` in the UI (§6).
 */

/** Phase 1 lifecycle — the only states the API emits or accepts. */
export const policyStateSchema = z.enum(["Draft", "Active", "Off"]);
export type PolicyState = z.infer<typeof policyStateSchema>;

export const policyActionSchema = z.enum(["AuditOnly", "WarnJustify", "BlockWithOverride", "Block"]);
export type PolicyAction = z.infer<typeof policyActionSchema>;

export const policyChannelIdSchema = z.enum([
  "USB",
  "Clipboard",
  "BrowserUpload",
  "CloudSync",
  "ThickApps",
  "Printing",
  "CodeGit",
  "NetworkShare",
  "AIAgent",
  "Other",
]);
export type PolicyChannelId = z.infer<typeof policyChannelIdSchema>;

/** One policy's authored intent. Most fields are optional in a partial draft. */
export const intentSchema = z.object({
  what: z
    .object({
      mode: z.enum(["specific", "any"]).optional(),
      definitionIds: z.array(z.string()).optional(),
    })
    .optional(),
  who: z
    .object({
      includeGroups: z.array(z.string()).optional(),
      excludeGroups: z.array(z.string()).optional(),
      includeDevices: z.array(z.string()).optional(),
    })
    .optional(),
  channels: z
    .record(
      z.string(),
      z.object({ on: z.boolean().optional(), collectionId: z.string().optional() }),
    )
    .optional(),
  response: z
    .object({
      action: policyActionSchema.optional(),
      onUnknown: policyActionSchema.optional(),
      dialogTitle: z.string().optional(),
      dialogMessage: z.string().optional(),
    })
    .optional(),
  priority: z.number().int().optional(),
  note: z.string().optional(),
});
export type Intent = z.infer<typeof intentSchema>;

export const policySchema = z.object({
  id: z.string(),
  tenantId: z.string().optional(),
  name: z.string(),
  state: policyStateSchema,
  intent: intentSchema.optional(),
  headVersion: z.number().int().optional(),
  draft: intentSchema.optional(),
  draftState: policyStateSchema.optional(),
  draftSourceVersion: z.number().int().optional(),
  draftComplete: z.boolean().optional(),
  etag: z.string().optional(),
  createdBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedBy: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Policy = z.infer<typeof policySchema>;

export const policyVersionSchema = z.object({
  version: z.number().int(),
  intent: intentSchema.optional(),
  state: policyStateSchema.optional(),
  actor: z.string().optional(),
  at: z.string().optional(),
  restoredFromPolicyVersion: z.number().int().optional(),
  pinnedDefinitions: z
    .array(z.object({ id: z.string(), version: z.number().int() }))
    .optional(),
});
export type PolicyVersion = z.infer<typeof policyVersionSchema>;

/** A 409 on the draft routes, with a machine-readable `code`. */
export const draftConflictSchema = z.object({
  error: z.string().optional(),
  code: z.enum(["draft_exists", "draft_stale"]).optional(),
});

export const listPoliciesResponseSchema = z.object({ policies: z.array(policySchema) });
export const listPolicyVersionsResponseSchema = z.object({ versions: z.array(policyVersionSchema) });
export const policyChannelsResponseSchema = z.object({
  authorable: z.array(policyChannelIdSchema),
  all: z.array(policyChannelIdSchema),
  note: z.string().optional(),
});

/**
 * The Policy list row's display shape (the UI's own vocabulary, not the
 * gateway's). This is the fixture boundary for `data.ts`'s Figma-sourced list
 * rows (15; see data.ts); `labels.ts` derives its `PolicyListItem` type from
 * this schema so the fixture data and the UI cannot drift apart.
 */
export const policyListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** The UI's lifecycle vocabulary. The gateway's `Active` maps to `enforced`. */
  lifecycle: z.enum(["enforced", "draft", "off"]),
  /** Enforcement mode label for an active policy; null (rendered "—") otherwise. */
  enforcementMode: z.string().nullable(),
  /** Deployment health, as drawn in the Figma list capture (398:16105). */
  health: z.enum(["Healthy", "Degraded", "Approval pending", "Stale", "Not deployed"]),
  owner: z.string(),
  lastChange: z.string(),
});
