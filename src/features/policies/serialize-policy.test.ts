import { describe, expect, it } from "vitest";

import { policyAuthoringSchema, type PolicyAuthoringValues, type PolicyChannel } from "@/features/policies/schemas";
import { serializePolicyPreview } from "@/features/policies/serialize-policy";

/**
 * Complete, schema-valid authoring form values with every one of the four
 * channel sub-objects populated (so the tests can flip `channel` and confirm
 * the hidden three retain their values instead of being dropped from the
 * form — only `serializePolicyPreview` drops them, and only from the output).
 */
const ALL_CHANNEL_VALUES: PolicyAuthoringValues = {
  name: "Block Aadhaar to personal cloud",
  description: "Blocks Aadhaar numbers leaving to personal or foreign destinations.",
  appliesTo: "finance-all-stuff",
  channel: "clipboard",
  content: {
    mode: "specific",
    allOf: [{ findingType: "aadhaar-number", minimumConfidence: "High" }],
  },
  clipboard: {
    targetOp: "one-of",
    targetIds: ["messengers"],
    firesWhen: "text",
  },
  removableMedia: {
    deviceClass: "personal-or-unrecognised",
    registrationOp: "one-of",
    registrationIds: ["it-issued-encrypted-usb"],
    transfer: "copy",
    exceptionIds: ["staff-registered-drives"],
  },
  print: { target: "unknown", exceptionIds: ["authorized"] },
  desktopApps: { appOp: "one-of", applicationIds: ["whatsapp", "signal"], firesWhen: "file-sent", exceptionIds: ["slack"] },
  enforcement: {
    action: "Block",
    onUnknown: "WarnJustify",
    exception: "none",
    reasonCode: "DLP-PII-EGRESS",
    message: "Aadhaar information cannot be uploaded to this destination.",
  },
  notification: {
    channel: "slack",
    remediation: "remove-public-link",
  },
  deployAs: "Draft",
};

const VALID_CLIPBOARD_VALUES: PolicyAuthoringValues = ALL_CHANNEL_VALUES;

const EXPECTED_KEYS: Record<PolicyChannel, string[]> = {
  clipboard: ["kind", "targetOp", "targetIds", "firesWhen"],
  "removable-media": ["kind", "deviceClass", "registrationOp", "registrationIds", "transfer", "exceptionIds"],
  print: ["kind", "target", "exceptionIds"],
  "desktop-apps": ["kind", "appOp", "applicationIds", "firesWhen", "exceptionIds"],
};

describe("policyAuthoringSchema", () => {
  it("requires a name and fallback action", () => {
    const result = policyAuthoringSchema.safeParse({
      ...VALID_CLIPBOARD_VALUES,
      name: "",
      enforcement: { ...VALID_CLIPBOARD_VALUES.enforcement, onUnknown: "" },
    });
    expect(result.success).toBe(false);
  });

  it("requires the message fields when the onUnknown fallback interrupts, even under Audit only", () => {
    const result = policyAuthoringSchema.safeParse({
      ...VALID_CLIPBOARD_VALUES,
      enforcement: {
        action: "AuditOnly",
        onUnknown: "Block",
        exception: "none",
        reasonCode: "",
        message: "",
      },
    });
    expect(result.success).toBe(false);
  });

  it("does not require the message fields when both action and onUnknown are Audit only", () => {
    const result = policyAuthoringSchema.safeParse({
      ...VALID_CLIPBOARD_VALUES,
      enforcement: {
        action: "AuditOnly",
        onUnknown: "AuditOnly",
        exception: "none",
        reasonCode: "",
        message: "",
      },
    });
    expect(result.success).toBe(true);
  });

  it("requires the print channel's own 'Printer is' choice", () => {
    const result = policyAuthoringSchema.safeParse({
      ...VALID_CLIPBOARD_VALUES,
      channel: "print",
      print: { target: "", exceptionIds: [] },
    });
    expect(result.success).toBe(false);
  });

  it("never requires a hidden channel's dropdowns", () => {
    // Clipboard is selected, so print's blank target must not block the submit.
    const result = policyAuthoringSchema.safeParse({
      ...VALID_CLIPBOARD_VALUES,
      print: { target: "", exceptionIds: [] },
    });
    expect(result.success).toBe(true);
  });

  it("requires at least one filled condition when content mode is specific", () => {
    const result = policyAuthoringSchema.safeParse({
      ...VALID_CLIPBOARD_VALUES,
      content: { mode: "specific", allOf: [] },
    });
    expect(result.success).toBe(false);
  });

  it("allows zero conditions when content mode is any", () => {
    const result = policyAuthoringSchema.safeParse({
      ...VALID_CLIPBOARD_VALUES,
      content: { mode: "any", allOf: [] },
    });
    expect(result.success).toBe(true);
  });

  it("requires at least one app for Desktop Apps", () => {
    const result = policyAuthoringSchema.safeParse({
      ...VALID_CLIPBOARD_VALUES,
      channel: "desktop-apps",
      desktopApps: { appOp: "one-of", applicationIds: [], firesWhen: "file-sent", exceptionIds: [] },
    });
    expect(result.success).toBe(false);
  });

  it("requires every dropdown the form opens blank: action, deploy state, notification, and the selected channel's own picks", () => {
    const accepts = (patch: Partial<PolicyAuthoringValues>) =>
      policyAuthoringSchema.safeParse({ ...VALID_CLIPBOARD_VALUES, ...patch }).success;

    expect(accepts({ enforcement: { ...VALID_CLIPBOARD_VALUES.enforcement, action: "" } })).toBe(false);
    expect(accepts({ deployAs: "" })).toBe(false);
    expect(accepts({ notification: { channel: "", remediation: "remove-public-link" } })).toBe(false);
    expect(accepts({ notification: { channel: "slack", remediation: "" } })).toBe(false);
    expect(accepts({ clipboard: { ...VALID_CLIPBOARD_VALUES.clipboard, targetOp: "" } })).toBe(false);
    expect(accepts({ clipboard: { ...VALID_CLIPBOARD_VALUES.clipboard, firesWhen: "" } })).toBe(false);

    const removable = VALID_CLIPBOARD_VALUES.removableMedia;
    expect(accepts({ channel: "removable-media", removableMedia: { ...removable, deviceClass: "" } })).toBe(false);
    expect(accepts({ channel: "removable-media", removableMedia: { ...removable, registrationOp: "" } })).toBe(false);
    expect(accepts({ channel: "removable-media", removableMedia: { ...removable, transfer: "" } })).toBe(false);

    const desktop = VALID_CLIPBOARD_VALUES.desktopApps;
    expect(accepts({ channel: "desktop-apps", desktopApps: { ...desktop, appOp: "" } })).toBe(false);
    expect(accepts({ channel: "desktop-apps", desktopApps: { ...desktop, firesWhen: "" } })).toBe(false);
  });

  it("requires a confidence on every finding that has been picked", () => {
    const unanswered = policyAuthoringSchema.safeParse({
      ...VALID_CLIPBOARD_VALUES,
      content: { mode: "specific", allOf: [{ findingType: "aadhaar-number", minimumConfidence: "" }] },
    });
    expect(unanswered.success).toBe(false);

    // An untouched placeholder row (no finding yet) doesn't demand a confidence.
    const placeholderRow = policyAuthoringSchema.safeParse({
      ...VALID_CLIPBOARD_VALUES,
      content: {
        mode: "specific",
        allOf: [
          { findingType: "aadhaar-number", minimumConfidence: "High" },
          { findingType: "", minimumConfidence: "" },
        ],
      },
    });
    expect(placeholderRow.success).toBe(true);
  });

  it("requires the exception choice once the action interrupts, and not before", () => {
    const interrupting = policyAuthoringSchema.safeParse({
      ...VALID_CLIPBOARD_VALUES,
      enforcement: { ...VALID_CLIPBOARD_VALUES.enforcement, action: "Block", exception: "" },
    });
    expect(interrupting.success).toBe(false);

    // Under "Audit only" the escape hatch isn't shown, so it isn't required.
    const auditOnly = policyAuthoringSchema.safeParse({
      ...VALID_CLIPBOARD_VALUES,
      enforcement: { action: "AuditOnly", onUnknown: "AuditOnly", exception: "", reasonCode: "", message: "" },
    });
    expect(auditOnly.success).toBe(true);
  });

  it("treats an unanswered action as not yet interrupting — it asks for the action, not the message", () => {
    const result = policyAuthoringSchema.safeParse({
      ...VALID_CLIPBOARD_VALUES,
      enforcement: { action: "", onUnknown: "AuditOnly", exception: "", reasonCode: "", message: "" },
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    const paths = result.error.issues.map((issue) => issue.path.join("."));
    expect(paths).toContain("enforcement.action");
    expect(paths).not.toContain("enforcement.reasonCode");
    expect(paths).not.toContain("enforcement.message");
  });

  it("accepts the notification channel + remediation shape, including an explicit 'None' choice", () => {
    const off = policyAuthoringSchema.safeParse({
      ...VALID_CLIPBOARD_VALUES,
      notification: { channel: "none", remediation: "none" },
    });
    expect(off.success).toBe(true);

    const engaged = policyAuthoringSchema.safeParse({
      ...VALID_CLIPBOARD_VALUES,
      notification: { channel: "slack", remediation: "engage-assignee" },
    });
    expect(engaged.success).toBe(true);
  });
});

describe("serializePolicyPreview", () => {
  it.each(["clipboard", "removable-media", "print", "desktop-apps"] as const)(
    "serializes only %s fields while retaining form values for every channel",
    (channel) => {
      const values = { ...ALL_CHANNEL_VALUES, channel };
      const preview = serializePolicyPreview(values);
      expect(preview.intent.channel.kind).toBe(channel);
      expect(Object.keys(preview.intent.channel)).toEqual(EXPECTED_KEYS[channel]);

      // The other three channels' values are still present on the *input*
      // (the form never lost them) even though only the selected channel's
      // fields made it into the serialized preview.
      expect(values.clipboard).toEqual(ALL_CHANNEL_VALUES.clipboard);
      expect(values.removableMedia).toEqual(ALL_CHANNEL_VALUES.removableMedia);
      expect(values.print).toEqual(ALL_CHANNEL_VALUES.print);
      expect(values.desktopApps).toEqual(ALL_CHANNEL_VALUES.desktopApps);
    },
  );

  it("serializes the clipboard channel with exactly its own fields", () => {
    const preview = serializePolicyPreview({ ...ALL_CHANNEL_VALUES, channel: "clipboard" });
    expect(preview.intent.channel).toEqual({
      kind: "clipboard",
      targetOp: "one-of",
      targetIds: ["messengers"],
      firesWhen: "text",
    });
  });

  it("serializes the removable-media channel with exactly its own fields", () => {
    const preview = serializePolicyPreview({ ...ALL_CHANNEL_VALUES, channel: "removable-media" });
    expect(preview.intent.channel).toEqual({
      kind: "removable-media",
      deviceClass: "personal-or-unrecognised",
      registrationOp: "one-of",
      registrationIds: ["it-issued-encrypted-usb"],
      transfer: "copy",
      exceptionIds: ["staff-registered-drives"],
    });
  });

  it("serializes the print channel with exactly its own fields", () => {
    const preview = serializePolicyPreview({ ...ALL_CHANNEL_VALUES, channel: "print" });
    expect(preview.intent.channel).toEqual({
      kind: "print",
      target: "unknown",
      exceptionIds: ["authorized"],
    });
  });

  it("serializes the desktop-apps channel with exactly its own fields", () => {
    const preview = serializePolicyPreview({ ...ALL_CHANNEL_VALUES, channel: "desktop-apps" });
    expect(preview.intent.channel).toEqual({
      kind: "desktop-apps",
      appOp: "one-of",
      applicationIds: ["whatsapp", "signal"],
      firesWhen: "file-sent",
      exceptionIds: ["slack"],
    });
  });

  it("maps Draft, Active, and Off exactly", () => {
    expect(serializePolicyPreview({ ...VALID_CLIPBOARD_VALUES, deployAs: "Draft" }).state).toBe("Draft");
    expect(serializePolicyPreview({ ...VALID_CLIPBOARD_VALUES, deployAs: "Active" }).state).toBe("Active");
    expect(serializePolicyPreview({ ...VALID_CLIPBOARD_VALUES, deployAs: "Off" }).state).toBe("Off");
  });

  it("carries name, description, audience, content, response, and notification through", () => {
    const preview = serializePolicyPreview(VALID_CLIPBOARD_VALUES);
    expect(preview.name).toBe(VALID_CLIPBOARD_VALUES.name);
    expect(preview.description).toBe(VALID_CLIPBOARD_VALUES.description);
    expect(preview.intent.who).toEqual({ appliesTo: VALID_CLIPBOARD_VALUES.appliesTo });
    expect(preview.intent.content).toEqual(VALID_CLIPBOARD_VALUES.content);
    expect(preview.intent.response).toEqual(VALID_CLIPBOARD_VALUES.enforcement);
    expect(preview.intent.notification).toEqual(VALID_CLIPBOARD_VALUES.notification);
  });

  it("throws (re-parses and rejects) invalid input rather than serializing it", () => {
    expect(() =>
      serializePolicyPreview({
        ...VALID_CLIPBOARD_VALUES,
        name: "",
      }),
    ).toThrow();
  });
});
