// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { PolicySelect, type PolicySelectOption } from "@/features/policies/components/PolicySelect";

const DEPLOY_OPTIONS: readonly PolicySelectOption[] = [
  { value: "Draft", label: "Draft" },
  { value: "Active", label: "Active" },
  { value: "Off", label: "Off" },
];

describe("PolicySelect", () => {
  it("opens, selects with arrows and Enter, and restores focus", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <PolicySelect id="deploy-as" label="Deploy as" value="Draft" options={DEPLOY_OPTIONS} onChange={onChange} />,
    );
    const trigger = screen.getByRole("combobox", { name: "Deploy as" });
    await user.click(trigger);
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith("Active");
    expect(trigger).toHaveFocus();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("closes with Escape without changing the value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PolicySelect id="deploy-as" label="Deploy as" value="Draft" options={DEPLOY_OPTIONS} onChange={onChange} />);
    await user.click(screen.getByRole("combobox", { name: "Deploy as" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("supports Home/End to jump to the first/last option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PolicySelect id="deploy-as" label="Deploy as" value="Draft" options={DEPLOY_OPTIONS} onChange={onChange} />);
    const trigger = screen.getByRole("combobox", { name: "Deploy as" });
    await user.click(trigger);
    await user.keyboard("{End}{Enter}");
    expect(onChange).toHaveBeenCalledWith("Off");

    onChange.mockClear();
    await user.click(trigger);
    await user.keyboard("{End}{Home}{Enter}");
    expect(onChange).toHaveBeenCalledWith("Draft");
  });

  it("closes on an outside pointerdown without changing the value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <div>
        <PolicySelect id="deploy-as" label="Deploy as" value="Draft" options={DEPLOY_OPTIONS} onChange={onChange} />
        <button type="button">outside</button>
      </div>,
    );
    await user.click(screen.getByRole("combobox", { name: "Deploy as" }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "outside" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("tracks the active option via aria-activedescendant and marks the selected option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PolicySelect id="deploy-as" label="Deploy as" value="Active" options={DEPLOY_OPTIONS} onChange={onChange} />);
    const trigger = screen.getByRole("combobox", { name: "Deploy as" });
    await user.click(trigger);

    const active = screen.getByRole("option", { name: "Active" });
    expect(active).toHaveAttribute("aria-selected", "true");
    expect(trigger).toHaveAttribute("aria-activedescendant", active.id);

    await user.keyboard("{ArrowDown}");
    const off = screen.getByRole("option", { name: "Off" });
    expect(trigger).toHaveAttribute("aria-activedescendant", off.id);
  });

  it("renders only the option label in the dropdown, never a description sub-line", async () => {
    const user = userEvent.setup();
    const OPTIONS_WITH_DESCRIPTION: readonly PolicySelectOption[] = [
      { value: "AuditOnly", label: "Audit only", description: "Let it through and record the event." },
      { value: "Block", label: "Block", description: "Stop it. There is no way through." },
    ];
    render(
      <PolicySelect id="action" label="Do this" value="AuditOnly" options={OPTIONS_WITH_DESCRIPTION} onChange={vi.fn()} />,
    );
    await user.click(screen.getByRole("combobox", { name: "Do this" }));

    // The label is still shown…
    expect(screen.getByRole("option", { name: /Audit only/ })).toBeInTheDocument();
    // …but the description sub-text is not rendered anywhere in the popup.
    expect(screen.queryByText("Let it through and record the event.")).not.toBeInTheDocument();
    expect(screen.queryByText("Stop it. There is no way through.")).not.toBeInTheDocument();
  });

  it("opens the popup upward when dropUp is set, so a bottom-of-page select stays in view", async () => {
    const user = userEvent.setup();
    render(
      <PolicySelect id="deploy-as" label="Deploy as" value="Draft" options={DEPLOY_OPTIONS} onChange={vi.fn()} dropUp />,
    );
    await user.click(screen.getByRole("combobox", { name: "Deploy as" }));

    // The popup wraps the listbox; dropUp anchors it to the trigger's top edge
    // (opening above) instead of dropping it below.
    const popup = screen.getByRole("listbox").parentElement;
    expect(popup).toHaveClass("bottom-full");
    expect(popup).not.toHaveClass("mt-1.5");
  });

  it("opens the popup downward by default", async () => {
    const user = userEvent.setup();
    render(<PolicySelect id="deploy-as" label="Deploy as" value="Draft" options={DEPLOY_OPTIONS} onChange={vi.fn()} />);
    await user.click(screen.getByRole("combobox", { name: "Deploy as" }));

    const popup = screen.getByRole("listbox").parentElement;
    expect(popup).toHaveClass("mt-1.5");
    expect(popup).not.toHaveClass("bottom-full");
  });

  it("wires the error message via aria-describedby and aria-invalid", () => {
    render(
      <PolicySelect
        id="deploy-as"
        label="Deploy as"
        value="Draft"
        options={DEPLOY_OPTIONS}
        onChange={vi.fn()}
        error="Pick a deployment state"
      />,
    );
    const trigger = screen.getByRole("combobox", { name: "Deploy as" });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    const describedBy = trigger.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(screen.getByText("Pick a deployment state").id).toBe(describedBy);
  });
});
