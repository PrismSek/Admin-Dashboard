// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "jest-axe";
import { beforeEach, expect, it, vi } from "vitest";

import { SideNav } from "@/features/app-shell/components/SideNav";

// `usePathname` drives both active state and which group auto-opens, so make
// it settable per test. `useRouter` is stubbed for the composed SignOutButton.
const { state } = vi.hoisted(() => ({ state: { pathname: "/policies" } }));
vi.mock("next/navigation", () => ({
  usePathname: () => state.pathname,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const user = { name: "Jae Sanders", email: "jae@example.com", initials: "JS", role: "Org Owner" };

beforeEach(() => {
  state.pathname = "/policies";
});

it("marks the active leaf and keeps groups collapsed on an unrelated route", async () => {
  const { container } = render(<SideNav user={user} />);

  expect(screen.getByRole("link", { name: "Policies" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByText("Dashboard")).toBeVisible();
  expect(screen.getByText("Issues")).toBeVisible();

  expect(screen.getByRole("button", { name: "Manage" })).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByRole("button", { name: "Settings" })).toHaveAttribute("aria-expanded", "false");
  // A collapsed group hides its sub-items rather than removing them.
  expect(screen.getByText("Domains")).not.toBeVisible();

  expect((await axe(container)).violations).toEqual([]);
});

it("auto-opens the group that owns the active route and marks the sub-item", () => {
  state.pathname = "/manage/domains";
  render(<SideNav user={user} />);

  expect(screen.getByRole("button", { name: "Manage" })).toHaveAttribute("aria-expanded", "true");
  const domains = screen.getByRole("link", { name: "Domains" });
  expect(domains).toBeVisible();
  expect(domains).toHaveAttribute("aria-current", "page");

  // The unrelated group stays shut.
  expect(screen.getByRole("button", { name: "Settings" })).toHaveAttribute("aria-expanded", "false");
});

it("opens the Settings group for a settings sub-route", () => {
  state.pathname = "/settings/sso";
  render(<SideNav user={user} />);

  expect(screen.getByRole("button", { name: "Settings" })).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("link", { name: "Authentication/SSO" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

it("toggles a group open on click", () => {
  render(<SideNav user={user} />);

  const manage = screen.getByRole("button", { name: "Manage" });
  expect(manage).toHaveAttribute("aria-expanded", "false");

  fireEvent.click(manage);

  expect(manage).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("link", { name: "Endpoints" })).toBeVisible();
  expect(screen.getByRole("link", { name: "Users and Groups" })).toBeVisible();
});
