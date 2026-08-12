"use client";

import { ChevronRight, ChevronUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { primaryNav, type NavItem } from "@/features/app-shell/nav";
import { cn } from "@/lib/utils";

/** True when `pathname` is the item's route or somewhere beneath it. */
function isWithin(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Primary sidebar.
 *
 * Client-side because active state comes from the current pathname, which a
 * server layout cannot see.
 *
 * Expanding a group and navigating are separate actions: the group header is a
 * button that only opens or closes its list, and the child links do the
 * navigating. Clicking "Manage" reveals the departments without leaving the
 * page you are on.
 */
export function SideNav() {
  const pathname = usePathname();

  // The group containing the current route, if any.
  const activeGroup = primaryNav.find(
    (item) => item.children && isWithin(item.href, pathname),
  )?.href;

  const [openGroups, setOpenGroups] = useState<string[]>(() =>
    activeGroup ? [activeGroup] : [],
  );

  // Opening the group you have just navigated into, without re-opening one you
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
    <nav aria-label="Main" className="w-[280px] shrink-0 border-r border-hair-strong bg-chrome py-4">
      <ul className="flex flex-col gap-0.5 px-3">
        {primaryNav.map((item) => (
          <NavEntry
            key={item.href}
            item={item}
            pathname={pathname}
            isOpen={openGroups.includes(item.href)}
            onToggle={() => toggleGroup(item.href)}
          />
        ))}
      </ul>
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

  if (!item.children) {
    return (
      <li>
        <Link
          href={item.href}
          aria-current={containsRoute ? "page" : undefined}
          className={cn(rowClasses, containsRoute ? activeRowClasses : idleRowClasses)}
        >
          {containsRoute ? <ActiveMarker /> : null}
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
        className={cn(
          rowClasses,
          "w-full cursor-pointer text-left",
          idleRowClasses,
          containsRoute && "font-semibold text-strong",
        )}
      >
        <Icon aria-hidden className="size-[18px] shrink-0" />
        {item.label}
        <span className="ml-auto text-dim">
          {isOpen ? (
            <ChevronUp aria-hidden className="size-4" />
          ) : (
            <ChevronRight aria-hidden className="size-4" />
          )}
        </span>
      </button>

      {isOpen ? (
        <ul id={submenuId} className="mt-0.5 flex flex-col gap-0.5">
          {item.children.map((child) => {
            const isActive = isWithin(child.href, pathname);
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex items-center rounded-app py-2.5 pl-11 pr-3 text-app transition-colors",
                    isActive ? "bg-active font-semibold text-strong" : "text-copy hover:bg-hover",
                  )}
                >
                  {isActive ? <ActiveMarker /> : null}
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

/** The orange rail marking the selected item. */
function ActiveMarker() {
  return (
    <span
      aria-hidden
      className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-brand-accent"
    />
  );
}

const rowClasses =
  "relative flex items-center gap-3 rounded-app px-3 py-2.5 text-app transition-colors";
const activeRowClasses = "bg-active font-semibold text-strong";
const idleRowClasses = "text-copy hover:bg-hover";
