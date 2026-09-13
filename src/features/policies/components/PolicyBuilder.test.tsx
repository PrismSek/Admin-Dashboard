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
  findings: [{ value: "aadhaar-number", label: "Aadhaar number" }],
  destinationClasses: [{ value: "personal-or-foreign", label: "Personal or foreign" }],
  collections: [{ value: "sanctioned-cloud-storage", label: "Sanctioned cloud storage" }],
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
  ["Clipboard", "Class is"],
  ["Removable media", "Registered as"],
  ["Print", "Printer is"],
  ["Desktop apps", "App is"],
] as const;
const ALL_DISTINGUISHING_LABELS = CHANNEL_DATA_MATRIX.map(([, label]) => label);

describe("PolicyBuilder", () => {
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

  it("disables the notification fields without discarding their value", async () => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    const titleField = screen.getByRole("textbox", { name: "Notification title" });
    const originalTitle = titleField.getAttribute("value") ?? (titleField as HTMLInputElement).value;
    expect(titleField).toBeEnabled();

    await user.click(screen.getByRole("checkbox", { name: "Notify the end user" }));
    expect(titleField).toBeDisabled();
    expect(titleField).toHaveValue(originalTitle);

    await user.click(screen.getByRole("checkbox", { name: "Notify the end user" }));
    expect(titleField).toBeEnabled();
    expect(titleField).toHaveValue(originalTitle);
  });
});
