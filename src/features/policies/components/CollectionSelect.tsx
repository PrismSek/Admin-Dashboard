"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { AppIcon } from "@/components/icons/AppIcon";
import { policyBuilderContent } from "@/features/policies/content";
import type { PolicyCatalogOption } from "@/features/policies/types";
import { cn } from "@/lib/utils";

const data = policyBuilderContent.data;

export type CollectionSelectProps = {
  value: readonly string[];
  options: readonly PolicyCatalogOption[];
  onChange: (value: string[]) => void;
  /** Text drawn in the trigger: "any collection" / a single label / "N collections". */
  summary: string;
  /** Accessible name for the control (the summary alone isn't self-describing). */
  ariaLabel: string;
};

/**
 * A pill-shaped multi-select (the clipboard "Paste into" targets) whose trigger
 * shows a summary ("any target" / "N targets") and whose popup is a
 * checkbox-per-row card list — each row optionally carrying a right-aligned
 * `category` tag — with a "Clear"/"Done" footer (Figma `563:10405`). Reused by
 * the clipboard paste targets, the removable-media registration lists, and the
 * desktop-apps picker. The accessible multi-select pattern is standard
 * (DOM focus moves into the listbox, roving `activeIndex`, Space/Enter toggles,
 * Escape closes and restores focus); the footer buttons are pointer conveniences
 * — everything they do is reachable from the keyboard (toggle each off = Clear,
 * Escape = Done). Rendered inline as a pill instead of a full-width field.
 */
export function CollectionSelect({ value, options, onChange, summary, ariaLabel }: CollectionSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const baseId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = `${baseId}-listbox`;

  const close = useCallback((restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (isOpen) listRef.current?.focus();
  }, [isOpen]);

  // Outside pointerdown closes the popup. The whole popover (list + footer) is
  // "inside" so a pointerdown on Clear/Done never closes before its click lands.
  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (popoverRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, close]);

  function toggle(optionValue: string) {
    onChange(value.includes(optionValue) ? value.filter((entry) => entry !== optionValue) : [...value, optionValue]);
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((current) => Math.min(current + 1, options.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case " ":
      case "Enter": {
        event.preventDefault();
        const option = options[activeIndex];
        if (option) toggle(option.value);
        break;
      }
      case "Escape":
        event.preventDefault();
        close(true);
        break;
      case "Tab":
        setIsOpen(false);
        break;
      default:
        break;
    }
  }

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        onClick={() => {
          setActiveIndex(0);
          setIsOpen((open) => !open);
        }}
        className={cn(
          "inline-flex h-select-control max-w-full items-center gap-2.5 rounded-app border pl-3 pr-2.5",
          "bg-chrome text-app text-strong transition-colors duration-150",
          "border-hair-strong hover:bg-hover focus-visible:outline-none focus-visible:border-brand-accent",
          isOpen && "border-brand-accent",
        )}
      >
        <span className="truncate">{summary}</span>
        <AppIcon name="chevron-down" className="size-app-icon shrink-0 text-dim" />
      </button>

      {isOpen ? (
        <div
          ref={popoverRef}
          className="absolute left-0 top-full z-10 mt-1.5 w-96 rounded-card border border-dropdown-border bg-chrome p-2 shadow-dropdown"
        >
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            aria-label={ariaLabel}
            aria-activedescendant={options[activeIndex] ? `${baseId}-option-${activeIndex}` : undefined}
            tabIndex={0}
            onKeyDown={handleListKeyDown}
            className="flex max-h-72 flex-col gap-1.5 overflow-auto outline-none"
          >
            {options.map((option, index) => {
              const selected = value.includes(option.value);
              const active = index === activeIndex;
              return (
                <li
                  key={option.value}
                  id={`${baseId}-option-${index}`}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => toggle(option.value)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-app border px-3 py-2.5 text-app text-strong transition-colors",
                    selected
                      ? "border-brand-accent bg-dropdown-row-active-bg"
                      : active
                        ? "border-brand-accent bg-hover"
                        : "border-hair-strong bg-chrome",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-app border p-0.5 transition-colors",
                      selected ? "border-brand-accent bg-brand-accent text-brand-fg" : "border-line-strong bg-chrome",
                    )}
                  >
                    {selected ? <AppIcon name="check" className="size-full" /> : null}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {option.category ? (
                    <span className="shrink-0 pl-2 text-meta text-dim">{option.category}</span>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
            <button
              type="button"
              onClick={() => onChange([])}
              className="rounded-app px-1.5 py-1 text-meta font-medium text-brand transition-colors hover:text-brand-hover"
            >
              {data.multiSelectClear}
            </button>
            <button
              type="button"
              onClick={() => close(true)}
              className="rounded-app bg-brand-accent px-3 py-1.5 text-meta font-medium text-brand-fg transition-colors hover:bg-brand-hover"
            >
              {data.multiSelectDone}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
