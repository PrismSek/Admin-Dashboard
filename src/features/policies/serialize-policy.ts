import { isConditionRowFilled, policyAuthoringSchema, type PolicyAuthoringValues } from "@/features/policies/schemas";

/**
 * The four-member discriminated union `serializeSelectedChannel` produces.
 * Each member carries only the fields that channel's builder step actually
 * shows — never the other three channels' form values, even though the
 * validated `PolicyAuthoringValues` input always carries all four.
 */
export type SerializedPolicyChannel =
  | { kind: "clipboard"; targetOp: string; targetIds: string[]; firesWhen: string }
  | {
      kind: "removable-media";
      deviceClass: string;
      registrationOp: string;
      registrationIds: string[];
      transfer: string;
      exceptionIds: string[];
    }
  | { kind: "print"; target: string; exceptionIds: string[] }
  | { kind: "desktop-apps"; appOp: string; applicationIds: string[]; firesWhen: string; exceptionIds: string[] };

/** The Finish step's read-only preview of what a policy will do — the local,
 * validated stand-in for a create-policy API response (see
 * `policyBuilderContent.finish.localOnlyNotice`: nothing is persisted yet). */
export type PolicyPreview = {
  name: string;
  description: string;
  state: PolicyAuthoringValues["deployAs"];
  intent: {
    who: { appliesTo: string };
    content: PolicyAuthoringValues["content"];
    channel: SerializedPolicyChannel;
    response: PolicyAuthoringValues["enforcement"];
    notification: PolicyAuthoringValues["notification"];
  };
};

/** Exhaustiveness guard: if `PolicyChannel` ever grows a fifth member,
 * `serializeSelectedChannel`'s `switch` fails to compile here instead of
 * silently falling through and serializing the wrong channel's fields. */
export function unreachableChannel(value: never): never {
  throw new Error(`Unhandled policy channel: ${JSON.stringify(value)}`);
}

/** Picks exactly the selected channel's own fields out of the validated form
 * values — the other three channels' sub-objects are never read here. */
function serializeSelectedChannel(values: PolicyAuthoringValues): SerializedPolicyChannel {
  switch (values.channel) {
    case "clipboard":
      return {
        kind: "clipboard",
        targetOp: values.clipboard.targetOp,
        targetIds: values.clipboard.targetIds,
        firesWhen: values.clipboard.firesWhen,
      };
    case "removable-media":
      return {
        kind: "removable-media",
        deviceClass: values.removableMedia.deviceClass,
        registrationOp: values.removableMedia.registrationOp,
        registrationIds: values.removableMedia.registrationIds,
        transfer: values.removableMedia.transfer,
        exceptionIds: values.removableMedia.exceptionIds,
      };
    case "print":
      return {
        kind: "print",
        target: values.print.target,
        exceptionIds: values.print.exceptionIds,
      };
    case "desktop-apps":
      return {
        kind: "desktop-apps",
        appOp: values.desktopApps.appOp,
        applicationIds: values.desktopApps.applicationIds,
        firesWhen: values.desktopApps.firesWhen,
        exceptionIds: values.desktopApps.exceptionIds,
      };
    case "":
      // No channel chosen yet. `serializePolicyPreview` only reaches here for a
      // still-invalid form (a validated policy always has a real channel — see
      // `policyAuthoringSchema`'s `superRefine`), so this throws; the one caller
      // that serializes mid-edit, `PolicyJsonPreview`, catches it and shows an
      // empty preview rather than crashing.
      throw new Error("Cannot serialize a policy with no channel selected");
    default:
      return unreachableChannel(values.channel);
  }
}

/**
 * Re-parses `input` with `policyAuthoringSchema` (never trusts a caller's
 * claim that it already validated — §6/§8 of the coding standards: every
 * Server Action re-parses too) and serializes it into the Finish step's
 * preview shape. Only the selected channel's fields reach `intent.channel`;
 * the other three channels' values stay in the form but never appear here.
 */
export function serializePolicyPreview(input: PolicyAuthoringValues): PolicyPreview {
  const values = policyAuthoringSchema.parse(input);
  return {
    name: values.name,
    description: values.description,
    state: values.deployAs,
    intent: {
      who: { appliesTo: values.appliesTo },
      // Drop any placeholder row the admin added but never filled in.
      content: {
        mode: values.content.mode,
        allOf: values.content.allOf.filter(isConditionRowFilled),
      },
      channel: serializeSelectedChannel(values),
      response: values.enforcement,
      notification: values.notification,
    },
  };
}
