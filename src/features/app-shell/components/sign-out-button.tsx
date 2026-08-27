"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authApiRoutes, authRoutes } from "@/features/auth/content";

/**
 * Ends the session and returns to sign-in. POSTs to our logout route (which
 * revokes the refresh token and clears the cookies) then navigates — always
 * landing on sign-in even if the network call fails, so signing out never
 * appears to hang.
 */
export function SignOutButton() {
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
      aria-label="Sign out"
      disabled={busy}
      onClick={signOut}
      className="flex size-9 items-center justify-center rounded-app text-copy transition-colors hover:bg-hover disabled:opacity-50 [&_svg]:size-[18px]"
    >
      <LogOut aria-hidden />
    </button>
  );
}
