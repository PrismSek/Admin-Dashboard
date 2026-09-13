import { policyAuthoringSchema, type PolicyAuthoringValues } from "@/features/policies/schemas";

/**
 * The four-member discriminated union `serializeSelectedChannel` produces.
 * Each member carries only the fields that channel's builder step actually
 * shows — never the other three channels' form values, even though the
 * validated `PolicyAuthoringValues` input always carries all four.
 */
export type SerializedPolicyChannel =
  | { kind: "clipboard"; destinationClass: string; collectionIds: string[] }
  | { kind: "removable-media"; target: string; exceptionIds: string[] }
  | { kind: "print"; target: string; exceptionIds: string[] }
  | { kind: "desktop-apps"; applicationIds: string[]; exceptionIds: string[] };

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
        destinationClass: values.clipboard.destinationClass,
        collectionIds: values.clipboard.collectionIds,
      };
    case "removable-media":
      return {
        kind: "removable-media",
        target: values.removableMedia.target,
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
        applicationIds: values.desktopApps.applicationIds,
        exceptionIds: values.desktopApps.exceptionIds,
      };
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
      content: values.content,
      channel: serializeSelectedChannel(values),
      response: values.enforcement,
      notification: values.notification,
    },
  };
}
