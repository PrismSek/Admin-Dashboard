// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "@/features/app-shell/components/AppShell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/policies",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const user = { name: "Jae Sanders", email: "jae@example.com", initials: "JS", role: "Org Owner" };

async function openNav() {
  const events = userEvent.setup();
  render(
    <AppShell user={user}>
      <p>content</p>
    </AppShell>,
  );
  const menuButton = screen.getByRole("button", { name: "Open navigation" });
  await events.click(menuButton);
  return { events, menuButton };
}

describe("AppShell overlay navigation", () => {
  it("wires the menu button to the panel it discloses", async () => {
    render(
      <AppShell user={user}>
        <p>content</p>
      </AppShell>,
    );
    const menuButton = screen.getByRole("button", { name: "Open navigation" });
    const panel = screen.getByRole("navigation", { name: "Main" });
    expect(menuButton).toHaveAttribute("aria-controls", panel.id);
  });

  it("opens as an aria-modal dialog", async () => {
    await openNav();
    const panel = screen.getByRole("dialog", { name: "Main" });
    expect(panel).toHaveAttribute("aria-modal", "true");
  });

  it("closes on Escape and returns focus to the menu button", async () => {
    const { events, menuButton } = await openNav();
    await events.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(menuButton).toHaveFocus();
  });

  it("closes on backdrop click and returns focus to the menu button", async () => {
    const { events, menuButton } = await openNav();
    // The backdrop is a decorative, non-focusable click target — find it by
    // its fixed positioning class rather than a role.
    const backdrop = document.querySelector('[aria-hidden="true"].fixed.inset-0');
    expect(backdrop).not.toBeNull();
    await events.click(backdrop as Element);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(menuButton).toHaveFocus();
  });

  it("closes on nav-link activation and returns focus to the menu button", async () => {
    const { events, menuButton } = await openNav();
    await events.click(screen.getByRole("link", { name: "Dashboard" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(menuButton).toHaveFocus();
  });

  it("does not steal focus on first render", () => {
    render(
      <AppShell user={user}>
        <p>content</p>
      </AppShell>,
    );
    expect(document.body).toHaveFocus();
  });

  it("has no axe violations while open", async () => {
    const { container } = render(
      <AppShell user={user}>
        <p>content</p>
      </AppShell>,
    );
    const events = userEvent.setup();
    await events.click(screen.getByRole("button", { name: "Open navigation" }));
    expect((await axe(container)).violations).toEqual([]);
  });
});
