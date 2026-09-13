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
    manageCollections: "Manage",
    collectionHelp: 'Left on "any collection" the rule matches on ownership alone.',
    readsAsPrefix: "Reads as —",
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
