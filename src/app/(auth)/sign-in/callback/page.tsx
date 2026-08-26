"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { StatusLine } from "@/features/auth/components/spinner";
import { authRoutes, signInContent } from "@/features/auth/content";
import { NONCE_QUERY_PARAM } from "@/features/auth/google/constants";
import { parseSessionFragment } from "@/features/auth/google/fragment";

/**
 * Landing for a successful Google sign-in. The backend returns the session in
 * the URL fragment (never sent to a server), so we read it here, scrub it from
 * the URL, and hand the tokens to /api/auth/session which sets HttpOnly cookies.
 * Any problem falls through to the generic sign-in error.
 */
export default function GoogleCallbackPage() {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const fail = () => router.replace(`${authRoutes.signIn}?error=google`);

    const tokens = parseSessionFragment(window.location.hash);
    const nonce = new URLSearchParams(window.location.search).get(NONCE_QUERY_PARAM);
    // Scrub the token fragment (and the nonce query) from URL + history immediately.
    window.history.replaceState(null, "", window.location.pathname);

    if (!tokens || !nonce) {
      fail();
      return;
    }

    fetch("/api/auth/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: tokens.token, refresh: tokens.refresh, n: nonce }),
    })
      .then((res) => (res.ok ? router.replace(authRoutes.dashboard) : fail()))
      .catch(fail);
  }, [router]);

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <StatusLine label={signInContent.googleSigningIn} />
    </main>
  );
}
