import { describe, expect, it } from "vitest";

import { composeNotificationReadsAs, composeReadsAs, type ReadsAsCondition, type ReadsAsInput } from "@/features/policies/reads-as";
import type { PolicyCatalogs } from "@/features/policies/types";

const CATALOGS: PolicyCatalogs = {
  audiences: [],
  channels: [
    { value: "clipboard", label: "Clipboard", icon: "clipboard" },
    { value: "print", label: "Print", icon: "print" },
  ],
  findings: [
    { value: "aadhaar-number", label: "Aadhaar number" },
    { value: "customer-record", label: "Customer record" },
  ],
  confidences: [
    { value: "High", label: "High confidence" },
    { value: "Medium", label: "Medium or better" },
  ],
  pasteTargets: [{ value: "messengers", label: "Messengers", category: "apps" }],
  removableTargets: [],
  printerTargets: [{ value: "unknown", label: "Unknown" }],
  applications: [],
  actions: [],
  deployStates: [],
};

const finding = (findingType: string, minimumConfidence = "High"): ReadsAsCondition => ({
  findingType,
  minimumConfidence,
});

const BASE: ReadsAsInput = {
  channel: "",
  contentMode: "specific",
  allOf: [],
  targetOp: "one-of",
  targetIds: [],
  removableTarget: "",
  printTarget: "",
  applicationIds: [],
  action: "AuditOnly",
  onUnknown: "AuditOnly",
};

describe("composeReadsAs", () => {
  it("states a complete clipboard policy", () => {
    const sentence = composeReadsAs(
      {
        ...BASE,
        channel: "clipboard",
        allOf: [finding("aadhaar-number")],
        targetIds: ["messengers"],
        action: "Block",
        onUnknown: "WarnJustify",
      },
      CATALOGS,
    );
    expect(sentence).toBe(
      "When content containing Aadhaar number leaves through the clipboard channel to messengers, block it. If we can't tell, warn the user and require justification.",
    );
  });

  it("degrades gracefully to fallbacks on a blank form", () => {
    expect(composeReadsAs(BASE, CATALOGS)).toBe(
      "When matching content leaves through a channel to its destination, audit it. If we can't tell, audit it.",
    );
  });

  it("says 'any content' when the mode is any", () => {
    const sentence = composeReadsAs({ ...BASE, contentMode: "any", channel: "print", printTarget: "unknown" }, CATALOGS);
    expect(sentence).toBe(
      "When any content leaves through the print channel to unknown printers, audit it. If we can't tell, audit it.",
    );
  });

  it("reads 'not decided yet' when the fallback is unanswered", () => {
    const sentence = composeReadsAs({ ...BASE, channel: "print", printTarget: "unknown", onUnknown: "" }, CATALOGS);
    expect(sentence).toContain("If we can't tell, not decided yet.");
  });

  it("joins the required allOf conditions with 'and'", () => {
    const sentence = composeReadsAs(
      { ...BASE, channel: "clipboard", allOf: [finding("aadhaar-number"), finding("customer-record")] },
      CATALOGS,
    );
    expect(sentence).toContain("content containing Aadhaar number and Customer record");
  });

  it("adds a confidence suffix below High", () => {
    expect(composeReadsAs({ ...BASE, channel: "clipboard", allOf: [finding("customer-record", "Medium")] }, CATALOGS)).toContain(
      "content containing Customer record (medium+)",
    );
  });
});

describe("composeNotificationReadsAs", () => {
  it("states that nothing runs automatically when the remediation is none", () => {
    expect(composeNotificationReadsAs({ remediation: "none", channel: "slack", reasonCode: "DLP-X" })).toBe(
      "No automated remediation runs; the issue is recorded and left for a person to pick up.",
    );
  });

  it("names the delivery channel and reason code when engaging the assignee", () => {
    expect(composeNotificationReadsAs({ remediation: "engage-assignee", channel: "slack", reasonCode: "DLP-MEDIA-EGRESS" })).toBe(
      "The person behind the issue is contacted over Slack, quoting DLP-MEDIA-EGRESS.",
    );
  });

  it("drops the reason-code clause when no reason code is set yet", () => {
    expect(composeNotificationReadsAs({ remediation: "engage-assignee", channel: "endpoint", reasonCode: "" })).toBe(
      "The person behind the issue is contacted over the endpoint agent.",
    );
  });

  it("describes remove-public-link and apply-label without a channel", () => {
    expect(composeNotificationReadsAs({ remediation: "remove-public-link", channel: "none", reasonCode: "" })).toBe(
      "Public links on the related resources are revoked automatically, and the owner is told.",
    );
    expect(composeNotificationReadsAs({ remediation: "apply-label", channel: "none", reasonCode: "" })).toBe(
      "A sensitivity label is applied to the related resources automatically.",
    );
  });
});
