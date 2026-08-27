import { Bell, CircleQuestionMark, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { authCommon } from "@/features/auth/content";
import { SignOutButton } from "@/features/app-shell/components/sign-out-button";

/**
 * Global header: brand lockup on the left, utilities and the signed-in user's
 * avatar on the right. Rendered once by the app layout.
 */
export function TopBar({ initials }: { initials: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-hair-strong bg-chrome px-6">
      <Link href="/dashboard" className="rounded-app">
        <Image
          src="/prismsek-logo.png"
          alt={authCommon.logoAlt}
          width={240}
          height={61}
          priority
          className="h-8 w-auto"
        />
      </Link>

      <div className="flex items-center gap-1">
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
          className="ml-2 flex size-9 items-center justify-center rounded-full bg-active text-micro font-semibold text-copy"
        >
          {initials}
        </span>
        <SignOutButton />
      </div>
    </header>
  );
}

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-app text-copy transition-colors hover:bg-hover [&_svg]:size-[18px]"
    >
      {children}
    </button>
  );
}
