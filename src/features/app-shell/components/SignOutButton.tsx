"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { AppIcon } from "@/components/icons/AppIcon";
import { appShellContent } from "@/features/app-shell/content";
import { authApiRoutes, authRoutes } from "@/features/auth/content";

const defaultClasses =
  "flex size-icon-button items-center justify-center rounded-app text-copy transition-colors hover:bg-hover disabled:opacity-50";

/**
 * Ends the session and returns to sign-in. POSTs to our logout route (which
 * revokes the refresh token and clears the cookies) then navigates — always
 * landing on sign-in even if the network call fails, so signing out never
 * appears to hang.
 *
 * `className` / `children` let the same action render as a bare icon or as a
 * labelled row (the sidebar's "Log out"), so the sign-out logic lives once.
 */
export function SignOutButton({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await fetch(authApiRoutes.logout, { method: "POST" });
    } catch {
      // best-effort — proceed to sign-in regardless
    }
    router.push(authRoutes.signIn);
    router.refresh();
  }

  return (
    <button
      type="button"
      aria-label={appShellContent.logOut}
      disabled={busy}
      onClick={signOut}
      className={className ?? defaultClasses}
    >
      {children ?? <AppIcon name="logout" className="size-app-icon" />}
    </button>
  );
}
