// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { ApplicationSelect } from "@/features/policies/components/ApplicationSelect";
import type { ApplicationOption } from "@/features/policies/types";

const OPTIONS: readonly ApplicationOption[] = [
  { value: "whatsapp", label: "WhatsApp", icon: "application" },
  { value: "signal", label: "Signal", icon: "application" },
  { value: "slack", label: "Slack", icon: "application" },
];

describe("ApplicationSelect", () => {
  it("opens an aria-multiselectable listbox reflecting the current value", async () => {
    const user = userEvent.setup();
    render(<ApplicationSelect value={["whatsapp"]} options={OPTIONS} onChange={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Choose applications" }));

    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    expect(screen.getByRole("option", { name: "WhatsApp" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: "Signal" })).toHaveAttribute("aria-selected", "false");
  });

  it("Space toggles the active option on, reporting the full array via onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ApplicationSelect value={["whatsapp"]} options={OPTIONS} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Choose applications" }));
    await user.keyboard("{ArrowDown}"); // WhatsApp (0) -> Signal (1)
    await user.keyboard(" ");

    expect(onChange).toHaveBeenCalledWith(["whatsapp", "signal"]);
  });

  it("Space toggles a selected option off", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ApplicationSelect value={["whatsapp"]} options={OPTIONS} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Choose applications" }));
    await user.keyboard(" "); // active option starts at WhatsApp (0)

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("clicking an option toggles it the same way as Space", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ApplicationSelect value={["whatsapp", "signal"]} options={OPTIONS} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Choose applications" }));
    await user.click(screen.getByRole("option", { name: "Signal" }));

    expect(onChange).toHaveBeenCalledWith(["whatsapp"]);
  });

  it("closes with Escape and restores focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<ApplicationSelect value={[]} options={OPTIONS} onChange={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: "Choose applications" });

    await user.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("shows a visible selected-apps summary that updates with the value", () => {
    const { rerender } = render(<ApplicationSelect value={[]} options={OPTIONS} onChange={vi.fn()} />);
    expect(screen.getByText("No apps selected")).toBeInTheDocument();

    rerender(<ApplicationSelect value={["whatsapp", "signal"]} options={OPTIONS} onChange={vi.fn()} />);
    expect(screen.getByText("Selected: WhatsApp, Signal")).toBeInTheDocument();
  });

  it("wires the error message via aria-describedby", () => {
    render(<ApplicationSelect value={[]} options={OPTIONS} onChange={vi.fn()} error="Choose at least one app" />);
    const trigger = screen.getByRole("button", { name: "Choose applications" });
    const describedBy = trigger.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(screen.getByText("Choose at least one app").id).toBe(describedBy);
  });

  it("is axe-clean closed and open", async () => {
    const user = userEvent.setup();
    const { container } = render(<ApplicationSelect value={["whatsapp"]} options={OPTIONS} onChange={vi.fn()} />);
    expect((await axe(container)).violations).toEqual([]);

    await user.click(screen.getByRole("button", { name: "Choose applications" }));
    expect((await axe(container)).violations).toEqual([]);
  });
});
