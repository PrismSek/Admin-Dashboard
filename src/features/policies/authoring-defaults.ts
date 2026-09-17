import type { PolicyAuthoringValues } from "@/features/policies/schemas";

/**
 * The blank starting state for a brand-new policy in the seven-step builder.
 *
 * Nothing is pre-selected. Every free-text box starts `""` (the "Policy name"
 * box shows `policyBuilderContent.start.namePlaceholder` as its hint), every
 * single-choice dropdown and radio starts unanswered (`""`, drawn as the
 * "Choose one…" / "Select …" placeholder), and every multi-select starts empty
 * (`[]`). The step rail greys each stage until its choices are made, and Create
 * stays disabled until the whole form validates (`policyAuthoringSchema`).
 *
 * `channel: ""` is the unselected "Select channel" state: no channel editor
 * renders in the Data step until the admin picks one (`PolicyDataStep` and the
 * serializer both handle `""`), and only the selected channel's own dropdowns
 * are required on submit (`policyAuthoringSchema`'s `superRefine`).
 *
 * The two exceptions, which are modes rather than choices:
 *   - `content.mode: "specific"` — the "Matches conditions" tab is active (one
 *     side of the toggle is always on); the single finding row inside it is
 *     still empty (no finding, no confidence).
 *   - The multi-selects (`clipboard.targetIds`, `removableMedia.registrationIds`)
 *     — an empty list means "any", a valid policy, so they are never required.
 *     `desktopApps.applicationIds` is the exception and must name at least one
 *     app.
 *
 * Validation fires on submit for every unanswered required field (see the
 * `superRefine` on `policyAuthoringSchema`).
 */
export const defaultPolicyAuthoringValues: PolicyAuthoringValues = {
  name: "",
  description: "",
  appliesTo: "",
  channel: "",
  content: {
    mode: "specific",
    // One empty finding row so the CONTENT block always shows a ready-to-fill
    // pill (the group is never empty).
    allOf: [{ findingType: "", minimumConfidence: "" }],
  },
  clipboard: { targetOp: "", targetIds: [], firesWhen: "" },
  removableMedia: {
    deviceClass: "",
    registrationOp: "",
    registrationIds: [],
    transfer: "",
    exceptionIds: [],
  },
  print: { target: "", exceptionIds: [] },
  desktopApps: { appOp: "", applicationIds: [], firesWhen: "", exceptionIds: [] },
  enforcement: {
    action: "",
    onUnknown: "",
    exception: "",
    reasonCode: "",
    message: "",
  },
  notification: {
    channel: "",
    remediation: "",
  },
  deployAs: "",
};
