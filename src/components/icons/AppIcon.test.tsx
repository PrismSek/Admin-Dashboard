// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { AppIcon } from "@/components/icons/AppIcon";

describe("AppIcon", () => {
  it("hides a decorative vector from assistive technology", () => {
    const { container } = render(<AppIcon name="policy" />);

    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes an informative vector by its supplied label", async () => {
    const { container } = render(<AppIcon name="notification" label="Notifications" />);

    expect(screen.getByRole("img", { name: "Notifications" })).toBeVisible();
    expect((await axe(container)).violations).toEqual([]);
  });
});
