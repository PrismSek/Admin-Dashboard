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

/**
 * ---------------------------------------------------------------------------
 * Policy authoring contract (the builder form's own vocabulary).
 *
 * This is a *different* boundary from the gateway contract above: it is what
 * `react-hook-form` validates while an admin is authoring a policy in the
 * seven-step builder (see `content.ts`'s `policyBuilderContent` and the
 * builder Figma frames catalogued in `.superpowers/sdd/figma-nodes.md`).
 * `serialize-policy.ts` turns a validated `PolicyAuthoringValues` into a
 * `PolicyPreview` for the "Finish" step — it never talks to the gateway
 * directly. Reuses `policyStateSchema`/`policyActionSchema` from above rather
 * than redeclaring the lifecycle/action vocabulary.
 * ---------------------------------------------------------------------------
 */

/** The four channels the builder can author against (a different, smaller
 * vocabulary than the gateway's 10-value `policyChannelIdSchema` above —
 * see the channel catalog in `data.ts` and the four builder frames
 * `512:421` / `552:1915` / `563:6608` / `563:8724`). */
export const policyChannelSchema = z.enum(["clipboard", "removable-media", "print", "desktop-apps"]);
export type PolicyChannel = z.infer<typeof policyChannelSchema>;

/** The builder's "Deploy as" menu (397:15047/397:15048/397:15406) — identical
 * vocabulary to `policyStateSchema`, kept as its own export because it names
 * a builder *field*, not the gateway lifecycle itself. */
export const deployAsSchema = policyStateSchema;

/** Clipboard channel's "DESTINATION" section (`Class is` / `Collection is`),
 * catalogued by `destinationClasses` / `collections` in `data.ts`. */
export const clipboardRuleSchema = z.object({
  destinationClass: z.string().min(1),
  collectionIds: z.array(z.string()),
});
export type ClipboardRule = z.infer<typeof clipboardRuleSchema>;

/** Removable media channel's "Registered as" field (563:4823), catalogued by
 * `removableTargets` in `data.ts`. */
export const removableMediaRuleSchema = z.object({
  target: z.string().min(1),
  exceptionIds: z.array(z.string()),
});
export type RemovableMediaRule = z.infer<typeof removableMediaRuleSchema>;

/** Print channel's "Printer is" field (563:7670), catalogued by
 * `printerTargets` in `data.ts`. */
export const printRuleSchema = z.object({
  target: z.string().min(1),
  exceptionIds: z.array(z.string()),
});
export type PrintRule = z.infer<typeof printRuleSchema>;

/** Desktop apps channel's app picker (563:10405), catalogued by
 * `applications` in `data.ts`. At least one app is required — see the
 * `superRefine` on `policyAuthoringSchema` below. */
export const desktopAppRuleSchema = z.object({
  applicationIds: z.array(z.string()),
  exceptionIds: z.array(z.string()),
});
export type DesktopAppRule = z.infer<typeof desktopAppRuleSchema>;

const policyAuthoringBaseSchema = z.object({
  /** "Policy name" (Start step). */
  name: z.string().trim().min(1).max(120),
  /** "Description (optional)" (Start step) — always a string; the Figma
   * "+ Add a description" / "× Remove" affordance toggles visibility in the
   * UI, not the field's presence in the form values. */
  description: z.string().trim().max(500),
  /** "Applies to" (Who step) — an audience catalog id (`data.ts`'s
   * `audiences`). Membership itself is resolved by the backend (see
   * `policyBuilderContent.who.scopeHelp`), so this is just the selected id. */
  appliesTo: z.string().min(1),
  /** "Channel" (Where step) — exactly one channel per policy. */
  channel: policyChannelSchema,
  /** "Conditions" (Data step) — "Matches conditions" vs. "Any content". */
  content: z.object({
    mode: z.enum(["specific", "any"]),
    findingIds: z.array(z.string()),
  }),
  /** All four channel sub-objects are always present, independent of the
   * selected `channel` — the hidden three stay populated with the admin's
   * last edits (`shouldUnregister: false` in the form) so switching channels
   * never loses work. `serializePolicyPreview` is what discards the hidden
   * three, not this schema. */
  clipboard: clipboardRuleSchema,
  removableMedia: removableMediaRuleSchema,
  print: printRuleSchema,
  desktopApps: desktopAppRuleSchema,
  /** Enforcement & Message step. */
  enforcement: z.object({
    action: policyActionSchema,
    onUnknown: policyActionSchema,
    reasonCode: z.string().trim().min(1).max(64),
    message: z.string().trim().min(1).max(500),
  }),
  /** End-user Notification step. */
  notification: z.object({
    enabled: z.boolean(),
    title: z.string().max(120),
    message: z.string().max(500),
  }),
  /** Finish step's "Deploy as:" menu. */
  deployAs: deployAsSchema,
});

export const policyAuthoringSchema = policyAuthoringBaseSchema.superRefine((values, ctx) => {
  if (values.content.mode === "specific" && values.content.findingIds.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["content", "findingIds"],
      message: "Add at least one finding, or switch to Any content.",
    });
  }

  if (values.channel === "desktop-apps" && values.desktopApps.applicationIds.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["desktopApps", "applicationIds"],
      message: "Choose at least one app.",
    });
  }

  if (values.notification.enabled) {
    if (values.notification.title.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["notification", "title"],
        message: "Add a notification title, or turn the notification off.",
      });
    }
    if (values.notification.message.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["notification", "message"],
        message: "Add a notification message, or turn the notification off.",
      });
    }
  }
});

export type PolicyAuthoringValues = z.infer<typeof policyAuthoringSchema>;
