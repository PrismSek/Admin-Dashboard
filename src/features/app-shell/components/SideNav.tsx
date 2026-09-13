"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef } from "react";

import { AppIcon } from "@/components/icons/AppIcon";
import { CurrentUserSummary } from "@/features/app-shell/components/CurrentUserSummary";
import { SignOutButton } from "@/features/app-shell/components/SignOutButton";
import { appShellContent, appShellRoutes } from "@/features/app-shell/content";
import type { CurrentUser } from "@/features/app-shell/data";
import { appNavigation } from "@/features/app-shell/nav";
import { cn } from "@/lib/utils";

/** True when `pathname` is the item's route or somewhere beneath it. */
function isWithin(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const rowBase =
  "flex items-center gap-nav-gap px-nav-inline py-nav-block text-nav transition-colors";
const rowIdle = "text-nav-idle hover:bg-nav-surface";
const rowActive = "bg-nav-surface text-nav-accent";

/**
 * Primary sidebar — dark chrome, identity block, then the flat Figma
 * navigation list (node 398:16105), with Help Centre and Log out pinned to
 * the bottom.
 *
 * Below the `lg` breakpoint this same nav becomes a fixed, `aria-modal`
 * overlay: `isOpen`/`onClose` are owned by `AppShell` (opened from
 * `ContentHeader`'s menu button) and are meaningless at the desktop column,
 * which always renders in place.
 *
 * Client-side because active state comes from the current pathname, which a
 * server layout cannot see.
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
        "z-40 flex h-dvh w-app-sidebar shrink-0 flex-col overflow-y-auto bg-nav-bg",
        "fixed inset-y-0 left-0 -translate-x-full transition-transform duration-200 ease-out",
        "lg:static lg:h-full lg:translate-x-0 lg:transition-none",
        isOpen && "translate-x-0",
      )}
    >
      <CurrentUserSummary user={user} />

      <ul className="flex-1 overflow-y-auto py-2">
        {appNavigation.map((item) => {
          const active = isWithin(item.href, pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={onClose}
                className={cn(rowBase, active ? rowActive : rowIdle)}
              >
                <AppIcon name={item.icon} className="size-app-icon shrink-0" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-nav-divider py-2">
        <Link href={appShellRoutes.helpCentre} onClick={onClose} className={cn(rowBase, rowIdle)}>
          <AppIcon name="help" className="size-app-icon shrink-0" />
          {appShellContent.helpCentre}
        </Link>
        <SignOutButton className={cn(rowBase, rowIdle, "w-full text-left")}>
          <AppIcon name="logout" className="size-app-icon shrink-0" />
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
