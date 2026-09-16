// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { PolicyBuilder } from "@/features/policies/components/PolicyBuilder";
import type { PolicyCatalogs } from "@/features/policies/types";

/**
 * Full, schema-shaped catalogs — same synthetic-fixture pattern as
 * `PolicyBuilder.test.tsx` (`data.ts` is server-only, so it cannot be
 * imported into this jsdom test). `actions` and `deployStates` carry every
 * real option (not just one) because these tests exercise the Enforcement
 * and Finish steps' selects across their full range.
 */
const POLICY_CATALOGS: PolicyCatalogs = {
  audiences: [{ value: "finance-all-stuff", label: "Finance-All Stuff" }],
  channels: [{ value: "clipboard", label: "Clipboard", icon: "clipboard" }],
  findings: [{ value: "aadhaar-number", label: "Aadhaar number" }],
  confidences: [
    { value: "High", label: "High confidence" },
    { value: "Low", label: "Any confidence" },
  ],
  pasteTargets: [{ value: "messengers", label: "Messengers", category: "apps" }],
  removableTargets: [{ value: "it-issued-encrypted-usb", label: "IT-issued encrypted USB" }],
  printerTargets: [{ value: "unknown", label: "Unknown" }],
  applications: [{ value: "whatsapp", label: "WhatsApp", icon: "application" }],
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

describe("PolicyFinishStep (via PolicyBuilder)", () => {
  it("shows required errors and moves focus to the first invalid field", async () => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    await user.clear(screen.getByRole("textbox", { name: "Policy name" }));
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Enter a policy name")).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Policy name" })).toHaveFocus();
  });

  it.each(["Draft", "Active", "Off"])("selects the %s deploy state", async (deployAs) => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    await user.click(screen.getByRole("combobox", { name: "Deploy as:" }));
    await user.click(screen.getByRole("option", { name: deployAs }));

    expect(screen.getByRole("combobox", { name: "Deploy as:" })).toHaveTextContent(deployAs);
  });

  it("opens sanitized JSON and restores focus on close", async () => {
    const user = userEvent.setup();
    const { container } = render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    const trigger = screen.getByRole("button", { name: "View JSON" });
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Policy JSON" });
    expect(dialog).toBeVisible();
    expect(screen.queryByText(/token|credential|tenantId/i)).not.toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("disarms the beforeunload guard before navigating away on confirmed Discard", async () => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    // Dirty the form so both the Cancel confirmation and the beforeunload
    // guard are armed.
    await user.type(screen.getByRole("textbox", { name: "Policy name" }), " v2");

    await user.click(screen.getByRole("link", { name: "Cancel" }));
    expect(screen.getByRole("alertdialog")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Discard" }));

    // If the fix regresses, this still-armed listener would call
    // `preventDefault`, which is exactly the native double-prompt on top of
    // the Discard confirmation the admin just gave.
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("submits a valid form and shows the local-only outcome instead of the button row", async () => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    // The form opens blank, so a valid submit means filling the required
    // fields first: identity, audience, a channel (which reveals its
    // Conditions card), that channel's destination, and the required
    // "If we can't tell" fallback. The default "Audit only" action shows the
    // person nothing, so the MESSAGE block (reason code / they see) is hidden
    // and not required.
    await user.type(screen.getByRole("textbox", { name: "Policy name" }), "Clipboard protection");

    await user.click(screen.getByRole("combobox", { name: "Applies to" }));
    await user.click(screen.getByRole("option", { name: "Finance-All Stuff" }));

    await user.click(screen.getByRole("combobox", { name: "Channel" }));
    await user.click(screen.getByRole("option", { name: "Clipboard" }));

    // Switch conditions to "Any content" so no finding is required. Clipboard's
    // PASTE TARGET defaults to "any target" (no required field), so nothing else
    // in the Data step needs filling.
    await user.click(screen.getByRole("button", { name: "Any content" }));

    // Answer the required "If we can't tell" fallback.
    await user.click(screen.getByRole("combobox", { name: "Do this instead" }));
    await user.click(screen.getByRole("option", { name: "Audit only" }));

    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "This preview is validated locally. It is not saved until a policy-creation API exists.",
    );
    expect(screen.queryByRole("button", { name: "Create" })).not.toBeInTheDocument();
  });
});
