// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
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
  removableTargets: [{ value: "it-issued-encrypted-usb", label: "IT-issued encrypted USB" }],
  printerTargets: [{ value: "unknown", label: "Unknown" }],
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

    // The notification starts with no automated remediation and no channel.
    expect(screen.getByRole("radio", { name: "None" })).toBeChecked();
    expect(screen.getByRole("combobox", { name: "Tell the team via" })).toHaveTextContent("None");

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

  it("retains Desktop Apps selections after switching channels away and back", async () => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    await user.click(screen.getByRole("combobox", { name: "Channel" }));
    await user.click(screen.getByRole("option", { name: "Desktop apps" }));

    await user.click(screen.getByRole("button", { name: "Choose applications" }));
    await user.click(screen.getByRole("option", { name: "Google Chrome" }));

    await user.click(screen.getByRole("combobox", { name: "Channel" }));
    await user.click(screen.getByRole("option", { name: "Print" }));

    await user.click(screen.getByRole("combobox", { name: "Channel" }));
    await user.click(screen.getByRole("option", { name: "Desktop apps" }));

    await user.click(screen.getByRole("button", { name: "Choose applications" }));
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

    // Starts with no automated remediation…
    expect(screen.getByRole("radio", { name: "None" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Remove public link" })).not.toBeChecked();

    // …choosing one moves the selection, and the "Reads as —" line follows.
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
});
