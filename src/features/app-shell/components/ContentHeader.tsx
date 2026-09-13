import Image from "next/image";
import Link from "next/link";
import type { RefObject } from "react";

import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { appShellContent } from "@/features/app-shell/content";
import { authCommon, authRoutes } from "@/features/auth/content";

/**
 * Header for the content column only (not full-width — the sidebar has its
 * own chrome). Renders the PrismSek lockup and the utility icon buttons
 * (Figma node 398:16105); below `lg` it also exposes the menu button that
 * opens `SideNav`'s overlay.
 */
export function ContentHeader({
  onOpenNavigation,
  isNavOpen,
  menuButtonRef,
}: {
  onOpenNavigation: () => void;
  isNavOpen: boolean;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <header className="flex h-app-header shrink-0 items-center justify-between border-b border-hair-strong bg-chrome px-4">
      <div className="flex items-center gap-3">
        <button
          ref={menuButtonRef}
          type="button"
          aria-label={appShellContent.openNavigation}
          aria-expanded={isNavOpen}
          onClick={onOpenNavigation}
          className="flex size-icon-button items-center justify-center rounded-app text-dim transition-colors hover:bg-hover lg:hidden"
        >
          <AppIcon name="menu" className="size-app-icon" />
        </button>

        <Link href={authRoutes.home} className="rounded-app">
          <Image
            src="/prismsek-logo.svg"
            alt={authCommon.logoAlt}
            width={242}
            height={61}
            priority
            unoptimized
            className="h-7 w-auto"
          />
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <IconButton icon="search" label={appShellContent.search} />
        <IconButton icon="notification" label={appShellContent.notifications} />
      </div>
    </header>
  );
}

function IconButton({ icon, label }: { icon: AppIconName; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-icon-button items-center justify-center rounded-app text-dim transition-colors hover:bg-hover"
    >
      <AppIcon name={icon} className="size-app-icon" />
    </button>
  );
}
