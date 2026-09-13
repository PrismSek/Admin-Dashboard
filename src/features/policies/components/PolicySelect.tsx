"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { FieldError } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";

export type PolicySelectOption = {
  value: string;
  label: string;
  description?: string;
  icon?: AppIconName;
};

export type PolicySelectProps = {
  id: string;
  label: string;
  value: string;
  options: readonly PolicySelectOption[];
  onChange: (value: string) => void;
  error?: string;
};

/**
 * Accessible listbox select — the Figma "…drop down" menu family (e.g. node
 * 397:15024 Draft/Active/Off, 396:4985 Applies to). A native `<select>` can't
 * reproduce those open/hover/active states, so this reimplements the ARIA
 * 1.2 "select-only combobox" pattern: focus stays on the trigger button the
 * whole time it's open, and `aria-activedescendant` tracks the active row
 * instead of moving DOM focus into the popup.
 */
export function PolicySelect({ id, label, value, options, onChange, error }: PolicySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLUListElement>(null);

  const labelId = `${id}-label`;
  const listboxId = `${id}-listbox`;
  const errorId = `${id}-error`;

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = selectedIndex === -1 ? undefined : options[selectedIndex];
  const activeOption = options[activeIndex];

  const close = useCallback((restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const open = useCallback(() => {
    setActiveIndex(selectedIndex === -1 ? 0 : selectedIndex);
    setIsOpen(true);
  }, [selectedIndex]);

  const commit = useCallback(
    (index: number) => {
      const option = options[index];
      if (option) onChange(option.value);
      close(true);
    },
    [options, onChange, close],
  );

  // Outside pointerdown closes the popup without touching the value —
  // mirrors a native <select>'s dismiss-on-click-away behavior.
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (popupRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, close]);

  // Keep the active row scrolled into view as arrow keys move it. jsdom has
  // no scrollIntoView implementation, so this is a no-op under test.
  useEffect(() => {
    if (!isOpen) return;
    const activeElement = document.getElementById(`${id}-option-${activeIndex}`);
    if (activeElement && typeof activeElement.scrollIntoView === "function") {
      activeElement.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, activeIndex, id]);

  function handleTriggerClick() {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
      return;
    }

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
      case "Enter":
      case " ":
        event.preventDefault();
        commit(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        close(true);
        break;
      case "Tab":
        // Let focus move to whatever is next; just drop the open state.
        setIsOpen(false);
        break;
      default:
        break;
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className="text-body font-medium text-label">
        {label}
      </span>

      <div className="relative">
        <button
          ref={triggerRef}
          id={id}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-labelledby={labelId}
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={isOpen && activeOption ? `${id}-option-${activeIndex}` : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            "flex h-select-control w-full items-center justify-between gap-2 rounded-app border px-3",
            "bg-chrome text-app text-strong transition-colors duration-150",
            "border-hair-strong hover:bg-hover",
            "focus-visible:outline-none focus-visible:border-brand-accent",
            isOpen && "border-brand-accent",
            error && "border-danger",
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selectedOption?.icon ? (
              <AppIcon name={selectedOption.icon} className="size-app-icon shrink-0 text-dim" />
            ) : null}
            <span className="truncate">{selectedOption?.label ?? ""}</span>
          </span>
          <AppIcon
            name="chevron-down"
            className={cn("size-app-icon shrink-0 text-dim transition-transform duration-150", isOpen && "rotate-180")}
          />
        </button>

        {isOpen ? (
          <ul
            ref={popupRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={labelId}
            className="absolute z-10 mt-1.5 max-h-72 w-full overflow-auto border border-dropdown-border bg-chrome py-1 shadow-dropdown"
          >
            {options.map((option, index) => {
              const selected = option.value === value;
              const active = index === activeIndex;

              return (
                <li
                  key={option.value}
                  id={`${id}-option-${index}`}
                  role="option"
                  aria-selected={selected}
                  onClick={() => commit(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "mx-1 flex h-dropdown-row cursor-pointer items-center gap-2 rounded-dropdown-row px-2.5",
                    "text-app text-strong",
                    active && "bg-dropdown-row-active-bg",
                  )}
                >
                  {option.icon ? <AppIcon name={option.icon} className="size-app-icon shrink-0 text-dim" /> : null}
                  <span className="min-w-0 flex-1 truncate">
                    <span className="block truncate">{option.label}</span>
                    {option.description ? (
                      <span className="block truncate text-meta text-dim">{option.description}</span>
                    ) : null}
                  </span>
                  {selected ? <AppIcon name="check" className="size-app-icon shrink-0 text-brand-accent" /> : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
