// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";

import { DeployWizard } from "@/features/deployment/components/deploy-wizard";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close() {
    this.open = false;
  };
});

it("advances through the three wizard steps and back", () => {
  render(<DeployWizard />);

  fireEvent.click(screen.getByRole("button", { name: /Deploy Agent/ }));
  expect(screen.getByText("How do you want to deploy?")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByText("Who gets an invitation?")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByText("Review and launch")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Launch deployment" })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  expect(screen.getByText("Who gets an invitation?")).toBeInTheDocument();
});

it("selects a different method on step one", () => {
  render(<DeployWizard />);
  fireEvent.click(screen.getByRole("button", { name: /Deploy Agent/ }));

  const intune = screen.getByRole("button", { name: /Microsoft Intune/ });
  expect(intune).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(intune);
  expect(intune).toHaveAttribute("aria-pressed", "true");
});
