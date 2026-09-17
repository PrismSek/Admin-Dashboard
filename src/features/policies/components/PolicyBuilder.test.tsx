// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { PolicyBuilder } from "@/features/policies/components/PolicyBuilder";
import type { PolicyCatalogs } from "@/features/policies/types";

/**
 * Synthetic, schema-shaped catalogs — independent of the real `data.ts`
 * fixture (server-only, so it cannot be imported into this jsdom test; see
 * `PolicyList.test.tsx` for the same pattern). Every catalog required by
 * `PolicyCatalogs` is populated, even the ones this test doesn't exercise,
 * so the type stays honest.
 */
const POLICY_CATALOGS: PolicyCatalogs = {
  audiences: [
    { value: "all-managed-devices", label: "All Managed Devices" },
    { value: "finance-all-stuff", label: "Finance-All Stuff" },
    { value: "engineering-contractors", label: "Engineering Contractors" },
  ],
  channels: [
    { value: "clipboard", label: "Clipboard", icon: "clipboard" },
    { value: "removable-media", label: "Removable media", icon: "removable-media" },
    { value: "print", label: "Print", icon: "print" },
    { value: "desktop-apps", label: "Desktop apps", icon: "desktop-apps" },
  ],
  findings: [
    { value: "aadhaar-number", label: "Aadhaar number" },
    { value: "customer-record", label: "Customer record" },
  ],
  confidences: [
    { value: "High", label: "High confidence" },
    { value: "Medium", label: "Medium or better" },
    { value: "Low", label: "Any confidence" },
  ],
  pasteTargets: [
    { value: "messengers", label: "Messengers", category: "apps" },
    { value: "collaboration-apps", label: "Collaboration apps", category: "apps" },
  ],
  deviceClasses: [
    { value: "personal-or-unrecognised", label: "Personal or unrecognised" },
    { value: "any-device", label: "Any Device" },
  ],
  transfers: [
    { value: "copy", label: "copy to the device" },
    { value: "read", label: "read off the device" },
    { value: "any", label: "any transfer" },
  ],
  removableTargets: [
    { value: "it-issued-encrypted-usb", label: "IT-issued encrypted USB" },
    { value: "lab-capture-drives", label: "Lab capture drives" },
  ],
  printerTargets: [
    { value: "unknown", label: "Unknown" },
    { value: "authorized", label: "Authorized" },
  ],
  applications: [
    { value: "whatsapp", label: "WhatsApp", icon: "application" },
    { value: "google-chrome", label: "Google Chrome", icon: "application" },
  ],
  actions: [
    { value: "AuditOnly", label: "Audit only" },
    { value: "WarnJustify", label: "Warn & justify" },
    { value: "BlockWithOverride", label: "Block with override" },
    { value: "Block", label: "Block" },
  ],
  deployStates: [
    { value: "Draft", label: "Draft" },
    { value: "Active", label: "Active" },
    { value: "Off", label: "Off" },
  ],
};

/**
 * Each channel's Data step shows exactly one distinguishing control — the
 * other three channels' controls must not be in the document at all (not
 * just visually hidden), since `PolicyDataStep` renders a single channel
 * editor at a time. Labels are the real `content.ts` copy transcribed from
 * each channel's Figma frame (`ClipboardConditions`/`RemovableMediaConditions`/
 * `PrintConditions`/`DesktopAppConditions`), not the task brief's sample
 * strings ("Destination class"/"Device target"/"Printer target"/
 * "Applications"), which don't match any real label in this builder.
 */
const CHANNEL_DATA_MATRIX = [
  ["Clipboard", "Paste into"],
  ["Removable media", "Registered as"],
  ["Print", "Printer is"],
  ["Desktop apps", "App is"],
] as const;
const ALL_DISTINGUISHING_LABELS = CHANNEL_DATA_MATRIX.map(([, label]) => label);

describe("PolicyBuilder", () => {
  it("opens with an empty policy name showing the hint placeholder", () => {
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    const nameField = screen.getByRole("textbox", { name: "Policy name" });
    expect(nameField).toHaveValue("");
    expect(nameField).toHaveAttribute("placeholder", "Enter name for your new policy");
  });

  it("opens with no example policy data prefilled", () => {
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    // The default "Audit only" action shows the person nothing, so the MESSAGE
    // block (reason code / they see) isn't rendered at all — no example to leak.
    expect(screen.queryByRole("textbox", { name: "Reason code" })).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "They see" })).not.toBeInTheDocument();

    // Nothing is pre-selected: every choice dropdown opens on its placeholder and
    // no remediation radio is checked.
    expect(screen.getByRole("combobox", { name: "Do this" })).toHaveTextContent("Choose one…");
    expect(screen.getByRole("combobox", { name: "Tell the team via" })).toHaveTextContent("Choose one…");
    expect(screen.getByRole("combobox", { name: "Deploy as:" })).toHaveTextContent("Choose one…");
    for (const radio of screen.getAllByRole("radio")) expect(radio).not.toBeChecked();

    // None of the transcribed example strings survive anywhere on the form.
    expect(screen.queryByDisplayValue(/Block Aadhaar to personal cloud/i)).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue(/DLP-PII-EGRESS/i)).not.toBeInTheDocument();
  });

  it("shows the default PASTE TARGET block before any channel is chosen", () => {
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    // The channel starts unselected — it reads "Select channel"…
    expect(screen.getByRole("combobox", { name: "Channel" })).toHaveTextContent("Select channel");

    // …yet the Conditions card still shows the clipboard PASTE TARGET block the
    // way every Figma "Create a policy" frame draws it: "Paste into" + "Fires
    // when", not just the CONTENT block. The old "Class is" pill is gone.
    expect(screen.getByText("PASTE TARGET")).toBeVisible();
    expect(screen.getByText("Paste into")).toBeVisible();
    expect(screen.getByText("Fires when")).toBeVisible();
    expect(screen.queryByText("Class is")).not.toBeInTheDocument();
  });

  it("shows the print PRINTER control opening unanswered, offering Unknown and Authorized, and no exception field", async () => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    await user.click(screen.getByRole("combobox", { name: "Channel" }));
    await user.click(screen.getByRole("option", { name: "Print" }));

    // "Printer is" opens on its placeholder — nothing is pre-selected.
    expect(screen.getByRole("combobox", { name: "Printer is" })).toHaveTextContent("Choose one…");

    // Both printer targets from the artifact's dropdown are offered.
    await user.click(screen.getByRole("combobox", { name: "Printer is" }));
    expect(screen.getByRole("option", { name: "Unknown" })).toBeVisible();
    expect(screen.getByRole("option", { name: "Authorized" })).toBeVisible();

    // Print's Conditions card carries no EXCEPTION field — the escape hatch is
    // edited in the Enforcement step, which shows nothing under "Audit only".
    expect(screen.queryByRole("button", { name: "Add exception" })).not.toBeInTheDocument();
  });

  it("shows the removable-media DEVICE controls: device class, registration, transfer", async () => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    await user.click(screen.getByRole("combobox", { name: "Channel" }));
    await user.click(screen.getByRole("option", { name: "Removable media" }));

    expect(screen.getByText("Device is")).toBeVisible();
    expect(screen.getByText("Registered as")).toBeVisible();
    expect(screen.getByText("Transfer is")).toBeVisible();
  });

  it("edits identity, audience, and channel without losing values", async () => {
    const user = userEvent.setup();
    const { container } = render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    await user.clear(screen.getByRole("textbox", { name: "Policy name" }));
    await user.type(screen.getByRole("textbox", { name: "Policy name" }), "Clipboard protection");

    await user.click(screen.getByRole("combobox", { name: "Applies to" }));
    await user.click(screen.getByRole("option", { name: /Finance/ }));

    await user.click(screen.getByRole("combobox", { name: "Channel" }));
    await user.click(screen.getByRole("option", { name: "Print" }));

    expect(screen.getByRole("combobox", { name: "Channel" })).toHaveTextContent("Print");
    expect(screen.getByRole("textbox", { name: "Policy name" })).toHaveValue("Clipboard protection");

    expect((await axe(container)).violations).toEqual([]);
  });

  it.each(CHANNEL_DATA_MATRIX)("shows only %s's Data controls", async (channelLabel, visibleLabel) => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    await user.click(screen.getByRole("combobox", { name: "Channel" }));
    await user.click(screen.getByRole("option", { name: channelLabel }));

    expect(screen.getByText(visibleLabel)).toBeVisible();
    for (const other of ALL_DISTINGUISHING_LABELS.filter((label) => label !== visibleLabel)) {
      expect(screen.queryByText(other)).not.toBeInTheDocument();
    }
  });

  it("shows the desktop-apps APP controls: App is operator, apps multi-select, Fires when", async () => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    await user.click(screen.getByRole("combobox", { name: "Channel" }));
    await user.click(screen.getByRole("option", { name: "Desktop apps" }));

    // "App is" — the match operator opens unanswered and offers both operators.
    expect(screen.getByRole("combobox", { name: "App is" })).toHaveTextContent("Choose one…");
    await user.click(screen.getByRole("combobox", { name: "App is" }));
    expect(screen.getByRole("option", { name: "one of" })).toBeVisible();
    expect(screen.getByRole("option", { name: "not one of" })).toBeVisible();
    await user.keyboard("{Escape}");

    // Apps — a checkbox-per-row multi-select over the app catalog.
    await user.click(screen.getByRole("button", { name: "Applications" }));
    expect(screen.getByRole("option", { name: "WhatsApp" })).toBeVisible();
    expect(screen.getByRole("option", { name: "Google Chrome" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Done" }));

    // "Fires when" — opens unanswered and offers every trigger.
    expect(screen.getByRole("combobox", { name: "Fires when" })).toHaveTextContent("Choose one…");
    await user.click(screen.getByRole("combobox", { name: "Fires when" }));
    expect(screen.getByRole("option", { name: "text is pasted" })).toBeVisible();
    expect(screen.getByRole("option", { name: "anything moves" })).toBeVisible();
    await user.keyboard("{Escape}");

    // The APP card carries no EXCEPTION field (edited in the Enforcement step).
    expect(screen.queryByRole("button", { name: "Add exception" })).not.toBeInTheDocument();
  });

  it("retains Desktop Apps selections after switching channels away and back", async () => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    await user.click(screen.getByRole("combobox", { name: "Channel" }));
    await user.click(screen.getByRole("option", { name: "Desktop apps" }));

    await user.click(screen.getByRole("button", { name: "Applications" }));
    await user.click(screen.getByRole("option", { name: "Google Chrome" }));
    await user.click(screen.getByRole("button", { name: "Done" }));

    await user.click(screen.getByRole("combobox", { name: "Channel" }));
    await user.click(screen.getByRole("option", { name: "Print" }));

    await user.click(screen.getByRole("combobox", { name: "Channel" }));
    await user.click(screen.getByRole("option", { name: "Desktop apps" }));

    await user.click(screen.getByRole("button", { name: "Applications" }));
    expect(screen.getByRole("option", { name: "Google Chrome" })).toHaveAttribute("aria-selected", "true");
  });

  it("sets the enforcement action and required onUnknown fallback", async () => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    await user.click(screen.getByRole("combobox", { name: "Do this" }));
    await user.click(screen.getByRole("option", { name: "Audit only" }));
    expect(screen.getByRole("combobox", { name: "Do this" })).toHaveTextContent("Audit only");

    await user.click(screen.getByRole("combobox", { name: "Do this instead" }));
    await user.click(screen.getByRole("option", { name: "Block with override" }));
    expect(screen.getByRole("combobox", { name: "Do this instead" })).toHaveTextContent("Block with override");
  });

  it("labels the onUnknown fallback's audit option as the engine default, distinct from the action", async () => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    // ACTION's "Do this" uses the plain "Audit only" label…
    await user.click(screen.getByRole("combobox", { name: "Do this" }));
    expect(screen.getByRole("option", { name: "Audit only" })).toBeVisible();
    expect(screen.queryByRole("option", { name: "Audit only - engine default" })).not.toBeInTheDocument();
    await user.keyboard("{Escape}");

    // …while the "If we can't tell" fallback marks it as the engine default.
    await user.click(screen.getByRole("combobox", { name: "Do this instead" }));
    expect(screen.getByRole("option", { name: "Audit only - engine default" })).toBeVisible();
    expect(screen.queryByRole("option", { name: "Audit only" })).not.toBeInTheDocument();
  });

  it("renders the enforcement pills without their helper sub-notes", async () => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    // The unanswered fallback shows only the REQUIRED badge — no amber sentence.
    expect(screen.queryByText(/Mandatory\. Left unset/)).not.toBeInTheDocument();

    // The EXCEPTION escape hatch (revealed by an interrupting action) carries no
    // explanatory note under its pill either.
    await user.click(screen.getByRole("combobox", { name: "Channel" }));
    await user.click(screen.getByRole("option", { name: "Desktop apps" }));
    await user.click(screen.getByRole("combobox", { name: "Do this" }));
    await user.click(screen.getByRole("option", { name: "Block" }));
    expect(screen.getByRole("combobox", { name: "Let it through if" })).toBeVisible();
    expect(screen.queryByText(/No way through/)).not.toBeInTheDocument();
  });

  it("shows the EXCEPTION escape hatch for clipboard too, keeping the Enforcement UI uniform", async () => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    // Pick clipboard explicitly, then an interrupting action so the escape hatch
    // is relevant.
    await user.click(screen.getByRole("combobox", { name: "Channel" }));
    await user.click(screen.getByRole("option", { name: "Clipboard" }));
    await user.click(screen.getByRole("combobox", { name: "Do this" }));
    await user.click(screen.getByRole("option", { name: "Block" }));

    // Clipboard now carries the same EXCEPTION row as the other channels.
    const exception = screen.getByRole("combobox", { name: "Let it through if" });
    expect(exception).toBeVisible();
    await user.click(exception);
    expect(screen.getByRole("option", { name: "never — no exception" })).toBeVisible();
    expect(screen.getByRole("option", { name: "the destination is a managed app" })).toBeVisible();
  });

  it("reveals the MESSAGE block when the onUnknown fallback interrupts, even under Audit only", async () => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    // Action stays the default "Audit only" (shows the person nothing), so the
    // MESSAGE block is hidden to start.
    expect(screen.queryByRole("textbox", { name: "Reason code" })).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "They see" })).not.toBeInTheDocument();

    // Choosing an interrupting "If we can't tell" fallback still shows the
    // person a message, so the MESSAGE block appears.
    await user.click(screen.getByRole("combobox", { name: "Do this instead" }));
    await user.click(screen.getByRole("option", { name: "Block with override" }));

    expect(screen.getByRole("textbox", { name: "Reason code" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "They see" })).toBeInTheDocument();
  });

  it("picks a remediation and delivery channel for the end-user notification", async () => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    // Starts with no remediation chosen at all…
    expect(screen.getByRole("radio", { name: "None" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Remove public link" })).not.toBeChecked();

    // …choosing one selects it, and the "Reads as —" line follows.
    await user.click(screen.getByRole("radio", { name: "Remove public link" }));
    expect(screen.getByRole("radio", { name: "Remove public link" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "None" })).not.toBeChecked();
    expect(
      screen.getByText(/Public links on the related resources are revoked automatically/),
    ).toBeVisible();

    // The delivery channel is its own pill; switching it away from None sticks.
    await user.click(screen.getByRole("combobox", { name: "Tell the team via" }));
    await user.click(screen.getByRole("option", { name: "Slack" }));
    expect(screen.getByRole("combobox", { name: "Tell the team via" })).toHaveTextContent("Slack");
  });

  it("badges each remediation with the integrations it touches", () => {
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    // Scoped to the remediation radio group so the "Slack"/"Teams" here are the
    // integration badges, not the "Tell the team via" channel options.
    const group = screen.getByRole("radiogroup", { name: "When issue is detected, do this" });
    expect(within(group).getByText("Slack")).toBeVisible();
    expect(within(group).getByText("Teams")).toBeVisible();
    // Remove-public-link and Apply-label both touch Google Workspace + Microsoft 365.
    expect(within(group).getAllByText("Google Workspace")).toHaveLength(2);
    expect(within(group).getAllByText("Microsoft 365")).toHaveLength(2);
  });
});
