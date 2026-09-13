"use client";

import { useRef, useState, type ReactNode } from "react";

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

  function closeNav() {
    setIsNavOpen(false);
    menuButtonRef.current?.focus();
  }

  return (
    <div className="app-shell-grid grid h-dvh bg-canvas max-lg:grid-cols-1">
      <SideNav user={user} isOpen={isNavOpen} onClose={closeNav} />
      <div className="flex min-w-0 flex-col" inert={isNavOpen || undefined}>
        <ContentHeader
          onOpenNavigation={() => setIsNavOpen(true)}
          isNavOpen={isNavOpen}
          menuButtonRef={menuButtonRef}
        />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
