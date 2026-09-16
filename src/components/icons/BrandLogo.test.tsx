// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BRAND_LOGO_NAMES, BrandLogo } from "@/components/icons/BrandLogo";

describe("BrandLogo", () => {
  it("renders the named brand mark as a decorative svg", () => {
    const { container } = render(<BrandLogo name="slack" className="size-4" />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    // Decorative — the badge's text label carries the meaning, so the mark is
    // hidden from assistive tech (no "Slack Slack" double-read).
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveClass("size-4");
  });

  it("renders every supported brand with its own coloured artwork", () => {
    for (const name of BRAND_LOGO_NAMES) {
      const { container } = render(<BrandLogo name={name} />);
      const svg = container.querySelector("svg");
      expect(svg, name).not.toBeNull();
      // Brand marks keep the vendor's own colours (not our tokens), so a real
      // `fill` attribute is present somewhere in the artwork.
      expect(container.querySelector("[fill]"), name).not.toBeNull();
    }
  });
});
