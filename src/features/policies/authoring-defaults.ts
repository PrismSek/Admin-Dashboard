import { policyBuilderContent } from "@/features/policies/content";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";

/**
 * A complete, schema-valid set of builder form values for a brand-new,
 * unedited policy. All four channel sub-objects are populated — not just the
 * `clipboard` one implied by `channel: "clipboard"` — so that switching the
 * channel selector never hits an unpopulated field (`shouldUnregister: false`
 * on the form keeps the hidden three around; `serializePolicyPreview` is what
 * later drops them from the *output*, never this object).
 *
 * Catalog ids (`appliesTo`, `content.findingIds`, the four channel fields)
 * are real values from `data.ts`'s `POLICY_CATALOGS` — not the sample ids
 * sketched in the task plan, two of which do not exist in the real catalogs:
 *   - `appliesTo`: the plan's "finance-all-staff" isn't a real audience id;
 *     the real catalog entry is "finance-all-stuff" (drawn "Finance-All
 *     Stuff" in Figma — an apparent typo reproduced verbatim, per data.ts).
 *   - `removableMedia.target`: the plan's "all-removable-media" isn't a real
 *     `removableTargets` id (that catalog has no "any" sentinel); the
 *     closest real option is "it-issued-encrypted-usb".
 * `print.target: "unknown"` and `desktopApps.applicationIds: ["whatsapp",
 * "signal"]` both match the Figma default state directly (563:6608's
 * "Printer is: Unknown"; 563:8724's "Reads as — … through WhatsApp or
 * Signal").
 */
export const defaultPolicyAuthoringValues: PolicyAuthoringValues = {
  name: policyBuilderContent.defaults.name,
  description: "",
  appliesTo: "finance-all-stuff",
  channel: "clipboard",
  content: { mode: "specific", findingIds: ["aadhaar-number"] },
  clipboard: { destinationClass: "personal-or-foreign", collectionIds: [] },
  removableMedia: { target: "it-issued-encrypted-usb", exceptionIds: [] },
  print: { target: "unknown", exceptionIds: [] },
  desktopApps: { applicationIds: ["whatsapp", "signal"], exceptionIds: [] },
  enforcement: {
    action: "Block",
    onUnknown: "WarnJustify",
    reasonCode: policyBuilderContent.defaults.reasonCode,
    message: policyBuilderContent.defaults.message,
  },
  notification: {
    enabled: true,
    title: policyBuilderContent.defaults.notificationTitle,
    message: policyBuilderContent.defaults.notificationMessage,
  },
  deployAs: "Draft",
};
