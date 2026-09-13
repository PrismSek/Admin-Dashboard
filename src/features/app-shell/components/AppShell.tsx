"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { ContentHeader } from "@/features/app-shell/components/ContentHeader";
import { SideNav } from "@/features/app-shell/components/SideNav";
import type { CurrentUser } from "@/features/app-shell/data";

/**
 * Geometry only: a 256px sidebar column and a content column carrying its
 * own 48px header (Figma node 398:16105). Below `lg`, `SideNav` becomes a
 * fixed overlay opened by `ContentHeader`'s menu button; while it is open
 * the content column is made `inert` so focus and interaction stay inside
 * the modal panel (docs/CODING_STANDARDS.md §14 — modals trap focus).
 */
export function AppShell({ user, children }: { user: CurrentUser; children: ReactNode }) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navId = useId();

  // Restore focus to the menu button only *after* React has committed the
  // close (and the content column has stopped being `inert`) — doing this
  // synchronously in the click/Escape handler races the DOM update and the
  // focus call silently no-ops (confirmed in real Chromium). The `wasOpen`
  // guard keeps this from stealing focus on first mount, when `isNavOpen`
  // is already `false`.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !isNavOpen) {
      menuButtonRef.current?.focus();
    }
    wasOpenRef.current = isNavOpen;
  }, [isNavOpen]);

  return (
    <div className="app-shell-grid grid h-dvh bg-canvas max-lg:grid-cols-1">
      <SideNav user={user} isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} id={navId} />
      <div className="flex min-w-0 flex-col" inert={isNavOpen || undefined}>
        <ContentHeader
          onOpenNavigation={() => setIsNavOpen(true)}
          isNavOpen={isNavOpen}
          menuButtonRef={menuButtonRef}
          navId={navId}
        />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
