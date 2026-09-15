// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { beforeAll, expect, it, vi } from "vitest";

import { IncidentDrawer } from "@/features/issues/components/incident-drawer";
import { getIncident } from "@/features/issues/data";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

// Some jsdom builds ship the modal-dialog methods as no-op stubs that throw;
// make them inert so `showModal()` in the drawer's effect doesn't crash.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close() {
    this.open = false;
  };
});

async function renderDrawer() {
  const incident = await getIncident("INC-2026-4471");
  expect(incident).not.toBeNull();
  if (!incident) throw new Error("fixture missing");
  return render(<IncidentDrawer incident={incident} closeHref="/issues" />);
}

it("opens on Overview with the case record and a gated resolve", async () => {
  await renderDrawer();
  expect(screen.getByText("Case record")).toBeVisible();
  expect(screen.getByText("Aisha Sharma")).toBeVisible();
  expect(screen.getByRole("button", { name: "Resolve incident" })).toBeDisabled();
});

it("switches to the evidence and trail tabs", async () => {
  await renderDrawer();
  fireEvent.click(screen.getByRole("button", { name: /What happened & evidence/ }));
  expect(screen.getByText("Files zipped into one 22.9 MB archive")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: /^Trail/ }));
  expect(screen.getByText("PrismSek raised this incident automatically")).toBeVisible();
});

it("toggles the raw log and the contain menu", async () => {
  await renderDrawer();
  fireEvent.click(screen.getByRole("button", { name: "Show" }));
  expect(screen.getByText(/agent=FIN-LT-017/)).toBeVisible();

  fireEvent.click(screen.getByRole("button", { name: "Containment" }));
  expect(screen.getByText("Isolate the endpoint")).toBeVisible();
});

it("enables resolve once a disposition is chosen", async () => {
  await renderDrawer();
  const resolve = screen.getByRole("button", { name: "Resolve incident" });
  expect(resolve).toBeDisabled();
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "False positive" } });
  expect(resolve).toBeEnabled();
});

it("has no axe violations", async () => {
  const { container } = await renderDrawer();
  expect((await axe(container)).violations).toEqual([]);
});
