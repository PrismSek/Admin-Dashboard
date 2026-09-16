import type { PolicyAuthoringValues } from "@/features/policies/schemas";

/**
 * The blank starting state for a brand-new policy in the seven-step builder.
 *
 * Every field an admin fills in starts empty — the form no longer opens
 * pre-seeded with a worked "Create policy" example. Free-text boxes start `""`
 * (the "Policy name" box shows `policyBuilderContent.start.namePlaceholder` as
 * its hint), and the catalog-backed pickers — audience, channel, class, target
 * — start unselected (`""` / `[]`), each showing its own "Select …"
 * placeholder. The end-user notification starts off so its title/message stay
 * empty and disabled.
 *
 * `channel: ""` is the unselected "Select channel" state: no channel editor
 * renders in the Data step until the admin picks one (`PolicyDataStep` and the
 * serializer both handle `""`), and only the selected channel's target is
 * required on submit (`policyAuthoringSchema`'s `superRefine`).
 *
 * The three remaining single-choice controls have no placeholder state in the
 * design, so they keep a neutral, least-committal default rather than an
 * example value:
 *   - `content.mode: "specific"` with a single empty condition row — the
 *     "Matches conditions" tab, waiting for the admin to pick a finding or tag
 *     (or switch to "Any content").
 *   - `enforcement.action: "AuditOnly"` — the least-restrictive action, first
 *     in the catalog. `onUnknown: ""` starts *unanswered* (the required
 *     "Choose one…" state), and `exception: "none"` is the no-escape default.
 *   - `notification.channel` / `remediation: "none"` — no one is told
 *     automatically and nothing runs on its own (the "off" default; both are
 *     always-valid catalog ids).
 *   - `deployAs: "Draft"` — a new policy is a draft until deployed.
 *
 * Validation still fires on submit for the empty required fields (`name`,
 * `appliesTo`, `channel`, the selected channel's target, and the enforcement
 * `onUnknown` fallback — plus `reasonCode` / `message` once the action is
 * anything other than "Audit only").
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
    allOf: [{ findingType: "", minimumConfidence: "High" }],
  },
  clipboard: { targetOp: "one-of", targetIds: [], firesWhen: "text" },
  removableMedia: {
    deviceClass: "personal-or-unrecognised",
    registrationOp: "one-of",
    registrationIds: [],
    transfer: "copy",
    exceptionIds: [],
  },
  print: { target: "unknown", exceptionIds: [] },
  desktopApps: { appOp: "one-of", applicationIds: [], firesWhen: "file-sent", exceptionIds: [] },
  enforcement: {
    action: "AuditOnly",
    onUnknown: "",
    exception: "none",
    reasonCode: "",
    message: "",
  },
  notification: {
    channel: "none",
    remediation: "none",
  },
  deployAs: "Draft",
};
