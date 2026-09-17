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
  manageApplications: "/manage/applications",
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

/** Placeholder shown in every pill select that opens unanswered — nothing in
 * the builder is pre-selected, so each dropdown reads "Choose one…" until the
 * admin picks (and is required before Create enables). */
const chooseOne = "Choose one…";

export const policyBuilderContent = {
  pageTitle: "Create a policy",
  chooseOne,
  scopeNote: "Applies to every device in the compiled scope — who it covers is decided upstream.",
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
   * keeps its own sibling-field messages inline, per the existing pattern for
   * `content.allOf` / `desktopApps.applicationIds`) — `name` had no custom
   * message, so this is applied via a small resolver wrapper in `PolicyBuilder`
   * instead of editing the approved schema file. */
  errors: {
    nameRequired: "Enter a policy name",
  },

  start: {
    nameLabel: "Policy name",
    /** Hint shown in the empty "Policy name" box on a brand-new policy. */
    namePlaceholder: "Enter name for your new policy",
    addDescription: "+ Add a description",
    removeDescription: "× Remove",
    descriptionLabel: "Description (optional)",
    descriptionPlaceholder: "Why this policy exists, and who to ask about exceptions.",
  },

  who: {
    appliesToLabel: "Applies to",
    /** Placeholder shown in the "Applies to" dropdown before an audience is picked. */
    appliesToPlaceholder: "Select audience",
    /** Filter-input placeholder inside the open "Applies to" dropdown. */
    searchAudiences: "Search audiences",
    scopeHelp: "184 users · from your directory, refreshed hourly.",
  },

  where: {
    channelLabel: "Channel",
    /** Placeholder shown in the "Channel" dropdown before a channel is picked. */
    channelPlaceholder: "Select channel",
    searchChannels: "Search channels",
    enforcedToday: "Enforced today",
    oneChannelPerPolicy: "One channel per policy",
  },

  data: {
    conditionsTitle: "Conditions",
    /** Accessible name for the condition-rows group (distinct from the toggle
     * group above, which is named `conditionsTitle`). */
    conditionsListLabel: "Content conditions",
    conditionsHelp:
      "What has to be true for this policy to act. Name the content to look for, or ignore content and match on destination alone.",
    contentChip: "CONTENT",
    matchesConditions: "Matches conditions",
    anyContent: "Any content",
    /** The "1/32" finding counter drawn top-right of the CONTENT card — count
     * of chosen findings over the design's drawn ceiling of 32. */
    findingCounter: (count: number) => `${count}/32`,
    /** The static leading label on a CONTENT row (the "Finding │ …" segment).
     * A row always matches a finding now that content tags are gone. */
    findingLabel: "Finding",
    /** Placeholder in the inline finding picker before one is chosen, and its
     * accessible name (the "Finding" label sits separately, so the picker
     * itself has no drawn label). */
    findingPlaceholder: "Select finding",
    /** Accessible name for a finding row's minimum-confidence select (its value,
     * e.g. "High confidence", is self-describing, so no visible label is drawn). */
    confidenceLabel: "Minimum confidence",
    addFinding: "Add condition",
    removeFinding: "Remove condition",

    pasteTargetChip: "PASTE TARGET",
    /** The "Paste into" pill: a leading label + the match-operator value. */
    pasteInto: "Paste into",
    /** The "Paste into" match operator (`clipboard.targetOp`). */
    targetOperators: [
      { value: "one-of", label: "one of" },
      { value: "not-one-of", label: "not one of" },
    ],
    anyTarget: "any target",
    /** Accessible name for the paste-targets multi-select (its summary — "any
     * target" / "N targets" — is drawn in the trigger). */
    targetSelectLabel: "Paste targets",
    /** Trigger summary when more than one target is picked. */
    targetsSummary: (count: number) => `${count} targets`,
    manageTargets: "Manage →",
    /** Help under the "Paste into" row — one line per state. */
    targetHelp: 'With "any target", the rule matches wherever the paste lands.',
    targetHelpOneOf: "Only pastes landing in these targets match. Copying is never blocked — only where it lands.",
    targetHelpNotOneOf: "Everything except these targets matches — the allowlist shape.",
    /** The "Fires when" pill + its trigger options (`clipboard.firesWhen`). */
    firesWhenLabel: "Fires when",
    firesWhenOptions: [
      { value: "text", label: "text is pasted" },
      { value: "file-or-image", label: "a file or image is pasted" },
      { value: "anything", label: "anything is pasted" },
    ],
    /** Help under "Fires when" — one line per trigger option. */
    firesWhenNotes: {
      text: "The common case — copied text landing in another app.",
      "file-or-image": "Covers dragged or pasted files and screenshots, not just text.",
      anything: "Every paste, whatever the format.",
    } as Record<string, string>,
    /** Footer actions in the checkbox-per-row multi-select popover (Figma
     * 563:10405): reset the whole selection / dismiss the popover. */
    multiSelectClear: "Clear",
    multiSelectDone: "Done",
    readsAsPrefix: "Reads as —",

    /** Fragments for the plain-language policy summary under the Conditions card
     * (Figma `396:4906`). Kept here, not inline in `reads-as.ts`, per the
     * no-inline-copy rule. */
    readsAs: {
      anyContent: "any content",
      /** "content containing A and B" (the condition rows joined with "and"). */
      withConditions: (conditions: string) => `content containing ${conditions}`,
      /** Suffix on a finding below full confidence, e.g. " (medium+)". */
      confidenceSuffix: (confidence: string) => ` (${confidence}+)`,
      matchingContent: "matching content",
      channelFallback: "a channel",
      channelName: (channel: string) => `the ${channel} channel`,
      destinationFallback: "its destination",
      /** Clipboard "Reads as" destination — when no paste target is picked, and
       * the "not one of" (allowlist) phrasing. */
      pasteTargetFallback: "any paste target",
      pasteTargetExcept: (targets: string) => `anywhere outside ${targets}`,
      /** Removable media "Reads as" destination, per device class. */
      removableDrive: (deviceClass: string) => `a ${deviceClass} drive`,
      removableAnyDrive: "any removable drive",
      printDestination: (printer: string) => `${printer} printers`,
      /** Desktop apps "Reads as" destination — the "not one of" (allowlist)
       * phrasing; the plain "one of" case reads as the joined app names. */
      appExcept: (apps: string) => `any app except ${apps}`,
      actions: {
        AuditOnly: "audit it",
        WarnJustify: "warn the user and require justification",
        BlockWithOverride: "block it with an override",
        Block: "block it",
      },
      /** Fallback phrase when "If we can't tell" has not been answered yet. */
      notDecided: "not decided yet",
      /** Fallback clause while the ACTION itself is still unanswered. */
      actionNotDecided: "the action is not decided yet",
      compose: (content: string, channel: string, destination: string, action: string, fallback: string) =>
        `When ${content} leaves through ${channel} to ${destination}, ${action}. If we can't tell, ${fallback}.`,
    },

    // Removable media channel's DEVICE section — "Registered as"
    // (563:4823), catalogued by `removableTargets` in `data.ts`.
    deviceChip: "DEVICE",
    /** "Device is" — the removable-media device class (`removableMedia.deviceClass`). */
    deviceIsLabel: "Device is",
    /** Help under "Device is" — one line per class. */
    deviceClassNotes: {
      "personal-or-unrecognised": "Anything IT did not issue — including a drive plugged in for the first time.",
      "corporate-not-encrypted": "Company hardware without enforced encryption.",
      "corporate-issued": "Managed, encrypted, IT-issued hardware.",
      "any-device": "Any device — the rule matches on registration and transfer alone.",
    } as Record<string, string>,
    /** "Registered as" — the match operator (`registrationOp`, reuses
     * `targetOperators`) beside a multi-select over the registration lists. */
    registeredAsLabel: "Registered as",
    anyList: "any list",
    /** Accessible name for the registration multi-select ("any list" / "N lists"). */
    registrationSelectLabel: "Registration lists",
    listsSummary: (count: number) => `${count} lists`,
    manageRegistrations: "Manage →",
    /** Help under "Registered as" — one line per state. */
    registeredAsHelp: 'With "any list", the rule matches on device class alone.',
    registeredAsHelpOneOf: "Only devices on these lists match.",
    registeredAsHelpNotOneOf: "Everything except these lists matches — the allowlist shape.",
    /** "Transfer is" — the transfer direction (`removableMedia.transfer`). */
    transferLabel: "Transfer is",

    // Print channel's PRINTER section — "Printer is" (563:7670),
    // catalogued by `printerTargets` in `data.ts`.
    printerChip: "PRINTER",
    printerIsLabel: "Printer is",
    printerHelp:
      "A queue we cannot vouch for — hand-installed drivers, direct-IP printers, anything on no list.",

    // Desktop apps channel's APP section — "App is" (563:10020) + the
    // checkbox-per-row app multi-select (563:10405) + "Fires when", catalogued by
    // `applications` in `data.ts`. Same PASTE TARGET shape as clipboard: a match
    // operator (reusing `targetOperators`) beside the app multi-select, then a
    // "Fires when" single-select.
    appChip: "APP",
    /** The "App is" pill: a leading label + the match-operator value. */
    appIsLabel: "App is",
    /** Accessible name for the apps multi-select (its summary is drawn in the
     * trigger). */
    appSelectLabel: "Applications",
    /** Trigger summary when nothing is picked yet / when more than one app is. */
    selectApps: "Select apps",
    appsSummary: (count: number) => `${count} apps`,
    manageApps: "Manage →",
    appsHelp: "Only these apps match. Renaming an app does not get around the rule.",
    /** The "Fires when" options for desktop apps (`desktopApps.firesWhen`). */
    appFiresWhenOptions: [
      { value: "file-sent", label: "a file is sent" },
      { value: "text-pasted", label: "text is pasted" },
      { value: "anything", label: "anything moves" },
    ],
    /** Help under "Fires when" — one line per trigger option. */
    appFiresWhenNotes: {
      "file-sent": "Attachments and drag-and-drop into the app window.",
    } as Record<string, string>,

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
    desktopExceptionExample: "the app is our managed build",
  },

  enforcement: {
    title: "Enforcement",
    help: "What happens when the conditions above are met — and what happens when we can't tell.",
    actionChip: "ACTION",
    doThis: "Do this",
    ifCantTellChip: "IF WE CAN'T TELL",
    required: "Required",
    answered: "Answered",
    doThisInstead: "Do this instead",
    chooseOne,
    /** The fallback's audit option is labelled as the engine default, to set it
     * apart from the primary ACTION's plain "Audit only" (its options otherwise
     * reuse the `actions` catalog). */
    auditOnlyEngineDefault: "Audit only - engine default",

    exceptionChip: "EXCEPTION",
    letItThroughIf: "Let it through if",
    noException: "never — no exception",
    /** The escape hatch each channel offers, shown as a second "Let it through
     * if" option — only when the action isn't "Audit only". Every channel draws
     * one so the Enforcement card is uniform; keyed by builder `channel`. */
    exceptionsByChannel: {
      clipboard: { value: "managed-destination", label: "the destination is a managed app" },
      "removable-media": { value: "encrypted", label: "the volume is encrypted by us" },
      print: { value: "watermark", label: "every page is watermarked" },
      "desktop-apps": { value: "managed-build", label: "the app is our managed build" },
    },

    messageChip: "MESSAGE",
    reasonCode: "Reason code",
    reasonCodePlaceholder: "DLP-PII-EGRESS",
    theySee: "They see",
    theySeePlaceholder: "What the person sees when the transfer is stopped.",
  },

  notification: {
    /** Section heading inside the step (distinct casing from the rail label above). */
    title: "End-user notification",
    help: "Who hears about the issue, and what runs on its own once it is raised.",

    channelChip: "NOTIFICATION CHANNEL",
    channelLabel: "Tell the team via",
    /** "Tell the team via" delivery channels. `note` is the help line drawn under
     * the pill; `phrase` is how the channel reads inside the "Reads as —"
     * summary ("contacted over Slack" / "over the endpoint agent"). */
    channels: [
      { value: "none", label: "None", phrase: "no channel", note: "No one is told automatically — the issue waits in the queue." },
      { value: "slack", label: "Slack", phrase: "Slack", note: "The assigned reviewer is messaged there the moment the issue is raised." },
      { value: "teams", label: "Teams", phrase: "Teams", note: "The assigned reviewer is messaged there the moment the issue is raised." },
      { value: "email", label: "Email", phrase: "email", note: "The assigned reviewer is messaged there the moment the issue is raised." },
      { value: "endpoint", label: "Endpoint", phrase: "the endpoint agent", note: "Shown on the device itself, by the agent, at the moment the transfer is stopped." },
    ],

    triggerChip: "WHEN ISSUE IS DETECTED",
    /** The automated remediation run when an issue is raised ("When issue is
     * detected"). `icon` is an AppIcon name; `badges` are the integrations each
     * remediation touches — each a `{ label, logo }` where `logo` is a
     * `BrandLogo` name, so the card shows the vendor's own brand mark beside the
     * name (the one place we use full-colour vendor logos rather than tokens). */
    remediations: [
      { value: "none", label: "None", description: "No automated remediation when an issue is detected", icon: "dash", badges: [] },
      { value: "engage-assignee", label: "Engage assignee", description: "Contact the end user related to this issue", icon: "mail", badges: [{ label: "Slack", logo: "slack" }, { label: "Teams", logo: "teams" }] },
      { value: "remove-public-link", label: "Remove public link", description: "Remove public links from related resources", icon: "link-off", badges: [{ label: "Google Workspace", logo: "google" }, { label: "Microsoft 365", logo: "microsoft" }] },
      { value: "apply-label", label: "Apply label", description: "Apply labels to related resources", icon: "tag", badges: [{ label: "Google Workspace", logo: "google" }, { label: "Microsoft 365", logo: "microsoft" }] },
    ],

    /** Accessible name for the remediation radio group (the `triggerChip` is a
     * decorative label, so the group needs its own programmatic name). */
    remediationGroupLabel: "When issue is detected, do this",
    readsAsPrefix: "Reads as —",
    /** Fragments for the notification "Reads as —" line (mirrors the artifact's
     * `notifySentence`). `engage` names the delivery channel and, when set, the
     * enforcement reason code. */
    readsAs: {
      /** Shown while no remediation has been chosen yet (nothing is pre-selected). */
      notDecided: "Nothing is decided yet — choose what runs when an issue is detected.",
      none: "No automated remediation runs; the issue is recorded and left for a person to pick up.",
      engage: (channel: string, reasonCode: string) =>
        reasonCode
          ? `The person behind the issue is contacted over ${channel}, quoting ${reasonCode}.`
          : `The person behind the issue is contacted over ${channel}.`,
      removeLink: "Public links on the related resources are revoked automatically, and the owner is told.",
      applyLabel: "A sensitivity label is applied to the related resources automatically.",
    },
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
} as const;
