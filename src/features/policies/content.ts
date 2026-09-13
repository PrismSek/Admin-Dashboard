/**
 * All Policy list, route, and authoring copy. Nothing user-facing for this
 * feature is written inline in a route or component file — every label, help
 * string, and route path lives here.
 *
 * Transcribed from the Figma Policy frames: the `Policies` list capture
 * (`398:16105`) for the list screen, and the `Create policy` / channel /
 * catalog builder frames (see `.superpowers/sdd/figma-nodes.md`) for
 * authoring copy. Casing, punctuation, and even apparent typos in the design
 * (e.g. "Google Workshop") are reproduced as drawn rather than corrected.
 */

export const policyRoutes = {
  list: "/policies",
  create: "/policies/new",
  manageDomains: "/manage/domains",
} as const;

export const policyListContent = {
  title: "Policies",
  /** Accessible name for the loading skeleton's `role="status"` region. */
  loading: "Loading policies",
  tabs: { all: "All", draft: "Draft", off: "Off" },
  columns: [
    "Policy name",
    "Lifecycle",
    "Enforcement mode",
    "Deployment health",
    "Owner",
    "Last change",
  ],
  newPolicy: "New policy",
  searchPlaceholder: "Search policies",
  refresh: "Refresh",
  deleteSelected: "Delete selected",
  export: "Export",
  /** "Showing {visible} of {total} policies" summary above the table. */
  resultsSummary: (visible: number, total: number) => `Showing ${visible} of ${total} policies`,
  /** "Showing {from} to {to} of {total}" pagination-footer copy. */
  pageSummary: (from: number, to: number, total: number) => `Showing ${from} to ${to} of ${total}`,
  /** Accessible names for the pagination footer's prev/next arrow links. */
  previousPage: "Previous page",
  nextPage: "Next page",
  empty: {
    title: "No policies match your filters.",
    action: "Clear filters",
  },
  error: {
    title: "We couldn't load policies.",
    description: "Something went wrong on our end. Try again, or share the reference below if it keeps happening.",
    /** Support-safe stand-in for the thrown error — never the error message itself. */
    correlationLabel: (id: string) => `Reference: ${id}`,
    retry: "Retry",
  },
} as const;

/** The seven ordered stages of a policy, shown as an orientation rail (verbatim step-rail text). */
export const policyBuilderSteps = [
  { id: "start", title: "Start", detail: "Name & describe the policy" },
  { id: "who", title: "Who", detail: "Choose the audience" },
  { id: "where", title: "Where", detail: "Pick channel & destination" },
  { id: "data", title: "Data", detail: "Define trigger actions" },
  { id: "enforcement", title: "Enforcement & Message", detail: "Set the action" },
  { id: "notification", title: "End user Notification", detail: "Handle the unknown case" },
  { id: "finish", title: "Finish", detail: "Deploy and save" },
] as const;

export const policyBuilderContent = {
  pageTitle: "Create a policy",
  scopeNote: "Applies to every device in the compiled scope — who it covers is decided upstream.",
  bundleJson: "Bundle JSON",
  stepRailNote: "The seven-step order is inherited and cannot be reordered or merged.",
  /** Accessible name for the step rail's `<nav>` landmark — not drawn as
   * visible text in Figma, so it isn't shown on screen. */
  stepRailLabel: "Policy builder steps",
  generateWithAi: "Generate with AI",

  /** Dialog title for the Finish step's "View JSON" preview (Figma `398:19229`
   * "Json"). This dialog is the schema-parsed authoring preview
   * (`serializePolicyPreview`), not the "Bundle JSON" compiled-bundle example
   * drawn in that same frame — the compiled bundle carries `tenantId` /
   * `deviceId`, which this dialog must never surface (task 10 brief). */
  jsonTitle: "Policy JSON",
  /** Accessible name for the JSON dialog's close button. */
  closeJson: "Close",

  /** The in-app Cancel confirmation (task 10 — no Figma frame; the builder
   * has no persistence yet, so every edit is by definition unsaved). */
  unsavedChanges: {
    title: "Leave without creating this policy?",
    message: "Your edits are validated locally only and are lost once you leave this page.",
    stay: "Stay",
    discard: "Discard",
  },

  /** Validation copy that isn't part of the zod contract itself (schemas.ts
   * keeps its own sibling-field messages inline, per the existing pattern
   * for `content.findingIds` / `desktopApps.applicationIds` /
   * `notification.title`/`message`) — `name` had no custom message before
   * task 10, so this is applied via a small resolver wrapper in
   * `PolicyBuilder` instead of editing the approved schema file. */
  errors: {
    nameRequired: "Enter a policy name",
  },

  start: {
    nameLabel: "Policy name",
    addDescription: "+ Add a description",
    removeDescription: "× Remove",
    descriptionLabel: "Description (optional)",
    descriptionPlaceholder: "Why this policy exists, and who to ask about exceptions.",
  },

  who: {
    appliesToLabel: "Applies to",
    scopeHelp:
      "184 users · group-derived, refreshed hourly. Membership is resolved by the backend, not written into the rule.",
  },

  where: {
    channelLabel: "Channel",
    searchChannels: "Search channels",
    enforcedToday: "Enforced today",
    oneChannelPerPolicy: "One channel per policy",
  },

  data: {
    conditionsTitle: "Conditions",
    conditionsHelp:
      "What has to be true for this policy to fire. Name the content, or make it a blind rule that ignores content entirely.",
    contentChip: "CONTENT",
    matchesConditions: "Matches conditions",
    anyContent: "Any content",
    findingLabel: "Finding",
    addFinding: "Add finding",
    removeFinding: "Remove finding",
    destinationChip: "DESTINATION",
    classIs: "Class is",
    destinationHelp: "Whose account the data is going to — ownership, not identity of the site.",
    collectionIs: "Collection is",
    oneOf: "one of",
    anyCollection: "any collection",
    /** The picker used to add one more collection to `clipboard.collectionIds`
     * (Figma's per-row "Finding"-style label, not drawn as its own text in
     * the closed-state captures, so named in parallel with `findingLabel`). */
    collectionLabel: "Collection",
    addCollection: "Add collection",
    removeCollection: "Remove collection",
    manageCollections: "Manage →",
    collectionHelp: 'Left on "any collection" the rule matches on ownership alone.',
    readsAsPrefix: "Reads as —",

    // Removable media channel's DEVICE section — "Registered as"
    // (563:4823), catalogued by `removableTargets` in `data.ts`.
    deviceChip: "DEVICE",
    registeredAsLabel: "Registered as",
    registeredAsHelp: 'Left on "any list" the rule matches on device class alone — no serial lookup.',

    // Print channel's PRINTER section — "Printer is" (563:7670),
    // catalogued by `printerTargets` in `data.ts`.
    printerChip: "PRINTER",
    printerIsLabel: "Printer is",
    printerHelp:
      "A queue we cannot vouch for — hand-installed drivers, direct-IP printers, anything on no list.",

    // Desktop apps channel's APP section — "App is" (563:10020) and the
    // app-selection popover (563:10405), catalogued by `applications` in
    // `data.ts`. `ApplicationSelect`'s own trigger/summary copy.
    appChip: "APP",
    appIsLabel: "App is",
    appsHelp:
      "Only these apps match. Builds are matched by signed publisher and binary, not window title — a renamed executable still matches.",
    chooseApplications: "Choose applications",
    noApplicationsSelected: "No apps selected",
    selectedApplicationsSummary: (labels: readonly string[]) => `Selected: ${labels.join(", ")}`,

    /**
     * The per-channel EXCEPTION picker (563:6411 removable / 563:8722 print /
     * 563:12255 desktop apps) — drawn under the same "Enforcement" heading as
     * the shared ACTION/REQUIRED/MESSAGE fields below, but modeled in the
     * schema as each channel's own `exceptionIds` array (see the doc comments
     * on `removableMediaRuleSchema`/`printRuleSchema`/`desktopAppRuleSchema`
     * in `schemas.ts`), so it is authored here in the Data step rather than
     * in the shared Enforcement & Message step (task 10). Clipboard has no
     * `exceptionIds` field and renders no exception picker.
     */
    exceptionChip: "EXCEPTION",
    letItThroughIf: "Let it through if",
    noException: "never — no exception",
    addException: "Add exception",
    removeException: "Remove exception",
    /** Placeholder text for the free-text exception input — the one worked
     * example each channel's exception frame draws (no catalog of exception
     * reasons exists; see `data.ts`'s "INCOMPLETE" notes on other Data-step
     * catalogs for the same kind of gap). */
    removableExceptionExample: "the volume is encrypted by us",
    printExceptionExample: "every page is watermarked",
    desktopExceptionExample: "the app is our managed build",
  },

  enforcement: {
    title: "Enforcement",
    help: "What happens when the conditions above are met — and what happens when we can't tell.",
    actionChip: "ACTION",
    doThis: "Do this",
    ifCantTellChip: "IF WE CAN'T TELL",
    required: "Required",
    doThisInstead: "Do this instead",
    chooseOne: "Choose one…",
    exceptionChip: "EXCEPTION",
    letItThroughIf: "Let it through if",
    noException: "never — no exception",
    messageChip: "MESSAGE",
    reasonCode: "Reason code",
    theySee: "They see",
  },

  notification: {
    /** Section heading inside the step (distinct casing from the rail label above). */
    title: "End-user notification",
    help: "Who hears about the issue, and what runs on its own once it is raised.",

    /** Field labels for the schema's actual `{enabled, title, message}` shape
     * (task 10) — see the PLAN-vs-FIGMA note on `PolicyNotificationStep` for
     * why these, and not `channelLabel`/`remediations` below, back the real
     * controls in this step. */
    enabledLabel: "Notify the end user",
    titleLabel: "Notification title",
    messageLabel: "Notification message",

    channelChip: "NOTIFICATION CHANNEL",
    channelLabel: "Tell the team via",
    triggerChip: "WHEN ISSUE IS DETECTED",
    remediations: [
      {
        value: "none",
        label: "None",
        description: "No automated remediation when an issue is detected",
      },
      {
        value: "engage-assignee",
        label: "Engage assignee",
        description: "Contact the end user related to this issue",
      },
      {
        value: "remove-public-link",
        label: "Remove public link",
        description: "Remove public links from resources",
      },
      {
        value: "apply-label",
        label: "Apply label",
        description: "Apply labels to related resources",
      },
    ],
  },

  finish: {
    deployAsLabel: "Deploy as:",
    cancel: "Cancel",
    viewJson: "View JSON",
    create: "Create",
    /** No admin-policy create contract exists yet; the builder validates and
     * shows the designed local outcome without claiming persistence. */
    localOnlyNotice:
      "This preview is validated locally. It is not saved until a policy-creation API exists.",
  },

  /**
   * Visible default field values for a new, unedited builder form (used by
   * `authoring-defaults.ts`'s `defaultPolicyAuthoringValues`) — transcribed,
   * not invented, from the "Create policy" example already drawn into the
   * builder frames (`396:4444` and its variants `398:17484`/`398:17144`/
   * `397:15764`/`398:18879`; the notification pair is the clipboard channel
   * frame `512:421`, the one matching this default's `channel: "clipboard"`).
   *
   * The "End user Notification" step in this file's frames is drawn as a
   * NOTIFICATION CHANNEL picker ("Tell the team via" → a channel like Slack)
   * plus a WHEN-ISSUE-IS-DETECTED remediation radio group — not a free-text
   * title/message pair. `notificationTitle`/`notificationMessage` below are
   * the closest real, concrete strings for that same drawn configuration:
   * the selected remediation's own label ("Remove public link") as the short
   * title, and its "Reads as —" sentence as the message.
   */
  defaults: {
    name: "Block Aadhaar to personal cloud",
    reasonCode: "DLP-PII-EGRESS",
    message: "Aadhaar information cannot be uploaded to this destination.",
    notificationTitle: "Remove public link",
    notificationMessage:
      "Public links on the related resources are revoked automatically, and the owner is told.",
  },
} as const;
