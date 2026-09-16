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
      printDestination: (printer: string) => `${printer} printers`,
      actions: {
        AuditOnly: "audit it",
        WarnJustify: "warn the user and require justification",
        BlockWithOverride: "block it with an override",
        Block: "block it",
      },
      /** Fallback phrase when "If we can't tell" has not been answered yet. */
      notDecided: "not decided yet",
      compose: (content: string, channel: string, destination: string, action: string, fallback: string) =>
        `When ${content} leaves through ${channel} to ${destination}, ${action}. If we can't tell, ${fallback}.`,
    },

    // Removable media channel's DEVICE section — "Registered as"
    // (563:4823), catalogued by `removableTargets` in `data.ts`.
    deviceChip: "DEVICE",
    registeredAsLabel: "Registered as",
    /** Placeholder in the "Registered as" pill before a device class is picked. */
    registeredAsPlaceholder: "Select registration",
    registeredAsHelp: 'Left on "any list" the rule matches on device class alone — no serial lookup.',

    // Print channel's PRINTER section — "Printer is" (563:7670),
    // catalogued by `printerTargets` in `data.ts`.
    printerChip: "PRINTER",
    printerIsLabel: "Printer is",
    /** Placeholder in the "Printer is" pill before a printer target is picked. */
    printerPlaceholder: "Select printer",
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
    answered: "Answered",
    doThisInstead: "Do this instead",
    chooseOne: "Choose one…",
    /** Note under the required "If we can't tell" row while it is unanswered. */
    onUnknownRequiredNote: "Mandatory. Left unset the engine would silently audit — say it on purpose.",

    exceptionChip: "EXCEPTION",
    letItThroughIf: "Let it through if",
    noException: "never — no exception",
    /** The escape hatch each channel offers, shown as a second "Let it through
     * if" option — only for the channels that draw one, and only when the action
     * isn't "Audit only". `noneNote` reads under "never — no exception";
     * `selectedNote` reads when the escape is chosen. Keyed by builder `channel`
     * (clipboard offers none). */
    exceptionsByChannel: {
      "removable-media": {
        value: "encrypted",
        label: "the volume is encrypted by us",
        noneNote: "No way through from the device — encrypted corporate drives are stopped too.",
        selectedNote: "A drive we provisioned and encrypted is trusted even when the content matches.",
      },
      print: {
        value: "watermark",
        label: "every page is watermarked",
        noneNote: "No way through — the job is dropped at the spooler, managed queues included.",
        selectedNote: "The job prints, stamped per page with the person, the time and the job id.",
      },
      "desktop-apps": {
        value: "managed-build",
        label: "the app is our managed build",
        noneNote: "No way through — the send is stopped even in a tenant-managed app.",
        selectedNote: "A signed build inside our tenant is trusted — the same app installed personally is not.",
      },
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
     * remediation touches — rendered as neutral chips in our palette, never the
     * vendor's brand colour (per "follow our colour scheme"). */
    remediations: [
      { value: "none", label: "None", description: "No automated remediation when an issue is detected", icon: "dash", badges: [] },
      { value: "engage-assignee", label: "Engage assignee", description: "Contact the end user related to this issue", icon: "mail", badges: ["Slack", "Teams"] },
      { value: "remove-public-link", label: "Remove public link", description: "Remove public links from related resources", icon: "link-off", badges: ["Google Workspace", "Microsoft 365"] },
      { value: "apply-label", label: "Apply label", description: "Apply labels to related resources", icon: "tag", badges: ["Google Workspace", "Microsoft 365"] },
    ],

    /** Accessible name for the remediation radio group (the `triggerChip` is a
     * decorative label, so the group needs its own programmatic name). */
    remediationGroupLabel: "When issue is detected, do this",
    readsAsPrefix: "Reads as —",
    /** Fragments for the notification "Reads as —" line (mirrors the artifact's
     * `notifySentence`). `engage` names the delivery channel and, when set, the
     * enforcement reason code. */
    readsAs: {
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
