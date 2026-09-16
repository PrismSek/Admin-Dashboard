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

/**
 * The builder's "If we can't tell" fallback action, which — matching the
 * artifact — starts *unanswered* (`""`, the "Choose one…" state) and must be
 * answered before submit. Its requiredness is enforced in
 * `policyAuthoringSchema`'s `superRefine`, not here, so a blank draft still
 * validates structurally. `""` is the only non-`PolicyAction` member; the
 * serializer only ever sees a validated (answered) value.
 */
export const authoringActionSchema = z.union([policyActionSchema, z.literal("")]);
export type AuthoringAction = z.infer<typeof authoringActionSchema>;

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
/**
 * Deployment health, as drawn in the Figma list capture (398:16105). The
 * admin-policy gateway carries no deployment telemetry, so a live-API row has
 * no health value — see `policyListItemSchema.health`, which is nullable.
 */
export const healthValueSchema = z.enum([
  "Healthy",
  "Degraded",
  "Approval pending",
  "Stale",
  "Not deployed",
]);

export const policyListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** The UI's lifecycle vocabulary. The gateway's `Active` maps to `enforced`. */
  lifecycle: z.enum(["enforced", "draft", "off"]),
  /** Enforcement mode label for an active policy; null (rendered "—") otherwise. */
  enforcementMode: z.string().nullable(),
  /** Deployment health. `null` (rendered "—") for a live-API row, since the
   * gateway carries no deployment telemetry (`GET /v1/policies`'s `Policy` has
   * no health field). The Figma fixture rows still carry a real value. */
  health: healthValueSchema.nullable(),
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

/**
 * The builder's `channel` field, which starts *unselected* on a brand-new
 * policy (the "Select channel" placeholder state — `channel: ""`). A real
 * channel is required to submit, enforced in `policyAuthoringSchema`'s
 * `superRefine` rather than here, so an empty draft validates structurally and
 * the requiredness surfaces as a friendly field error on submit. `""` is the
 * only non-`PolicyChannel` member; the four channel editors and the serializer
 * treat it as "no channel chosen yet".
 */
export const authoringChannelSchema = z.union([policyChannelSchema, z.literal("")]);
export type AuthoringChannel = z.infer<typeof authoringChannelSchema>;

/** The builder's "Deploy as" menu (397:15047/397:15048/397:15406) — identical
 * vocabulary to `policyStateSchema`, kept as its own export because it names
 * a builder *field*, not the gateway lifecycle itself. */
export const deployAsSchema = policyStateSchema;

/**
 * One row of the CONTENT block (the artifact's `Finding │ <name> │ <confidence>`
 * pill). A row names a finding — free text the admin types — plus the
 * `minimumConfidence` it must hit. Both are plain strings; an empty
 * `findingType` means "not filled in yet", and the "at least one real
 * condition" rule lives in `superRefine`.
 */
export const conditionRowSchema = z.object({
  findingType: z.string(),
  minimumConfidence: z.string(),
});
export type ConditionRow = z.infer<typeof conditionRowSchema>;

/** Whether a condition row carries a real pick (so empty placeholder rows can
 * be dropped before serializing / counting / reading-as). */
export function isConditionRowFilled(row: ConditionRow): boolean {
  return row.findingType.trim() !== "";
}

/**
 * Clipboard channel's "PASTE TARGET" section, catalogued by `pasteTargets` in
 * `data.ts`. The admin names where a paste may land (`Paste into`) and what
 * kind of paste fires the rule (`Fires when`).
 *
 * All three are plain strings/arrays with neutral defaults ("any target" =
 * empty `targetIds`, `firesWhen: "text"`), so an unedited draft — clipboard
 * selected or not — always validates: matching wherever a paste lands is a
 * valid policy, so there is no required field here (unlike the other channels'
 * "target" gate in `superRefine`).
 */
export const clipboardRuleSchema = z.object({
  /** The "Paste into" match operator — "one-of" (only these targets) or
   * "not-one-of" (everywhere except them). Only meaningful once `targetIds` is
   * non-empty. */
  targetOp: z.string(),
  targetIds: z.array(z.string()),
  /** What kind of paste fires the rule — "text" / "file-or-image" / "anything". */
  firesWhen: z.string(),
});
export type ClipboardRule = z.infer<typeof clipboardRuleSchema>;

/**
 * Removable media channel's "DEVICE" section (Figma `563:3248`): the device
 * class (`Device is`), the registration match (`Registered as` — an operator +
 * a multi-select over `removableTargets`), and the transfer direction
 * (`Transfer is`). Like clipboard, every field has a neutral default and none
 * is required — "any list" (empty `registrationIds`) matches on device class
 * alone — so there is no `superRefine` gate. `exceptionIds` is the enforcement
 * escape hatch (its editor now lives in the Enforcement step).
 */
export const removableMediaRuleSchema = z.object({
  deviceClass: z.string(),
  registrationOp: z.string(),
  registrationIds: z.array(z.string()),
  transfer: z.string(),
  exceptionIds: z.array(z.string()),
});
export type RemovableMediaRule = z.infer<typeof removableMediaRuleSchema>;

/** Print channel's "Printer is" field (563:7670), catalogued by
 * `printerTargets` in `data.ts`. `target` always carries a value (it defaults to
 * "Unknown"), so — like clipboard's paste target — matching any queue is a valid
 * policy and it needs no `superRefine` gate. */
export const printRuleSchema = z.object({
  target: z.string(),
  exceptionIds: z.array(z.string()),
});
export type PrintRule = z.infer<typeof printRuleSchema>;

/** Desktop apps channel's APP block (563:9286): "App is" — a match operator
 * (`appOp`, "one of" / "not one of") over an app multi-select (`applicationIds`,
 * catalogued by `applications` in `data.ts`) — and "Fires when" (`firesWhen`).
 * At least one app is required — see the `superRefine` on
 * `policyAuthoringSchema` below. `exceptionIds` is the vestigial escape hatch
 * (edited in the Enforcement step now), kept so the serialized shape stays
 * stable across the three escape-hatch channels. */
export const desktopAppRuleSchema = z.object({
  appOp: z.string(),
  applicationIds: z.array(z.string()),
  firesWhen: z.string(),
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
   * `audiences`). Starts unselected (`""`, the "Select audience" placeholder);
   * required on submit via `.min(1)` — the Who step is always visible, so the
   * error attaches to a control the admin can see (unlike the hidden channel
   * targets, which are gated in `superRefine`). */
  appliesTo: z.string().min(1),
  /** "Channel" (Where step) — exactly one channel per policy, starting
   * unselected (`""`). Required on submit via `superRefine`, not here. */
  channel: authoringChannelSchema,
  /** "Conditions" (Data step) — "Matches conditions" vs. "Any content", plus the
   * `allOf` group of condition rows (every row must match). Each row names a
   * finding. */
  content: z.object({
    mode: z.enum(["specific", "any"]),
    allOf: z.array(conditionRowSchema),
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
  /**
   * Enforcement & Message step, matching the artifact's card:
   *   - `action` — what happens on a match (the four-value action catalog).
   *   - `onUnknown` — the required "If we can't tell" fallback, starting
   *     unanswered (`""`); required on submit via `superRefine`.
   *   - `exception` — the "Let it through if" escape hatch. A catalog id
   *     (`"none"` by default); only meaningful for the channels that draw one
   *     (removable media / print / desktop apps) and only when `action` isn't
   *     `AuditOnly`. Stored as a plain string; validity is a display concern,
   *     not a schema one.
   *   - `reasonCode` / `message` — the MESSAGE block, shown and required only
   *     when `action` isn't `AuditOnly` (Audit only shows nothing to the
   *     person). Gated in `superRefine`, so they can stay empty under
   *     `AuditOnly`.
   */
  enforcement: z.object({
    action: policyActionSchema,
    onUnknown: authoringActionSchema,
    exception: z.string(),
    reasonCode: z.string().max(64),
    message: z.string().max(500),
  }),
  /**
   * End-user Notification step. Matches the artifact's design: a delivery
   * `channel` ("Tell the team via" — none / slack / teams / email / endpoint)
   * and one automated `remediation` ("When issue is detected" — none /
   * engage-assignee / remove-public-link / apply-label). Both are catalog ids
   * (see `notificationChannels` / `remediations` in `content.ts`); a fresh
   * policy starts at "none" / "none" (no one told, nothing automated), which is
   * always valid, so no `superRefine` gate is needed.
   */
  notification: z.object({
    channel: z.string(),
    remediation: z.string(),
  }),
  /** Finish step's "Deploy as:" menu. */
  deployAs: deployAsSchema,
});

export const policyAuthoringSchema = policyAuthoringBaseSchema.superRefine((values, ctx) => {
  // A channel must be chosen before any channel-scoped rule below can apply.
  if (values.channel === "") {
    ctx.addIssue({ code: "custom", path: ["channel"], message: "Select a channel." });
  }

  // The CONTENT block lives inside each channel's Data editor, so its
  // conditions-required rule only applies once a channel is on screen. At least
  // one filled row in the required `allOf` group (a named finding).
  if (
    values.channel !== "" &&
    values.content.mode === "specific" &&
    !values.content.allOf.some(isConditionRowFilled)
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["content", "allOf"],
      message: "Add at least one condition, or switch to Any content.",
    });
  }

  // Each channel requires only its own destination/target. The other three
  // channels' rule objects stay blank in the form (the admin never sees them),
  // so requiring them would block a submit on invisible fields. Clipboard and
  // print have no required target — the paste-target and printer selects always
  // carry a value (clipboard's "any target", print's "Unknown"), so any queue is
  // a valid policy and neither needs a gate here. Desktop apps is the exception:
  // its app picker starts empty and must name at least one app.
  if (values.channel === "desktop-apps" && values.desktopApps.applicationIds.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["desktopApps", "applicationIds"],
      message: "Choose at least one app.",
    });
  }

  // "If we can't tell" is mandatory — left unset the engine would silently
  // audit, so the admin must say it on purpose (the artifact's Required badge
  // and disabled Create button).
  if (values.enforcement.onUnknown === "") {
    ctx.addIssue({
      code: "custom",
      path: ["enforcement", "onUnknown"],
      message: "Choose what happens when we can't tell.",
    });
  }

  // The MESSAGE block (reason code + what the person sees) exists whenever the
  // person is interrupted — by the action, OR by the "if we can't tell" fallback
  // when it warns/blocks — since either shows them a message. "Audit only" shows
  // nothing. Kept in lockstep with the component's visibility so a shown field
  // is always required and a hidden one never is.
  const onUnknownInterrupts =
    values.enforcement.onUnknown !== "" && values.enforcement.onUnknown !== "AuditOnly";
  if (values.enforcement.action !== "AuditOnly" || onUnknownInterrupts) {
    if (values.enforcement.reasonCode.trim().length === 0) {
      ctx.addIssue({ code: "custom", path: ["enforcement", "reasonCode"], message: "Add a reason code." });
    }
    if (values.enforcement.message.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["enforcement", "message"],
        message: "Add the message the end user sees.",
      });
    }
  }
});

export type PolicyAuthoringValues = z.infer<typeof policyAuthoringSchema>;
