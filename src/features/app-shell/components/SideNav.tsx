"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { AppIcon } from "@/components/icons/AppIcon";
import { CurrentUserSummary } from "@/features/app-shell/components/CurrentUserSummary";
import { SignOutButton } from "@/features/app-shell/components/SignOutButton";
import { appShellContent, appShellRoutes } from "@/features/app-shell/content";
import type { CurrentUser } from "@/features/app-shell/data";
import { appNavigation, type NavGroup } from "@/features/app-shell/nav";
import { cn } from "@/lib/utils";

/** True when `pathname` is the item's route or somewhere beneath it. The
 *  root (`/`) matches only itself, never every route. */
function isWithin(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Shared row chrome (Figma 635:1239): 56px tall, 12px radius, 16px icon→label
 *  gap, 20px inline padding. Colours are layered on per state. */
const rowBase =
  "flex h-nav-row items-center gap-nav-gap rounded-nav-row px-nav-inline text-nav transition-colors";
/** A sub-item indents its label to 60px so it lines up under the parent's. */
const subRowBase =
  "flex h-nav-row items-center rounded-nav-row pl-nav-sub-inline pr-nav-inline text-nav transition-colors";
const rowIdle = "text-nav-ink-idle hover:bg-nav-hover-fill";
const rowActive = "nav-active text-nav-ink-active";

/** Idle rows tint the icon separately from the label (#959394 vs white/56%);
 *  active/open rows bring both to full white. */
function iconClass(active: boolean) {
  return cn("size-nav-icon shrink-0", active ? "text-nav-ink-active" : "text-nav-icon-idle");
}

/**
 * Primary sidebar — near-black rail with an identity block, the Figma
 * navigation (Dashboard/Issues/Policies leaves plus expandable Manage and
 * Settings groups, node 635:1239), and Help Centre / Log out pinned to the
 * bottom.
 *
 * Below the `lg` breakpoint this same nav becomes a fixed, `aria-modal`
 * overlay: `isOpen`/`onClose` are owned by `AppShell` (opened from
 * `ContentHeader`'s menu button) and are meaningless at the desktop column,
 * which always renders in place.
 *
 * Client-side because active state and group disclosure both come from the
 * current pathname, which a server layout cannot see.
 */
export function SideNav({
  user,
  isOpen = false,
  onClose,
  id,
}: {
  user: CurrentUser;
  isOpen?: boolean;
  onClose?: () => void;
  /** Shared with the menu button's `aria-controls` (owned by `AppShell`). */
  id?: string;
}) {
  const pathname = usePathname();
  const generatedId = useId();
  const panelId = id ?? generatedId;
  const dialogRef = useRef<HTMLDivElement>(null);

  // A group opens automatically when the route is inside it; a manual toggle
  // (keyed by label) overrides that for the current session.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const groupHasActiveChild = (group: NavGroup) =>
    group.children.some((child) => isWithin(child.href, pathname));

  useEffect(() => {
    if (!isOpen) return;

    // Move focus into the panel when it opens, matching the "aria-modal
    // overlay" contract — there is no obvious first field, so the dialog
    // wrapper itself is the sensible target (tabIndex={-1} below).
    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const nav = (
    <nav
      id={panelId}
      aria-label={appShellContent.mainNavLabel}
      className={cn(
        "z-40 flex h-dvh w-app-sidebar shrink-0 flex-col overflow-y-auto bg-nav-bg px-nav-edge py-nav-edge",
        "fixed inset-y-0 left-0 -translate-x-full transition-transform duration-200 ease-out",
        "lg:static lg:h-full lg:translate-x-0 lg:transition-none",
        isOpen && "translate-x-0",
      )}
    >
      <CurrentUserSummary user={user} />

      <ul className="flex-1">
        {appNavigation.map((item, index) => {
          if (item.kind === "leaf") {
            const active = isWithin(item.href, pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={onClose}
                  className={cn(rowBase, active ? rowActive : rowIdle)}
                >
                  <AppIcon name={item.icon} className={iconClass(active)} />
                  {item.label}
                </Link>
              </li>
            );
          }

          const open = toggled[item.label] ?? groupHasActiveChild(item);
          const groupId = `${panelId}-group-${index}`;
          return (
            <li key={item.label}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={groupId}
                onClick={() => setToggled((prev) => ({ ...prev, [item.label]: !open }))}
                className={cn(rowBase, "w-full", open ? "text-nav-ink-active" : rowIdle)}
              >
                <AppIcon name={item.icon} className={iconClass(open)} />
                <span className="flex-1 text-left">{item.label}</span>
                <AppIcon
                  name="chevron-down"
                  className={cn(
                    "size-nav-icon shrink-0 transition-transform duration-200",
                    open ? "" : "-rotate-90",
                  )}
                />
              </button>
              <ul id={groupId} hidden={!open}>
                {item.children.map((child) => {
                  const active = isWithin(child.href, pathname);
                  return (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        aria-current={active ? "page" : undefined}
                        onClick={onClose}
                        className={cn(subRowBase, active ? rowActive : rowIdle)}
                      >
                        {child.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>

      <div className="mt-nav-edge border-t border-nav-divider pt-nav-edge">
        <Link href={appShellRoutes.helpCentre} onClick={onClose} className={cn(rowBase, rowIdle)}>
          <AppIcon name="help" className={iconClass(false)} />
          {appShellContent.helpCentre}
        </Link>
        <SignOutButton className={cn(rowBase, rowIdle, "w-full text-left")}>
          <AppIcon name="logout" className={iconClass(false)} />
          {appShellContent.logOut}
        </SignOutButton>
      </div>
    </nav>
  );

  if (!isOpen) return nav;

  return (
    <>
      {/* Dismisses on pointer click; Escape (above) covers keyboard users,
          so this backdrop is deliberately not a focusable control. */}
      <div aria-hidden onClick={onClose} className="fixed inset-0 z-30 bg-overlay lg:hidden" />

      {/* `role="dialog"` lives on this wrapper, not the `<nav>` itself —
          `dialog` is not an allowed ARIA role on a `nav` element (axe:
          aria-allowed-role), and the landmark should stay a landmark. */}
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={appShellContent.mainNavLabel} tabIndex={-1}>
        {nav}
      </div>
    </>
  );
}
