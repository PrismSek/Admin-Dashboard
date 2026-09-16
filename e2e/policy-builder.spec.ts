import { expect, test, type Page } from "@playwright/test";

import { authenticate } from "./authenticated-page";
import { policyBuilderContent, policyBuilderSteps, policyListContent } from "../src/features/policies/content";

/**
 * Authenticated coverage for the Policy builder (`/policies/new`, Figma
 * `396:4444` and its channel-specific frame families). The builder has no
 * create-policy API yet (`policyBuilderContent.finish.localOnlyNotice`) — a
 * "valid submit" only flips local UI state, so this suite also proves that
 * submitting never fabricates a row in the (still server-fixture-backed)
 * Policy list.
 */

/** Opens a `PolicySelect` combobox by its trigger id and commits one option. */
async function chooseFromPolicySelect(page: Page, triggerId: string, optionLabel: string) {
  await page.locator(`#${triggerId}`).click();
  await page.locator(`#${triggerId}-listbox`).getByRole("option", { name: optionLabel, exact: true }).click();
}

test.describe("Policy builder — channel-specific Data step", () => {
  test("each channel shows only its own condition controls", async ({ page }) => {
    await authenticate(page.context());
    await page.goto("/policies/new");

    const dataSection = page.getByRole("region", { name: "Data" });

    // Default channel is Clipboard (authoring-defaults.ts).
    await expect(dataSection.getByRole("combobox", { name: "Paste into" })).toBeVisible();
    await expect(dataSection.getByRole("combobox", { name: "Fires when" })).toBeVisible();
    await expect(dataSection.getByRole("combobox", { name: "Registered as" })).toHaveCount(0);
    await expect(dataSection.getByRole("combobox", { name: "Printer is" })).toHaveCount(0);
    await expect(dataSection.getByRole("button", { name: "Choose applications" })).toHaveCount(0);

    await chooseFromPolicySelect(page, "policy-where-channel", "Removable media");
    await expect(dataSection.getByRole("combobox", { name: "Registered as" })).toBeVisible();
    await expect(dataSection.getByRole("combobox", { name: "Paste into" })).toHaveCount(0);
    await expect(dataSection.getByRole("combobox", { name: "Printer is" })).toHaveCount(0);
    await expect(dataSection.getByRole("button", { name: "Choose applications" })).toHaveCount(0);

    await chooseFromPolicySelect(page, "policy-where-channel", "Print");
    await expect(dataSection.getByRole("combobox", { name: "Printer is" })).toBeVisible();
    await expect(dataSection.getByRole("combobox", { name: "Paste into" })).toHaveCount(0);
    await expect(dataSection.getByRole("combobox", { name: "Registered as" })).toHaveCount(0);
    await expect(dataSection.getByRole("button", { name: "Choose applications" })).toHaveCount(0);

    await chooseFromPolicySelect(page, "policy-where-channel", "Desktop apps");
    await expect(dataSection.getByRole("button", { name: "Choose applications" })).toBeVisible();
    await expect(dataSection.getByRole("combobox", { name: "Paste into" })).toHaveCount(0);
    await expect(dataSection.getByRole("combobox", { name: "Registered as" })).toHaveCount(0);
    await expect(dataSection.getByRole("combobox", { name: "Printer is" })).toHaveCount(0);
  });
});

test.describe("Policy builder — field families", () => {
  test("Applies-to, Required, clipboard Destination/Collection, app-selection, JSON preview, and Deploy-as", async ({
    page,
  }) => {
    await authenticate(page.context());
    await page.goto("/policies/new");

    // Applies to (Who step).
    await chooseFromPolicySelect(page, "policy-who-appliesTo", "Engineering Contractors");
    await expect(page.locator("#policy-who-appliesTo")).toHaveText(/Engineering Contractors/);

    // Required / "Do this instead" (Enforcement step).
    await chooseFromPolicySelect(page, "policy-enforcement-onUnknown", "Audit only");
    await expect(page.locator("#policy-enforcement-onUnknown")).toHaveText(/Audit only/);

    // Clipboard PASTE TARGET row (Data step; channel is still the default
    // "clipboard"): the "Paste into" operator pill ("one of") next to a
    // category-tagged targets multi-select summarising as "any target".
    await expect(page.locator("#policy-data-clipboard-target-op")).toHaveText(/one of/);
    const targetSelect = page.getByRole("button", { name: policyBuilderContent.data.targetSelectLabel });
    await expect(targetSelect).toContainText(policyBuilderContent.data.anyTarget);
    // Open the multi-select and pick one target; the trigger then summarises it.
    await targetSelect.click();
    await page
      .getByRole("listbox", { name: policyBuilderContent.data.targetSelectLabel })
      .getByRole("option", { name: /Messengers/ })
      .click();
    await page.keyboard.press("Escape");
    await expect(targetSelect).toContainText("Messengers");

    // Desktop apps' multi-select (switch channel, then add one more app).
    await chooseFromPolicySelect(page, "policy-where-channel", "Desktop apps");
    const appsTrigger = page.getByRole("button", { name: policyBuilderContent.data.chooseApplications });
    await appsTrigger.click();
    await page.getByRole("listbox").getByRole("option", { name: "Telegram", exact: true }).click();
    await page.keyboard.press("Escape");
    await expect(
      page.getByText(policyBuilderContent.data.selectedApplicationsSummary(["WhatsApp", "Signal", "Telegram"])),
    ).toBeVisible();

    // JSON preview dialog — opens as `role=dialog`, closes and restores focus.
    const viewJsonButton = page.getByRole("button", { name: policyBuilderContent.finish.viewJson });
    await viewJsonButton.click();
    const jsonDialog = page.getByRole("dialog", { name: policyBuilderContent.jsonTitle });
    await expect(jsonDialog).toBeVisible();
    await expect(jsonDialog.locator("pre")).toContainText('"channel"');
    await jsonDialog.getByRole("button", { name: policyBuilderContent.closeJson }).click();
    await expect(jsonDialog).toHaveCount(0);
    await expect(viewJsonButton).toBeFocused();

    // Deploy as (Finish step).
    await chooseFromPolicySelect(page, "policy-finish-deployAs", "Active");
    await expect(page.locator("#policy-finish-deployAs")).toHaveText(/Active/);
  });
});

test.describe("Policy builder — keyboard-only journey", () => {
  test("Tab/Shift+Tab, Space, arrows, Enter, and Escape; focus returns after menus and dialogs", async ({ page }) => {
    await authenticate(page.context());
    await page.goto("/policies/new");
    // A real native-Tab sequence (unlike a scripted `.click()`) is computed
    // live by the browser; starting it in the brief window before `next
    // dev`'s dev-mode overlay/HMR client finishes settling has been observed
    // to yield a transient, non-representative focus order. Settle first.
    await page.waitForLoadState("networkidle");

    const appliesTo = page.locator("#policy-who-appliesTo");
    const channel = page.locator("#policy-where-channel");

    // Tab / Shift+Tab move focus between adjacent controls.
    await appliesTo.focus();
    await page.keyboard.press("Tab");
    await expect(appliesTo).not.toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(appliesTo).toBeFocused();

    // Space opens the popup; ArrowDown moves the active option; Escape closes
    // WITHOUT committing, and returns focus to the trigger.
    const initialAppliesToLabel = await appliesTo.innerText();
    await page.keyboard.press("Space");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(appliesTo).toBeFocused();
    await expect(appliesTo).toHaveText(initialAppliesToLabel);

    // Enter opens the Channel combobox; ArrowDown + Enter commits a
    // selection and refocuses the trigger.
    await channel.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(channel).toBeFocused();
    await expect(channel).toHaveText(/Removable media/);

    // The JSON dialog: Enter opens it from a focused button; Escape closes
    // it and restores focus to that same button.
    const viewJsonButton = page.getByRole("button", { name: policyBuilderContent.finish.viewJson });
    await viewJsonButton.focus();
    await page.keyboard.press("Enter");
    const jsonDialog = page.getByRole("dialog", { name: policyBuilderContent.jsonTitle });
    await expect(jsonDialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(jsonDialog).toHaveCount(0);
    await expect(viewJsonButton).toBeFocused();
  });
});

test.describe("Policy builder — submit", () => {
  test("completing a valid policy shows the local-only confirmation and persists nothing", async ({ page }) => {
    await authenticate(page.context());
    await page.goto("/policies/new");

    // The unedited defaults already satisfy the schema for every channel
    // (authoring-defaults.ts) — touch the Deploy-as field so this is a real
    // interaction, then submit.
    await chooseFromPolicySelect(page, "policy-finish-deployAs", "Active");

    const createButton = page.getByRole("button", { name: policyBuilderContent.finish.create });
    await createButton.click();

    await expect(
      page.getByRole("status").filter({ hasText: policyBuilderContent.finish.localOnlyNotice }),
    ).toBeVisible();
    await expect(createButton).toHaveCount(0);

    // Reload the list from its server fixture: still 16 rows (15 fixture
    // rows + 1 header row) — nothing was persisted.
    await page.goto("/policies");
    await expect(page.getByRole("table", { name: policyListContent.title }).getByRole("row")).toHaveCount(16);
  });
});

test.describe("Policy builder — narrow (390px)", () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== "narrow", "narrow-only behavior");
  });

  test("no horizontal overflow, and every step section stays reachable", async ({ page }) => {
    await authenticate(page.context());
    await page.goto("/policies/new");

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    // The step rail `<aside>` is `hidden lg:block` — a desktop-only
    // orientation aid, not a paged wizard's controls — so every section stays
    // in the document and reachable by scrolling regardless of viewport.
    for (const step of policyBuilderSteps) {
      const section = page.getByRole("region", { name: step.title });
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeVisible();
    }
  });
});
