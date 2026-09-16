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
  /** Muted hint shown in the trigger while nothing is selected (`value` matches
   * no option) — e.g. "Select channel". */
  placeholder?: string;
  /** Extra classes for the control's root, used to give a select a fixed width
   * so its trigger doesn't resize to the selected label (`PolicyWhereStep`). */
  className?: string;
  /** Inline "pill" rendering used inside the Conditions card — the label sits
   * inside the trigger as a muted leading segment (`Class is │ value ▾`) rather
   * than stacked above it (Figma `396:4874` / `396:4885`). */
  pill?: boolean;
  /** A `pill` variant with no border or fill of its own, so it nests inside
   * another bordered pill (the confidence segment sitting inside the CONTENT
   * row's finding pill). */
  bare?: boolean;
  /** When set, the open popup gains a filter input that narrows the options by
   * label (Figma's "Search channels" — 396:6437). */
  searchable?: boolean;
  /** Accessible name + placeholder for the filter input when `searchable`. */
  searchPlaceholder?: string;
  /** Names the control by `aria-label` instead of a visible label: a `pill`
   * select drops its leading label segment (the finding confidence — "High
   * confidence"), and a standard select drops its stacked label above the
   * trigger (used where the label is drawn separately, e.g. the Channel row's
   * badge sitting inline with the dropdown). */
  ariaLabel?: string;
};

/**
 * Accessible listbox select — the Figma "…drop down" menu family (e.g. node
 * 397:15024 Draft/Active/Off, 396:4985 Applies to). A native `<select>` can't
 * reproduce those open/hover/active states, so this reimplements the ARIA
 * 1.2 "select-only combobox" pattern: focus stays on the trigger button the
 * whole time it's open, and `aria-activedescendant` tracks the active row
 * instead of moving DOM focus into the popup.
 *
 * With `searchable`, the popup gains a filter input that takes focus while open
 * and carries the `aria-activedescendant` instead of the trigger; the option
 * list narrows to labels matching the typed query.
 */
export function PolicySelect({
  id,
  label,
  value,
  options,
  onChange,
  error,
  placeholder,
  className,
  pill = false,
  bare = false,
  searchable = false,
  searchPlaceholder,
  ariaLabel,
}: PolicySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [query, setQuery] = useState("");

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const labelId = `${id}-label`;
  const listboxId = `${id}-listbox`;
  const errorId = `${id}-error`;

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = selectedIndex === -1 ? undefined : options[selectedIndex];

  // The rows the popup actually shows. Only `searchable` selects filter; every
  // other select keeps the full list, so `visibleOptions === options` there.
  const normalizedQuery = query.trim().toLowerCase();
  const visibleOptions =
    searchable && isOpen && normalizedQuery
      ? options.filter((option) => option.label.toLowerCase().includes(normalizedQuery))
      : options;
  const activeOption = visibleOptions[activeIndex];
  const activeDescendant = isOpen && activeOption ? `${id}-option-${activeIndex}` : undefined;

  const close = useCallback((restoreFocus = false) => {
    setIsOpen(false);
    setQuery("");
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const open = useCallback(() => {
    setQuery("");
    setActiveIndex(selectedIndex === -1 ? 0 : selectedIndex);
    setIsOpen(true);
  }, [selectedIndex]);

  const commit = useCallback(
    (index: number) => {
      const option = visibleOptions[index];
      if (option) onChange(option.value);
      close(true);
    },
    [visibleOptions, onChange, close],
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

  // Move DOM focus into the filter input when a searchable popup opens.
  useEffect(() => {
    if (isOpen && searchable) inputRef.current?.focus();
  }, [isOpen, searchable]);

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

  function moveActive(delta: number) {
    setActiveIndex((current) => Math.min(Math.max(current + delta, 0), Math.max(visibleOptions.length - 1, 0)));
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
      return;
    }

    // A searchable popup moves focus to its input, which owns navigation.
    if (searchable) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActive(-1);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(visibleOptions.length - 1);
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

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActive(-1);
        break;
      case "Enter":
        event.preventDefault();
        if (activeOption) commit(activeIndex);
        break;
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

  const sharedButtonProps = {
    ref: triggerRef,
    id,
    type: "button" as const,
    role: "combobox" as const,
    "aria-haspopup": "listbox" as const,
    "aria-labelledby": ariaLabel ? undefined : labelId,
    "aria-label": ariaLabel,
    "aria-expanded": isOpen,
    "aria-controls": listboxId,
    "aria-activedescendant": searchable ? undefined : activeDescendant,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
    onClick: handleTriggerClick,
    onKeyDown: handleTriggerKeyDown,
  };

  const popup = isOpen ? (
    <div
      ref={popupRef}
      className={cn(
        "absolute z-10 mt-1.5 overflow-hidden border border-dropdown-border bg-chrome shadow-dropdown",
        pill ? "w-max min-w-full max-w-xs" : "w-full",
      )}
    >
      {searchable ? (
        <div className="border-b border-hair p-1.5">
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded
            aria-controls={listboxId}
            aria-activedescendant={activeDescendant}
            aria-autocomplete="list"
            aria-label={searchPlaceholder ?? label}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              // Typing narrows the list, so snap the active row back to the top.
              setActiveIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={searchPlaceholder}
            className="h-select-control w-full rounded-app border border-hair-strong bg-surface px-2.5 text-app text-strong outline-none placeholder:text-subtle focus:border-brand-accent"
          />
        </div>
      ) : null}

      <ul
        id={listboxId}
        role="listbox"
        aria-labelledby={ariaLabel ? undefined : labelId}
        aria-label={ariaLabel}
        className="max-h-72 overflow-auto py-1"
      >
        {visibleOptions.map((option, index) => {
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
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              {selected ? <AppIcon name="check" className="size-app-icon shrink-0 text-brand-accent" /> : null}
            </li>
          );
        })}
        {visibleOptions.length === 0 ? (
          <li className="mx-1 flex h-dropdown-row items-center px-2.5 text-meta text-dim">No matches</li>
        ) : null}
      </ul>
    </div>
  ) : null;

  if (pill) {
    // Inline pill: the label is a muted leading segment inside the trigger,
    // divided from the value — the closed "Class is │ value ▾" control drawn in
    // the Conditions card. No stacked label above it.
    return (
      <div className={cn("inline-flex flex-col gap-1", className)}>
        <div className="relative inline-block">
          <button
            {...sharedButtonProps}
            className={cn(
              "inline-flex h-select-control max-w-full items-center gap-2.5 rounded-app pl-3 pr-2.5",
              "text-app transition-colors duration-150",
              "focus-visible:outline-none",
              bare
                ? "hover:bg-hover"
                : [
                    "border bg-chrome border-hair-strong hover:bg-hover",
                    "focus-visible:border-brand-accent",
                    isOpen && "border-brand-accent",
                    error && "border-danger",
                  ],
            )}
          >
            {ariaLabel ? null : (
              <>
                <span id={labelId} className="shrink-0 text-dim">
                  {label}
                </span>
                <span aria-hidden className="h-4 w-px shrink-0 bg-hair-strong" />
              </>
            )}
            <span className={cn("truncate", selectedOption ? "text-strong" : "text-subtle")}>
              {selectedOption ? selectedOption.label : placeholder ?? ""}
            </span>
            <AppIcon
              name="chevron-down"
              className={cn(
                "size-app-icon shrink-0 text-dim transition-transform duration-150",
                isOpen && "rotate-180",
              )}
            />
          </button>
          {popup}
        </div>
        {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {ariaLabel ? null : (
        <span id={labelId} className="text-body font-medium text-label">
          {label}
        </span>
      )}

      <div className="relative">
        <button
          {...sharedButtonProps}
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
            {selectedOption ? (
              <span className="truncate">{selectedOption.label}</span>
            ) : (
              <span className="truncate text-subtle">{placeholder ?? ""}</span>
            )}
          </span>
          <AppIcon
            name="chevron-down"
            className={cn("size-app-icon shrink-0 text-dim transition-transform duration-150", isOpen && "rotate-180")}
          />
        </button>

        {popup}
      </div>

      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
