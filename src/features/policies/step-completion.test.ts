import { describe, expect, it } from "vitest";

import { defaultPolicyAuthoringValues } from "@/features/policies/authoring-defaults";
import { computeStepCompletion } from "@/features/policies/step-completion";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";

/** A blank policy with the given top-level fields overridden. */
function policy(overrides: Partial<PolicyAuthoringValues>): PolicyAuthoringValues {
  return { ...defaultPolicyAuthoringValues, ...overrides };
}

const ANY_CONTENT: PolicyAuthoringValues["content"] = { mode: "any", allOf: [] };
const CLIPBOARD_ANSWERED: PolicyAuthoringValues["clipboard"] = { targetOp: "one-of", targetIds: [], firesWhen: "text" };

describe("computeStepCompletion", () => {
  it("marks every step of a blank policy incomplete — nothing is pre-selected", () => {
    expect(computeStepCompletion(defaultPolicyAuthoringValues)).toEqual({
      start: false,
      who: false,
      where: false,
      data: false,
      enforcement: false,
      notification: false,
      finish: false,
    });
  });

  it("completes Start once the policy has a name (description stays optional)", () => {
    expect(computeStepCompletion(policy({ name: "Block Aadhaar" })).start).toBe(true);
    expect(computeStepCompletion(policy({ name: "   " })).start).toBe(false);
  });

  it("completes Who once an audience is chosen", () => {
    expect(computeStepCompletion(policy({ appliesTo: "finance-all-stuff" })).who).toBe(true);
  });

  it("completes Where once a channel is chosen", () => {
    expect(computeStepCompletion(policy({ channel: "clipboard" })).where).toBe(true);
  });

  it("keeps Data incomplete until the channel's own dropdowns and the conditions are answered", () => {
    // Channel chosen and its dropdowns answered, but the default 'specific'
    // conditions have no filled row yet.
    expect(computeStepCompletion(policy({ channel: "clipboard", clipboard: CLIPBOARD_ANSWERED })).data).toBe(false);

    // 'Any content' satisfies the conditions requirement…
    expect(
      computeStepCompletion(policy({ channel: "clipboard", clipboard: CLIPBOARD_ANSWERED, content: ANY_CONTENT })).data,
    ).toBe(true);

    // …but a blank 'Fires when' still holds the step back.
    expect(
      computeStepCompletion(
        policy({ channel: "clipboard", clipboard: { ...CLIPBOARD_ANSWERED, firesWhen: "" }, content: ANY_CONTENT }),
      ).data,
    ).toBe(false);
  });

  it("requires a confidence on a picked finding before Data completes", () => {
    const withFinding = (minimumConfidence: string) =>
      policy({
        channel: "clipboard",
        clipboard: CLIPBOARD_ANSWERED,
        content: { mode: "specific", allOf: [{ findingType: "aadhaar-number", minimumConfidence }] },
      });
    expect(computeStepCompletion(withFinding("")).data).toBe(false);
    expect(computeStepCompletion(withFinding("High")).data).toBe(true);
  });

  it("requires at least one app for the desktop-apps channel's Data step", () => {
    const desktop = { appOp: "one-of", firesWhen: "file-sent", exceptionIds: [] };
    expect(
      computeStepCompletion(
        policy({ channel: "desktop-apps", content: ANY_CONTENT, desktopApps: { ...desktop, applicationIds: [] } }),
      ).data,
    ).toBe(false);
    expect(
      computeStepCompletion(
        policy({ channel: "desktop-apps", content: ANY_CONTENT, desktopApps: { ...desktop, applicationIds: ["whatsapp"] } }),
      ).data,
    ).toBe(true);
  });

  it("completes Enforcement once both the action and the fallback are answered under a non-interrupting action", () => {
    const audit = policy({
      enforcement: { action: "AuditOnly", onUnknown: "AuditOnly", exception: "", reasonCode: "", message: "" },
    });
    expect(computeStepCompletion(audit).enforcement).toBe(true);

    // The action itself is required — answering the fallback alone isn't enough.
    const noAction = policy({
      enforcement: { action: "", onUnknown: "AuditOnly", exception: "", reasonCode: "", message: "" },
    });
    expect(computeStepCompletion(noAction).enforcement).toBe(false);
  });

  it("also requires the message block and the exception choice when the action interrupts", () => {
    const blocking = (patch: Partial<PolicyAuthoringValues["enforcement"]>) =>
      policy({
        channel: "clipboard",
        enforcement: {
          action: "Block",
          onUnknown: "Block",
          exception: "none",
          reasonCode: "DLP-PII",
          message: "Blocked to protect customer data.",
          ...patch,
        },
      });
    expect(computeStepCompletion(blocking({})).enforcement).toBe(true);
    expect(computeStepCompletion(blocking({ reasonCode: "", message: "" })).enforcement).toBe(false);
    expect(computeStepCompletion(blocking({ exception: "" })).enforcement).toBe(false);
  });

  it("completes Notification only once both the channel and the remediation are chosen", () => {
    expect(computeStepCompletion(policy({ notification: { channel: "none", remediation: "" } })).notification).toBe(false);
    expect(computeStepCompletion(policy({ notification: { channel: "", remediation: "none" } })).notification).toBe(false);
    expect(computeStepCompletion(policy({ notification: { channel: "none", remediation: "none" } })).notification).toBe(true);
  });

  it("completes Finish once a deploy state is chosen", () => {
    expect(computeStepCompletion(policy({ deployAs: "Draft" })).finish).toBe(true);
  });
});
