"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Navigates to `to` after a short pause, so the confirmation screen is legible
 * before it disappears.
 *
 * `replace` rather than `push`: the interstitial must not end up in history, or
 * the browser Back button lands the user on "You're signed in" again.
 *
 * Renders nothing. The screen using it must also offer a visible link to the
 * same destination — this is a convenience, not the only way out, and it does
 * nothing at all without JavaScript.
 */
export function RedirectAfter({ to, delayMs = 1800 }: { to: string; delayMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace(to), delayMs);
    return () => clearTimeout(timer);
  }, [router, to, delayMs]);

  return null;
}
