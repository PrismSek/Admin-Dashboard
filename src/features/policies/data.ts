import "server-only";

import { z } from "zod";

import { policyListItemSchema } from "@/features/policies/schemas";
import type { PolicyListItem } from "@/features/policies/labels";
import type { PolicyCatalogs } from "@/features/policies/types";

/**
 * Server-only Figma fixture data for the Policy list and authoring catalogs.
 *
 * The 15 rows below are transcribed verbatim, in visual order, from the
 * `Policies` list-capture frame (`398:16105`) — see
 * `.superpowers/sdd/task-3-report.md` for the full transcription log.
 *
 * NOTE ON ROW COUNT: the frame's own footer text reads "Showing 1 to 20 of
 * 20", but the table itself contains exactly 15 row frames (a fixed,
 * structural fact — not a fetch/depth artifact), and the results-summary line
 * drawn just above the table reads "Showing 19 of 19 policies". All three
 * numbers disagree with each other; this fixture uses the 15 rows that
 * actually exist as distinct, readable content rather than inventing 5 (or
 * 6) more to reach either quoted total. See the task report's "Concerns"
 * section.
 *
 * The captured "Lifecycle" column has a fourth value, "Simulation", beyond
 * the UI's 3-value vocabulary (`enforced`/`draft`/`off`). Simulation rows
 * carry a real enforcement-mode string and a real (non-"Not deployed")
 * health value — unlike genuine Draft/Off rows, which show "—" and "Not
 * deployed" — so they are deployed, evaluating policies, not works in
 * progress. They are bucketed as `lifecycle: "enforced"` (visible only under
 * the "All" tab, per the brief), and their literal Figma text ("Simulation"
 * / "Simulation with tips") is preserved in `enforcementMode` instead of one
 * of the four gateway action labels.
 */

type FigmaRow = {
  name: string;
  lifecycle: "Enforced" | "Draft" | "Off" | "Simulation";
  enforcementMode: string | null;
  health: PolicyListItem["health"];
  owner: string;
  lastChange: string;
};

const FIGMA_ROWS: readonly FigmaRow[] = [
  {
    name: "Financial records to unmanaged cloud",
    lifecycle: "Enforced",
    enforcementMode: "Block with override",
    health: "Healthy",
    owner: "R. Advani",
    lastChange: "2 days ago",
  },
  {
    name: "Customer PII to web destinations",
    lifecycle: "Enforced",
    enforcementMode: "Warn & justify",
    health: "Degraded",
    owner: "R. Advani",
    lastChange: "4 hours ago",
  },
  {
    name: "India Aadhaar & PAN — removable media",
    lifecycle: "Simulation",
    enforcementMode: "Simulation with tips",
    health: "Approval pending",
    owner: "S. Iyer",
    lastChange: "1 day ago",
  },
  {
    name: "Source code to personal Git remotes",
    lifecycle: "Draft",
    enforcementMode: null,
    health: "Not deployed",
    owner: "M. Okafor",
    lastChange: "25 minutes ago",
  },
  {
    name: "Highly Confidential label — print",
    lifecycle: "Enforced",
    enforcementMode: "Block",
    health: "Stale",
    owner: "Compliance",
    lastChange: "3 weeks ago",
  },
  {
    name: "Contract drafts to AI assistants",
    lifecycle: "Simulation",
    enforcementMode: "Simulation",
    health: "Healthy",
    owner: "Legal Ops",
    lastChange: "6 days ago",
  },
  {
    name: "Patient records to email attachments",
    lifecycle: "Enforced",
    enforcementMode: "Block with override",
    health: "Healthy",
    owner: "Compliance",
    lastChange: "5 days ago",
  },
  {
    name: "Payroll exports to network shares",
    lifecycle: "Off",
    enforcementMode: null,
    health: "Not deployed",
    owner: "S. Iyer",
    lastChange: "1 month ago",
  },
  {
    name: "Cardholder data to removable media",
    lifecycle: "Enforced",
    enforcementMode: "Block",
    health: "Healthy",
    owner: "Compliance",
    lastChange: "3 days ago",
  },
  {
    name: "Board minutes to personal email",
    lifecycle: "Enforced",
    enforcementMode: "Block with override",
    health: "Healthy",
    owner: "R. Advani",
    lastChange: "4 days ago",
  },
  {
    name: "Screen capture in payroll application",
    lifecycle: "Enforced",
    enforcementMode: "Block",
    health: "Degraded",
    owner: "M. Okafor",
    lastChange: "8 days ago",
  },
  {
    name: "CRM bulk export to browser downloads",
    lifecycle: "Simulation",
    enforcementMode: "Simulation with tips",
    health: "Approval pending",
    owner: "S. Iyer",
    lastChange: "2 days ago",
  },
  {
    name: "Vendor contracts to unmanaged sync",
    lifecycle: "Enforced",
    enforcementMode: "Warn & justify",
    health: "Healthy",
    owner: "Legal Ops",
    lastChange: "11 days ago",
  },
  {
    name: "Credentials and API keys to any channel",
    lifecycle: "Enforced",
    enforcementMode: "Block",
    health: "Healthy",
    owner: "Compliance",
    lastChange: "6 days ago",
  },
  {
    name: "HR case files to print",
    lifecycle: "Simulation",
    enforcementMode: "Simulation",
    health: "Stale",
    owner: "Compliance",
    lastChange: "7 days ago",
  },
];

/** A stable, readable id from a policy name: lowercase, hyphen-separated. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const FIGMA_POLICY_ROWS: readonly PolicyListItem[] = FIGMA_ROWS.map((row) => ({
  id: slugify(row.name),
  name: row.name,
  // Simulation is a deployed, evaluating state (real enforcement mode + real
  // health), not a work in progress — see the module doc comment above.
  lifecycle: row.lifecycle === "Off" ? "off" : row.lifecycle === "Draft" ? "draft" : "enforced",
  enforcementMode: row.enforcementMode,
  health: row.health,
  owner: row.owner,
  lastChange: row.lastChange,
}));

// Hardcoded (not `FIGMA_POLICY_ROWS.length`, which would make this
// tautological): the Figma capture has exactly 15 real rows — see the module
// doc comment above — so an accidental future row add/remove fails loudly
// here rather than only in a test.
const policyFixtureSchema = z.array(policyListItemSchema).length(15);
const POLICY_FIXTURES: readonly PolicyListItem[] = policyFixtureSchema.parse(FIGMA_POLICY_ROWS);

/**
 * Authoring catalogs for the Policy builder, transcribed from the
 * hand-authored Figma builder/catalog frames (see figma-nodes.md). A few
 * catalogs are only partially represented in Figma — see the task-3 report's
 * "Concerns" section for exactly which, and why nothing was invented to fill
 * the gaps.
 */
const POLICY_CATALOGS: PolicyCatalogs = {
  // "Applies to" open dropdown (396:5362 family). Casing/punctuation drawn as-is.
  audiences: [
    { value: "all-managed-devices", label: "All Managed Devices" },
    { value: "finance-all-stuff", label: "Finance-All Stuff" },
    { value: "engineering-contractors", label: "Engineering Contractors" },
    { value: "specific-peoples", label: "Specific peoples" },
  ],

  // The 4 authoring channels with full builder frame families (Clipboard,
  // Removable media, Print, Desktop apps). The generic "Channel" dropdown
  // (396:7175 family) labels the fourth option "Thick app", but the
  // channel-specific screen's own selected-channel display (563:10405) reads
  // "Desktop apps" — this uses the latter (matches the existing
  // `desktop-apps` icon/frame-family naming); flagged in the task report.
  channels: [
    { value: "clipboard", label: "Clipboard", icon: "clipboard" },
    { value: "removable-media", label: "Removable media", icon: "removable-media" },
    { value: "print", label: "Print", icon: "print" },
    { value: "desktop-apps", label: "Desktop apps", icon: "desktop-apps" },
  ],

  // INCOMPLETE: the builder shows a "1/32" finding counter, but no frame in
  // this slice opens the finding picker's full list. Only the two findings
  // used as worked examples are real.
  findings: [
    { value: "aadhaar-number", label: "Aadhaar number" },
    { value: "customer-record", label: "Customer record" },
  ],

  // INCOMPLETE: every Destination-class frame in this slice shows the field
  // closed with the same example value; no open-list state was found.
  destinationClasses: [{ value: "personal-or-foreign", label: "Personal or foreign" }],

  // Collection open dropdown (397:11355 family).
  collections: [
    { value: "sanctioned-cloud-storage", label: "Sanctioned cloud storage" },
    { value: "regulator-submission-portals", label: "Regulator submission portals" },
    { value: "known-consumer-storage", label: "Known consumer storage" },
    { value: "personal-email-providers", label: "Personal email providers" },
    { value: "code-hosting", label: "Code hosting" },
    { value: "unclassified-hosts", label: "Unclassified hosts" },
  ],

  // Removable media "Registered as" open dropdown (563:4823).
  removableTargets: [
    { value: "it-issued-encrypted-usb", label: "IT-issued encrypted USB" },
    { value: "lab-capture-drives", label: "Lab capture drives" },
    { value: "courier-hand-off-media", label: "Courier hand-off media" },
    { value: "staff-registered-drives", label: "Staff-registered drives" },
    { value: "unregistered-hardware", label: "Unregistered hardware" },
  ],

  // Print "Printer is" states (563:7670).
  printerTargets: [
    { value: "unknown", label: "Unknown" },
    { value: "authorized", label: "Authorized" },
  ],

  // Desktop apps picker (563:10405): the frame draws each app as a plain
  // checkbox + name, with no logo artwork at all. Rather than fabricate
  // per-brand marks, every row shares one neutral `application` glyph and is
  // distinguished by its label text; a real per-app brand-asset pass is
  // future design work (see app-icon-definitions.ts and the task report).
  applications: [
    { value: "whatsapp", label: "WhatsApp", icon: "application" },
    { value: "signal", label: "Signal", icon: "application" },
    { value: "telegram", label: "Telegram", icon: "application" },
    { value: "slack", label: "Slack", icon: "application" },
    { value: "microsoft-teams", label: "Microsoft Teams", icon: "application" },
  ],

  // "Do this" / "Do this instead" fallback action list, consistent across the
  // Clipboard/Removable/Print/Desktop channel screens (and matching the
  // existing gateway `actionLabels`). A rougher, inconsistent variant
  // ("Audit only-engine default", "Warn & Justify") appears only in the
  // generic top-level "Applies to" mockup family; this uses the
  // channel-specific, already-tested casing.
  actions: [
    { value: "AuditOnly", label: "Audit only" },
    { value: "WarnJustify", label: "Warn & justify" },
    { value: "BlockWithOverride", label: "Block with override" },
    { value: "Block", label: "Block" },
  ],

  // "Deploy as" open menu (Draft-1/2/3: 397:15047, 397:15048, 397:15406) —
  // matches the existing gateway `policyStateSchema`/`stateLabel` exactly.
  deployStates: [
    { value: "Draft", label: "Draft" },
    { value: "Active", label: "Active" },
    { value: "Off", label: "Off" },
  ],
};

export async function getPolicyFixtures(): Promise<readonly PolicyListItem[]> {
  return POLICY_FIXTURES;
}

export async function getPolicyCatalogs(): Promise<PolicyCatalogs> {
  return POLICY_CATALOGS;
}
