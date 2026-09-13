// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { expect, it, vi } from "vitest";

import { SideNav } from "@/features/app-shell/components/SideNav";

// SideNav composes SignOutButton, which reads `useRouter` from the same
// module — stub both so the render doesn't crash on a missing export.
vi.mock("next/navigation", () => ({
  usePathname: () => "/policies",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

it("marks Policies active in the flat Figma navigation", async () => {
  const { container } = render(
    <SideNav user={{ name: "Jae Sanders", email: "jae@example.com", initials: "JS", role: "Org Owner" }} />,
  );
  expect(screen.getByRole("link", { name: "Policies" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByText("Dashboard")).toBeVisible();
  expect(screen.getByText("Issues")).toBeVisible();
  expect(screen.queryByText("OVERVIEW")).not.toBeInTheDocument();
  expect((await axe(container)).violations).toEqual([]);
});
