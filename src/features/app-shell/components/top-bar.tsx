import { Bell, CircleQuestionMark, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { authCommon, authRoutes } from "@/features/auth/content";

/**
 * Global header: brand lockup on the left, utility icons and the signed-in
 * user's avatar on the right. Rendered once by the app layout. Sign out lives
 * in the sidebar (Figma, 2026-08-25), not here.
 */
export function TopBar({ initials }: { initials: string }) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between bg-chrome px-4">
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

      <div className="flex items-center gap-4">
        <IconButton label="Search">
          <Search aria-hidden />
        </IconButton>
        <IconButton label="Notifications">
          <Bell aria-hidden />
        </IconButton>
        <IconButton label="Help">
          <CircleQuestionMark aria-hidden />
        </IconButton>

        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-full bg-hair text-micro font-semibold text-copy"
        >
          {initials}
        </span>
      </div>
    </header>
  );
}

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-app text-dim transition-colors hover:bg-hover [&_svg]:size-[18px]"
    >
      {children}
    </button>
  );
}
