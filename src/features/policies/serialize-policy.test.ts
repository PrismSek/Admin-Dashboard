import { describe, expect, it } from "vitest";

import { policyAuthoringSchema, type PolicyAuthoringValues } from "@/features/policies/schemas";
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
  content: { mode: "specific", findingIds: ["aadhaar-number"] },
  clipboard: { destinationClass: "personal-or-foreign", collectionIds: ["sanctioned-cloud-storage"] },
  removableMedia: { target: "it-issued-encrypted-usb", exceptionIds: ["staff-registered-drives"] },
  print: { target: "unknown", exceptionIds: ["authorized"] },
  desktopApps: { applicationIds: ["whatsapp", "signal"], exceptionIds: ["slack"] },
  enforcement: {
    action: "Block",
    onUnknown: "WarnJustify",
    reasonCode: "DLP-PII-EGRESS",
    message: "Aadhaar information cannot be uploaded to this destination.",
  },
  notification: {
    enabled: true,
    title: "Remove public link",
    message: "Public links on the related resources are revoked automatically, and the owner is told.",
  },
  deployAs: "Draft",
};

const VALID_CLIPBOARD_VALUES: PolicyAuthoringValues = ALL_CHANNEL_VALUES;

const EXPECTED_KEYS: Record<PolicyAuthoringValues["channel"], string[]> = {
  clipboard: ["kind", "destinationClass", "collectionIds"],
  "removable-media": ["kind", "target", "exceptionIds"],
  print: ["kind", "target", "exceptionIds"],
  "desktop-apps": ["kind", "applicationIds", "exceptionIds"],
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

  it("requires at least one finding when content mode is specific", () => {
    const result = policyAuthoringSchema.safeParse({
      ...VALID_CLIPBOARD_VALUES,
      content: { mode: "specific", findingIds: [] },
    });
    expect(result.success).toBe(false);
  });

  it("allows zero findings when content mode is any", () => {
    const result = policyAuthoringSchema.safeParse({
      ...VALID_CLIPBOARD_VALUES,
      content: { mode: "any", findingIds: [] },
    });
    expect(result.success).toBe(true);
  });

  it("requires at least one app for Desktop Apps", () => {
    const result = policyAuthoringSchema.safeParse({
      ...VALID_CLIPBOARD_VALUES,
      channel: "desktop-apps",
      desktopApps: { applicationIds: [], exceptionIds: [] },
    });
    expect(result.success).toBe(false);
  });

  it("requires notification title and message only when notification is enabled", () => {
    const disabled = policyAuthoringSchema.safeParse({
      ...VALID_CLIPBOARD_VALUES,
      notification: { enabled: false, title: "", message: "" },
    });
    expect(disabled.success).toBe(true);

    const enabledButEmpty = policyAuthoringSchema.safeParse({
      ...VALID_CLIPBOARD_VALUES,
      notification: { enabled: true, title: "", message: "" },
    });
    expect(enabledButEmpty.success).toBe(false);
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
      destinationClass: "personal-or-foreign",
      collectionIds: ["sanctioned-cloud-storage"],
    });
  });

  it("serializes the removable-media channel with exactly its own fields", () => {
    const preview = serializePolicyPreview({ ...ALL_CHANNEL_VALUES, channel: "removable-media" });
    expect(preview.intent.channel).toEqual({
      kind: "removable-media",
      target: "it-issued-encrypted-usb",
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
      applicationIds: ["whatsapp", "signal"],
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
