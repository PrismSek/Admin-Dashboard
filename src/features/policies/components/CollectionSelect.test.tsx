// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { CollectionSelect } from "@/features/policies/components/CollectionSelect";
import { policyBuilderContent } from "@/features/policies/content";
import type { PolicyCatalogOption } from "@/features/policies/types";

const data = policyBuilderContent.data;

const OPTIONS: readonly PolicyCatalogOption[] = [
  { value: "sanctioned", label: "Sanctioned cloud storage" },
  { value: "regulator", label: "Regulator submission portals" },
  { value: "consumer", label: "Known consumer storage" },
];

/** Renders the picker and opens its popover, returning the trigger button. */
async function open(user: ReturnType<typeof userEvent.setup>) {
  const trigger = screen.getByRole("button", { name: data.targetSelectLabel });
  await user.click(trigger);
  return trigger;
}

describe("CollectionSelect", () => {
  it("opens an aria-multiselectable listbox reflecting the current value", async () => {
    const user = userEvent.setup();
    render(
      <CollectionSelect
        value={["sanctioned"]}
        options={OPTIONS}
        onChange={vi.fn()}
        summary="1 collection"
        ariaLabel={data.targetSelectLabel}
      />,
    );

    await open(user);

    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    expect(screen.getByRole("option", { name: "Sanctioned cloud storage" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: "Regulator submission portals" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("clicking a row toggles it, reporting the full array via onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CollectionSelect
        value={["sanctioned"]}
        options={OPTIONS}
        onChange={onChange}
        summary="1 collection"
        ariaLabel={data.targetSelectLabel}
      />,
    );

    await open(user);
    await user.click(screen.getByRole("option", { name: "Regulator submission portals" }));

    expect(onChange).toHaveBeenCalledWith(["sanctioned", "regulator"]);
  });

  it("Clear resets the whole selection to an empty array", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CollectionSelect
        value={["sanctioned", "regulator"]}
        options={OPTIONS}
        onChange={onChange}
        summary="2 collections"
        ariaLabel={data.targetSelectLabel}
      />,
    );

    await open(user);
    await user.click(screen.getByRole("button", { name: data.multiSelectClear }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("Done closes the popover and restores focus to the trigger", async () => {
    const user = userEvent.setup();
    render(
      <CollectionSelect
        value={["sanctioned"]}
        options={OPTIONS}
        onChange={vi.fn()}
        summary="1 collection"
        ariaLabel={data.targetSelectLabel}
      />,
    );

    const trigger = await open(user);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: data.multiSelectDone }));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes with Escape and restores focus to the trigger", async () => {
    const user = userEvent.setup();
    render(
      <CollectionSelect
        value={[]}
        options={OPTIONS}
        onChange={vi.fn()}
        summary={data.anyTarget}
        ariaLabel={data.targetSelectLabel}
      />,
    );

    const trigger = await open(user);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("renders each option's category tag when present", async () => {
    const user = userEvent.setup();
    const TAGGED: readonly PolicyCatalogOption[] = [
      { value: "messengers", label: "Messengers", category: "apps" },
      { value: "personal-webmail", label: "Personal webmail", category: "web" },
    ];
    render(
      <CollectionSelect
        value={[]}
        options={TAGGED}
        onChange={vi.fn()}
        summary={data.anyTarget}
        ariaLabel={data.targetSelectLabel}
      />,
    );

    await open(user);
    expect(screen.getByRole("option", { name: /Messengers/ })).toHaveTextContent("apps");
    expect(screen.getByRole("option", { name: /Personal webmail/ })).toHaveTextContent("web");
  });

  it("is axe-clean closed and open", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CollectionSelect
        value={["sanctioned"]}
        options={OPTIONS}
        onChange={vi.fn()}
        summary="1 collection"
        ariaLabel={data.targetSelectLabel}
      />,
    );
    expect((await axe(container)).violations).toEqual([]);

    await open(user);
    expect((await axe(container)).violations).toEqual([]);
  });
});
