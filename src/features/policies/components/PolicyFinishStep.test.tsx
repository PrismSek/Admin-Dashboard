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
  deviceClasses: [{ value: "personal-or-unrecognised", label: "Personal or unrecognised" }],
  transfers: [{ value: "copy", label: "copy to the device" }],
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

/**
 * Answers every required choice so the form satisfies `policyAuthoringSchema`:
 * identity, audience, a channel and its own dropdowns, the conditions, the
 * action and its required "If we can't tell" fallback, the notification
 * choices, and the deploy state. "Audit only" shows the person nothing, so the
 * MESSAGE block stays hidden and isn't required. Both Create and View JSON gate
 * on this same completeness, so tests that need either enabled fill the form
 * with this helper first.
 */
async function completeValidPolicy(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole("textbox", { name: "Policy name" }), "Clipboard protection");

  await user.click(screen.getByRole("combobox", { name: "Applies to" }));
  await user.click(screen.getByRole("option", { name: "Finance-All Stuff" }));

  await user.click(screen.getByRole("combobox", { name: "Channel" }));
  await user.click(screen.getByRole("option", { name: "Clipboard" }));

  await user.click(screen.getByRole("combobox", { name: "Paste into" }));
  await user.click(screen.getByRole("option", { name: "one of" }));
  await user.click(screen.getByRole("combobox", { name: "Fires when" }));
  await user.click(screen.getByRole("option", { name: "text is pasted" }));
  await user.click(screen.getByRole("button", { name: "Any content" }));

  await user.click(screen.getByRole("combobox", { name: "Do this" }));
  await user.click(screen.getByRole("option", { name: "Audit only" }));
  // In this dropdown the audit option is labelled as the engine default
  // (distinct from the ACTION's plain "Audit only").
  await user.click(screen.getByRole("combobox", { name: "Do this instead" }));
  await user.click(screen.getByRole("option", { name: "Audit only - engine default" }));

  await user.click(screen.getByRole("combobox", { name: "Tell the team via" }));
  await user.click(screen.getByRole("option", { name: "None" }));
  await user.click(screen.getByRole("radio", { name: "None" }));

  await user.click(screen.getByRole("combobox", { name: "Deploy as:" }));
  await user.click(screen.getByRole("option", { name: "Draft" }));
}

describe("PolicyFinishStep (via PolicyBuilder)", () => {
  it("keeps Create disabled until every required field is filled, then enables it", async () => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    const create = screen.getByRole("button", { name: "Create" });

    // A brand-new policy is missing its name, audience, channel and the required
    // "If we can't tell" fallback, so Create is not clickable.
    expect(create).toBeDisabled();

    // Filling the required fields one at a time never enables it early — it
    // stays disabled until the last one is answered.
    await user.type(screen.getByRole("textbox", { name: "Policy name" }), "Clipboard protection");
    expect(create).toBeDisabled();

    await user.click(screen.getByRole("combobox", { name: "Applies to" }));
    await user.click(screen.getByRole("option", { name: "Finance-All Stuff" }));
    expect(create).toBeDisabled();

    await user.click(screen.getByRole("combobox", { name: "Channel" }));
    await user.click(screen.getByRole("option", { name: "Clipboard" }));
    expect(create).toBeDisabled();

    // Nothing is pre-selected, so the clipboard channel's own dropdowns need
    // answering too; "Any content" clears the conditions requirement.
    await user.click(screen.getByRole("combobox", { name: "Paste into" }));
    await user.click(screen.getByRole("option", { name: "one of" }));
    await user.click(screen.getByRole("combobox", { name: "Fires when" }));
    await user.click(screen.getByRole("option", { name: "text is pasted" }));
    await user.click(screen.getByRole("button", { name: "Any content" }));
    expect(create).toBeDisabled();

    // Enforcement: the action and the required fallback.
    await user.click(screen.getByRole("combobox", { name: "Do this" }));
    await user.click(screen.getByRole("option", { name: "Audit only" }));
    await user.click(screen.getByRole("combobox", { name: "Do this instead" }));
    await user.click(screen.getByRole("option", { name: "Audit only - engine default" }));
    expect(create).toBeDisabled();

    // Notification: delivery channel and remediation.
    await user.click(screen.getByRole("combobox", { name: "Tell the team via" }));
    await user.click(screen.getByRole("option", { name: "None" }));
    await user.click(screen.getByRole("radio", { name: "None" }));
    expect(create).toBeDisabled();

    // Answering the last required field — the deploy state — flips Create to enabled.
    await user.click(screen.getByRole("combobox", { name: "Deploy as:" }));
    await user.click(screen.getByRole("option", { name: "Draft" }));
    expect(create).toBeEnabled();
  });

  it("surfaces the friendly name-required message when the name is left blank", async () => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    // `mode: "onBlur"` — touching then leaving the empty name field validates it,
    // and the builder's resolver swaps zod's default for the friendlier copy.
    await user.click(screen.getByRole("textbox", { name: "Policy name" }));
    await user.tab();

    expect(await screen.findByText("Enter a policy name")).toBeVisible();
  });

  it.each(["Draft", "Active", "Off"])("selects the %s deploy state", async (deployAs) => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    await user.click(screen.getByRole("combobox", { name: "Deploy as:" }));
    await user.click(screen.getByRole("option", { name: deployAs }));

    expect(screen.getByRole("combobox", { name: "Deploy as:" })).toHaveTextContent(deployAs);
  });

  it("keeps View JSON disabled until every required field is filled, then enables it", async () => {
    const user = userEvent.setup();
    render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    // View JSON shares Create's completeness gate, so a brand-new policy — which
    // would serialize to a half-filled, non-parseable object — cannot open the
    // preview until the form is valid.
    expect(screen.getByRole("button", { name: "View JSON" })).toBeDisabled();

    await completeValidPolicy(user);

    expect(screen.getByRole("button", { name: "View JSON" })).toBeEnabled();
  });

  it("opens sanitized JSON and restores focus on close", async () => {
    const user = userEvent.setup();
    const { container } = render(<PolicyBuilder catalogs={POLICY_CATALOGS} />);

    // View JSON only opens once the form is complete (it shares Create's gate).
    await completeValidPolicy(user);

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

    await completeValidPolicy(user);

    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "This preview is validated locally. It is not saved until a policy-creation API exists.",
    );
    expect(screen.queryByRole("button", { name: "Create" })).not.toBeInTheDocument();
  });
});
