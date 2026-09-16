import { policyBuilderSteps } from "@/features/policies/content";
import { isConditionRowFilled, type PolicyAuthoringValues } from "@/features/policies/schemas";

/** The rail's seven stage ids (`start` … `finish`), sourced from the one step
 * list so the rail, the section anchors (`#policy-<id>`) and this map stay in
 * lockstep. */
export type PolicyStepId = (typeof policyBuilderSteps)[number]["id"];

/**
 * Whether the enforcement choice interrupts the person — the action itself does
 * anything but "Audit only", OR the "If we can't tell" fallback warns/blocks.
 * That is exactly when the MESSAGE block (reason code + what they see) becomes
 * required. Mirrors `policyAuthoringSchema`'s superRefine.
 */
function enforcementInterrupts(values: PolicyAuthoringValues): boolean {
  const onUnknownInterrupts =
    values.enforcement.onUnknown !== "" && values.enforcement.onUnknown !== "AuditOnly";
  return values.enforcement.action !== "AuditOnly" || onUnknownInterrupts;
}

/**
 * Per-step completeness for the orientation rail: a stage reads "done"
 * (coloured, vs. greyed) once its own required fields are satisfied. The rules
 * are split out of `policyAuthoringSchema` — the form's boundary parser — by
 * which stage owns each field, so the rail can light a stage up the moment the
 * admin finishes it rather than only at submit:
 *   - Start   → a policy name (description is optional).
 *   - Who     → an audience.
 *   - Where   → a channel.
 *   - Data    → a channel, its CONTENT answered ("Any content" or a filled
 *               finding), and — for desktop apps only — at least one app.
 *   - Enforce → the required "If we can't tell" fallback, plus the message
 *               block whenever the action (or that fallback) interrupts.
 *   - Notification / Finish carry no required fields (their defaults are always
 *     valid), so they read done from the start.
 */
export function computeStepCompletion(values: PolicyAuthoringValues): Record<PolicyStepId, boolean> {
  const where = values.channel !== "";

  const conditionsAnswered =
    values.content.mode === "any" || values.content.allOf.some(isConditionRowFilled);
  const appTargetAnswered =
    values.channel !== "desktop-apps" || values.desktopApps.applicationIds.length > 0;

  const messageAnswered =
    !enforcementInterrupts(values) ||
    (values.enforcement.reasonCode.trim().length > 0 && values.enforcement.message.trim().length > 0);

  return {
    start: values.name.trim().length > 0,
    who: values.appliesTo.trim().length > 0,
    where,
    data: where && conditionsAnswered && appTargetAnswered,
    enforcement: values.enforcement.onUnknown !== "" && messageAnswered,
    notification: true,
    finish: true,
  };
}
