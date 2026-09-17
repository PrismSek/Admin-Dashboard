import { policyBuilderContent } from "@/features/policies/content";
import type { AuthoringAction, AuthoringChannel } from "@/features/policies/schemas";
import type { PolicyCatalogOption, PolicyCatalogs } from "@/features/policies/types";

const readsAs = policyBuilderContent.data.readsAs;
const notification = policyBuilderContent.notification;

/** The End-user notification fields the notification "Reads as —" line reads. */
export type NotificationReadsAsInput = {
  remediation: string;
  channel: string;
  /** The enforcement reason code, quoted when engaging the assignee. */
  reasonCode: string;
};

/**
 * Composes the plain-language restatement shown under the End-user notification
 * card (the artifact's `notifySentence`). "Engage assignee" names the delivery
 * channel (and the reason code, when one is set); the other remediations read
 * the same regardless of channel.
 */
export function composeNotificationReadsAs(input: NotificationReadsAsInput): string {
  switch (input.remediation) {
    case "engage-assignee": {
      const channel = notification.channels.find((option) => option.value === input.channel);
      return notification.readsAs.engage(channel?.phrase ?? "no channel", input.reasonCode.trim());
    }
    case "remove-public-link":
      return notification.readsAs.removeLink;
    case "apply-label":
      return notification.readsAs.applyLabel;
    case "":
      // Nothing chosen yet — nothing is pre-selected, so say so rather than
      // implying "none" was picked.
      return notification.readsAs.notDecided;
    case "none":
    default:
      return notification.readsAs.none;
  }
}

/** One CONTENT row as the summary reads it (a named finding). */
export type ReadsAsCondition = {
  findingType: string;
  minimumConfidence: string;
};

/** The form fields the "Reads as —" summary reads (Figma `396:4906`). */
export type ReadsAsInput = {
  channel: AuthoringChannel;
  contentMode: "specific" | "any";
  /** The conditions (all must match). */
  allOf: readonly ReadsAsCondition[];
  /** Clipboard "Paste into": the match operator + the chosen paste targets. */
  targetOp: string;
  targetIds: readonly string[];
  /** Removable media "Device is" class. */
  deviceClass: string;
  printTarget: string;
  /** Desktop apps "App is": the match operator + the chosen apps. */
  appOp: string;
  applicationIds: readonly string[];
  /** The ACTION; `""` (unanswered) reads as "the action is not decided yet". */
  action: AuthoringAction;
  /** The "If we can't tell" fallback; `""` (unanswered) reads as "not decided yet". */
  onUnknown: AuthoringAction;
};

function labelOf(options: readonly PolicyCatalogOption[], value: string): string | undefined {
  return options.find((option) => option.value === value)?.label;
}

/** "A", "A or B", or "A, B or C". */
function joinWithOr(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} or ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
}

/** One row → its phrase ("Aadhaar number", "Customer record (medium+)"), or ""
 * if the row's finding isn't picked yet. */
function conditionPhrase(row: ReadsAsCondition, catalogs: PolicyCatalogs): string {
  const label = labelOf(catalogs.findings, row.findingType);
  if (!label) return "";
  return row.minimumConfidence === "High"
    ? label
    : `${label}${readsAs.confidenceSuffix(row.minimumConfidence.toLowerCase())}`;
}

function contentPhrase(input: ReadsAsInput, catalogs: PolicyCatalogs): string {
  if (input.contentMode === "any") return readsAs.anyContent;
  const all = input.allOf
    .map((row) => conditionPhrase(row, catalogs))
    .filter(Boolean)
    .join(" and ");
  return all ? readsAs.withConditions(all) : readsAs.matchingContent;
}

function destinationPhrase(input: ReadsAsInput, catalogs: PolicyCatalogs): string {
  switch (input.channel) {
    case "clipboard": {
      const labels = input.targetIds
        .map((id) => labelOf(catalogs.pasteTargets, id))
        .filter((label): label is string => Boolean(label))
        .map((label) => label.toLowerCase());
      if (labels.length === 0) return readsAs.pasteTargetFallback;
      const joined = joinWithOr(labels);
      return input.targetOp === "not-one-of" ? readsAs.pasteTargetExcept(joined) : joined;
    }
    case "removable-media": {
      const label = labelOf(catalogs.deviceClasses, input.deviceClass);
      return !label || input.deviceClass === "any-device"
        ? readsAs.removableAnyDrive
        : readsAs.removableDrive(label.toLowerCase());
    }
    case "print": {
      const label = labelOf(catalogs.printerTargets, input.printTarget);
      return label ? readsAs.printDestination(label.toLowerCase()) : readsAs.destinationFallback;
    }
    case "desktop-apps": {
      const labels = input.applicationIds
        .map((id) => labelOf(catalogs.applications, id))
        .filter((label): label is string => Boolean(label));
      if (labels.length === 0) return readsAs.destinationFallback;
      const joined = joinWithOr(labels);
      return input.appOp === "not-one-of" ? readsAs.appExcept(joined) : joined;
    }
    case "":
    default:
      return readsAs.destinationFallback;
  }
}

/**
 * Composes the one-line, plain-language restatement of the policy shown under
 * the Conditions card. Every part has a graceful fallback so a half-filled
 * form still reads as a sentence rather than exposing blanks.
 */
export function composeReadsAs(input: ReadsAsInput, catalogs: PolicyCatalogs): string {
  const channelName = labelOf(catalogs.channels, input.channel);
  const channelLabel = channelName ? readsAs.channelName(channelName.toLowerCase()) : readsAs.channelFallback;
  const action = input.action === "" ? readsAs.actionNotDecided : readsAs.actions[input.action];
  const fallback = input.onUnknown === "" ? readsAs.notDecided : readsAs.actions[input.onUnknown];
  return readsAs.compose(contentPhrase(input, catalogs), channelLabel, destinationPhrase(input, catalogs), action, fallback);
}
