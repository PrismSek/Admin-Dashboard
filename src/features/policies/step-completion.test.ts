import { describe, expect, it } from "vitest";

import { defaultPolicyAuthoringValues } from "@/features/policies/authoring-defaults";
import { computeStepCompletion } from "@/features/policies/step-completion";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";

/** A blank policy with the given top-level fields overridden. */
function policy(overrides: Partial<PolicyAuthoringValues>): PolicyAuthoringValues {
  return { ...defaultPolicyAuthoringValues, ...overrides };
}

describe("computeStepCompletion", () => {
  it("marks a blank policy incomplete except the steps that have no required fields", () => {
    const status = computeStepCompletion(defaultPolicyAuthoringValues);
    expect(status).toEqual({
      start: false,
      who: false,
      where: false,
      data: false,
      enforcement: false,
      // Notification and Finish carry no required fields (their defaults are
      // always valid), so they read done from the start.
      notification: true,
      finish: true,
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

  it("keeps Data incomplete until a channel is chosen and its conditions are answered", () => {
    // Channel chosen but the default 'specific' conditions have no filled row.
    expect(computeStepCompletion(policy({ channel: "clipboard" })).data).toBe(false);

    // Switching to 'any content' satisfies the conditions requirement.
    const anyContent = policy({ channel: "clipboard", content: { mode: "any", allOf: [] } });
    expect(computeStepCompletion(anyContent).data).toBe(true);

    // A filled condition row also satisfies it.
    const withFinding = policy({
      channel: "clipboard",
      content: { mode: "specific", allOf: [{ findingType: "aadhaar-number", minimumConfidence: "High" }] },
    });
    expect(computeStepCompletion(withFinding).data).toBe(true);
  });

  it("requires at least one app for the desktop-apps channel's Data step", () => {
    const noApps = policy({
      channel: "desktop-apps",
      content: { mode: "any", allOf: [] },
      desktopApps: { appOp: "one-of", applicationIds: [], firesWhen: "file-sent", exceptionIds: [] },
    });
    expect(computeStepCompletion(noApps).data).toBe(false);

    const withApp = policy({
      channel: "desktop-apps",
      content: { mode: "any", allOf: [] },
      desktopApps: { appOp: "one-of", applicationIds: ["whatsapp"], firesWhen: "file-sent", exceptionIds: [] },
    });
    expect(computeStepCompletion(withApp).data).toBe(true);
  });

  it("completes Enforcement once the onUnknown fallback is answered under a non-interrupting action", () => {
    const audit = policy({
      enforcement: { action: "AuditOnly", onUnknown: "AuditOnly", exception: "none", reasonCode: "", message: "" },
    });
    expect(computeStepCompletion(audit).enforcement).toBe(true);
  });

  it("also requires the message block for Enforcement when the action interrupts the person", () => {
    const blockNoMessage = policy({
      enforcement: { action: "Block", onUnknown: "Block", exception: "none", reasonCode: "", message: "" },
    });
    expect(computeStepCompletion(blockNoMessage).enforcement).toBe(false);

    const blockWithMessage = policy({
      enforcement: {
        action: "Block",
        onUnknown: "Block",
        exception: "none",
        reasonCode: "DLP-PII",
        message: "Blocked to protect customer data.",
      },
    });
    expect(computeStepCompletion(blockWithMessage).enforcement).toBe(true);
  });
});
