"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { AppIcon } from "@/components/icons/AppIcon";
import { FieldError } from "@/components/ui/form-field";
import { policyBuilderContent } from "@/features/policies/content";
import type { ApplicationOption } from "@/features/policies/types";
import { cn } from "@/lib/utils";

const data = policyBuilderContent.data;

export type ApplicationSelectProps = {
  value: readonly string[];
  options: readonly ApplicationOption[];
  onChange: (value: string[]) => void;
  error?: string;
};

/**
 * Desktop apps channel's "App is" multi-select (Figma `563:10405` — a
 * checkbox-per-row popover: WhatsApp/Signal/Telegram/Slack/Microsoft Teams,
 * "Clear"/"Done"). Unlike `PolicySelect`'s single-select combobox pattern
 * (focus stays on the trigger, `aria-activedescendant` tracks the active
 * row), a multi-select listbox moves DOM focus *into* the listbox itself —
 * the ARIA APG's own recommended pattern for `aria-multiselectable` — so
 * Up/Down/Space/Enter act on whichever option has roving focus, and Escape
 * closes the popup and returns focus to the trigger button.
 */
export function ApplicationSelect({ value, options, onChange, error }: ApplicationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const baseId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const labelId = `${baseId}-label`;
  const listboxId = `${baseId}-listbox`;
  const errorId = `${baseId}-error`;

  const close = useCallback((restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  function open() {
    setActiveIndex(0);
    setIsOpen(true);
  }

  useEffect(() => {
    if (isOpen) listRef.current?.focus();
  }, [isOpen]);

  // Outside pointerdown closes the popup, mirroring PolicySelect.
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (listRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, close]);

  function toggle(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((entry) => entry !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
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

  const selectedLabels = options.filter((option) => value.includes(option.value)).map((option) => option.label);

  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className="text-body font-medium text-label">
        {data.appIsLabel}
      </span>

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-describedby={error ? errorId : undefined}
          onClick={() => (isOpen ? close() : open())}
          className={cn(
            "flex h-select-control w-full items-center gap-2 rounded-app border px-3",
            "bg-chrome text-app text-strong transition-colors duration-150",
            "border-hair-strong hover:bg-hover",
            "focus-visible:outline-none focus-visible:border-brand-accent",
            isOpen && "border-brand-accent",
            error && "border-danger",
          )}
        >
          <AppIcon name="application" className="size-app-icon shrink-0 text-dim" />
          {data.chooseApplications}
        </button>

        {isOpen ? (
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            aria-labelledby={labelId}
            aria-activedescendant={options[activeIndex] ? `${baseId}-option-${activeIndex}` : undefined}
            tabIndex={0}
            onKeyDown={handleListKeyDown}
            className="absolute z-10 mt-1.5 max-h-72 w-full min-w-56 overflow-auto border border-dropdown-border bg-chrome py-1 shadow-dropdown outline-none"
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
                    "mx-1 flex h-dropdown-row cursor-pointer items-center gap-2 rounded-dropdown-row px-2.5",
                    "text-app text-strong",
                    active && "bg-dropdown-row-active-bg",
                  )}
                >
                  <AppIcon name={option.icon} className="size-app-icon shrink-0 text-dim" />
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {selected ? <AppIcon name="check" className="size-app-icon shrink-0 text-brand-accent" /> : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <p className="text-meta text-dim">
        {selectedLabels.length > 0 ? data.selectedApplicationsSummary(selectedLabels) : data.noApplicationsSelected}
      </p>

      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
