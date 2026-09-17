import { policyBuilderSteps } from "@/features/policies/content";
import { isConditionRowFilled, type PolicyAuthoringValues } from "@/features/policies/schemas";

/** The rail's seven stage ids (`start` … `finish`), sourced from the one step
 * list so the rail, the section anchors (`#policy-<id>`) and this map stay in
 * lockstep. */
export type PolicyStepId = (typeof policyBuilderSteps)[number]["id"];

/** Whether the chosen action interrupts the person — anything but "Audit only".
 * An unanswered action (`""`) doesn't interrupt anything yet. */
function actionInterrupts(values: PolicyAuthoringValues): boolean {
  return values.enforcement.action !== "" && values.enforcement.action !== "AuditOnly";
}

/**
 * Whether the enforcement choice interrupts the person — the action itself
 * does, OR the "If we can't tell" fallback warns/blocks. That is exactly when
 * the MESSAGE block (reason code + what they see) becomes required. Mirrors
 * `policyAuthoringSchema`'s superRefine.
 */
function enforcementInterrupts(values: PolicyAuthoringValues): boolean {
  const onUnknownInterrupts =
    values.enforcement.onUnknown !== "" && values.enforcement.onUnknown !== "AuditOnly";
  return actionInterrupts(values) || onUnknownInterrupts;
}

/** Whether the selected channel's own dropdowns (and, for desktop apps, its
 * required app list) are all answered. No channel → nothing to answer yet. */
function channelChoicesAnswered(values: PolicyAuthoringValues): boolean {
  switch (values.channel) {
    case "clipboard":
      return values.clipboard.targetOp !== "" && values.clipboard.firesWhen !== "";
    case "removable-media":
      return (
        values.removableMedia.deviceClass !== "" &&
        values.removableMedia.registrationOp !== "" &&
        values.removableMedia.transfer !== ""
      );
    case "print":
      return values.print.target !== "";
    case "desktop-apps":
      return (
        values.desktopApps.appOp !== "" &&
        values.desktopApps.applicationIds.length > 0 &&
        values.desktopApps.firesWhen !== ""
      );
    case "":
      return false;
  }
}

/**
 * Per-step completeness for the orientation rail: a stage reads "done"
 * (coloured, vs. greyed) once its own required fields are answered. Nothing in
 * the builder is pre-selected, so every stage starts greyed. The rules are
 * split out of `policyAuthoringSchema` — the form's boundary parser — by which
 * stage owns each field, so the rail can light a stage up the moment the admin
 * finishes it rather than only at submit:
 *   - Start   → a policy name (description is optional).
 *   - Who     → an audience.
 *   - Where   → a channel.
 *   - Data    → that channel's own dropdowns (plus at least one app for desktop
 *               apps), and its CONTENT answered — "Any content", or at least one
 *               picked finding with each picked finding's confidence chosen.
 *   - Enforce → the action and the required "If we can't tell" fallback, the
 *               escape hatch once the action interrupts, and the message block
 *               whenever the action (or that fallback) interrupts.
 *   - Notification → a delivery channel and a remediation.
 *   - Finish  → a deploy state.
 */
export function computeStepCompletion(values: PolicyAuthoringValues): Record<PolicyStepId, boolean> {
  const where = values.channel !== "";

  const rows = values.content.allOf;
  const conditionsAnswered =
    values.content.mode === "any" ||
    (rows.some(isConditionRowFilled) &&
      rows.every((row) => !isConditionRowFilled(row) || row.minimumConfidence !== ""));

  const messageAnswered =
    !enforcementInterrupts(values) ||
    (values.enforcement.reasonCode.trim().length > 0 && values.enforcement.message.trim().length > 0);
  // The escape hatch is drawn (and so required) only once a real channel is
  // chosen and the action interrupts.
  const exceptionAnswered = !(where && actionInterrupts(values)) || values.enforcement.exception !== "";

  return {
    start: values.name.trim().length > 0,
    who: values.appliesTo.trim().length > 0,
    where,
    data: where && conditionsAnswered && channelChoicesAnswered(values),
    enforcement:
      values.enforcement.action !== "" &&
      values.enforcement.onUnknown !== "" &&
      messageAnswered &&
      exceptionAnswered,
    notification: values.notification.channel !== "" && values.notification.remediation !== "",
    finish: values.deployAs !== "",
  };
}
