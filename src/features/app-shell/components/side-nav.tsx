"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { primaryNav, type NavItem } from "@/features/app-shell/nav";
import { cn } from "@/lib/utils";

/**
 * Primary sidebar.
 *
 * Client-side only because active state is derived from the current pathname,
 * which a server layout cannot see. Groups auto-expand when the current route
 * is inside them, matching the design (Settings collapsed while Manage is open,
 * and vice versa).
 */
export function SideNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="w-[280px] shrink-0 border-r border-hair-strong bg-chrome py-4">
      <ul className="flex flex-col gap-0.5 px-3">
        {primaryNav.map((item) => (
          <NavEntry key={item.href} item={item} pathname={pathname} />
        ))}
      </ul>
    </nav>
  );
}

function NavEntry({ item, pathname }: { item: NavItem; pathname: string }) {
  const isWithin = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  if (!item.children) {
    return (
      <li>
        <Link
          href={item.href}
          aria-current={isWithin ? "page" : undefined}
          className={cn(rowClasses, isWithin ? activeRowClasses : idleRowClasses)}
        >
          {isWithin ? <ActiveMarker /> : null}
          <Icon aria-hidden className="size-[18px] shrink-0" />
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li>
      {/* The group header is a link to the section landing page; expansion
          follows the route rather than being separately toggleable, which is
          how the design behaves. */}
      <Link
        href={item.children[0]?.href ?? item.href}
        className={cn(rowClasses, idleRowClasses, isWithin && "font-semibold text-strong")}
      >
        <Icon aria-hidden className="size-[18px] shrink-0" />
        {item.label}
        <span className="ml-auto text-dim">
          {isWithin ? (
            <ChevronDown aria-hidden className="size-4" />
          ) : (
            <ChevronRight aria-hidden className="size-4" />
          )}
        </span>
      </Link>

      {isWithin ? (
        <ul className="mt-0.5 flex flex-col gap-0.5">
          {item.children.map((child) => {
            const isActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex items-center rounded-app py-2.5 pl-11 pr-3 text-app transition-colors",
                    isActive
                      ? "bg-active font-semibold text-strong"
                      : "text-copy hover:bg-hover",
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
