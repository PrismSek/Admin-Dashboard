"use client";

import { ChevronDown, ChevronRight, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { SignOutButton } from "@/features/app-shell/components/sign-out-button";
import { navSections, type NavItem } from "@/features/app-shell/nav";
import { cn } from "@/lib/utils";

/** True when `pathname` is the item's route or somewhere beneath it. */
function isWithin(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const rowBase =
  "flex w-full items-center gap-2.5 px-[18px] py-3 text-left text-nav transition-colors";
const rowIdle = "text-nav-idle hover:bg-nav-surface";
const rowActive = "text-nav-accent"; // teal, no fill — matches Figma

const subRowBase = "flex items-center py-2 pl-[34px] pr-[18px] text-nav-sub transition-colors";

/**
 * Primary sidebar — dark navy chrome grouped into labelled sections
 * (Figma, 2026-08-25).
 *
 * Client-side because active state comes from the current pathname, which a
 * server layout cannot see.
 *
 * Expanding a group and navigating are separate actions: the group header is a
 * button that only opens or closes its list, and the child links do the
 * navigating. Clicking "Settings" reveals its pages without leaving the page
 * you are on.
 */
export function SideNav() {
  const pathname = usePathname();

  const allItems = navSections.flatMap((section) => section.items);
  const activeGroup = allItems.find(
    (item) => item.children && isWithin(item.href, pathname),
  )?.href;

  const [openGroups, setOpenGroups] = useState<string[]>(() =>
    activeGroup ? [activeGroup] : [],
  );

  // Open the group you have just navigated into, without re-opening one you
  // deliberately collapsed while staying inside it.
  const previousActiveGroup = useRef(activeGroup);
  useEffect(() => {
    if (activeGroup && activeGroup !== previousActiveGroup.current) {
      setOpenGroups((groups) =>
        groups.includes(activeGroup) ? groups : [...groups, activeGroup],
      );
    }
    previousActiveGroup.current = activeGroup;
  }, [activeGroup]);

  const toggleGroup = (href: string) =>
    setOpenGroups((groups) =>
      groups.includes(href) ? groups.filter((entry) => entry !== href) : [...groups, href],
    );

  return (
    <nav
      aria-label="Main"
      className="flex w-58 shrink-0 flex-col overflow-y-auto bg-nav-bg pb-4"
    >
      {navSections.map((section, index) => (
        <div key={section.label} className={cn(index > 0 && "mt-[18px] border-t border-nav-divider")}>
          <p className="px-[18px] pt-5 pb-2 text-nav-section font-semibold tracking-wider text-nav-label uppercase">
            {section.label}
          </p>
          <ul>
            {section.items.map((item) => (
              <NavEntry
                key={item.href}
                item={item}
                pathname={pathname}
                isOpen={openGroups.includes(item.href)}
                onToggle={() => toggleGroup(item.href)}
              />
            ))}
            {index === navSections.length - 1 ? (
              <li>
                <SignOutButton className={cn(rowBase, rowIdle)}>
                  <span aria-hidden className="w-[9px] shrink-0" />
                  <LogOut aria-hidden className="size-[18px] shrink-0" />
                  Log out
                </SignOutButton>
              </li>
            ) : null}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function NavEntry({
  item,
  pathname,
  isOpen,
  onToggle,
}: {
  item: NavItem;
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const submenuId = useId();
  const Icon = item.icon;
  const containsRoute = isWithin(item.href, pathname);

  const caret = (
    <span aria-hidden className="flex w-[9px] shrink-0 items-center justify-center">
      {item.children ? (
        isOpen ? (
          <ChevronDown className="size-3" />
        ) : (
          <ChevronRight className="size-3" />
        )
      ) : null}
    </span>
  );

  if (!item.children) {
    return (
      <li>
        <Link
          href={item.href}
          aria-current={containsRoute ? "page" : undefined}
          className={cn(rowBase, containsRoute ? rowActive : rowIdle)}
        >
          {caret}
          <Icon aria-hidden className="size-[18px] shrink-0" />
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={submenuId}
        className={cn(rowBase, "cursor-pointer", containsRoute ? rowActive : rowIdle)}
      >
        {caret}
        <Icon aria-hidden className="size-[18px] shrink-0" />
        {item.label}
      </button>

      {isOpen ? (
        <ul id={submenuId}>
          {item.children.map((child) => {
            const isActive = isWithin(child.href, pathname);
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    subRowBase,
                    isActive
                      ? "bg-nav-surface text-nav-active-ink"
                      : "text-nav-idle hover:bg-nav-surface",
                  )}
                >
                  {child.label}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </li>
  );
}
