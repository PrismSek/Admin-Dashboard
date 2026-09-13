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
  applications: [{ value: "whatsapp", label: "WhatsApp", icon: "application" }],
  actions: [{ value: "Block", label: "Block" }],
  deployStates: [{ value: "Draft", label: "Draft" }],
};

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
});
