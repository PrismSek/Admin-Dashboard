import { NextResponse, type NextRequest } from "next/server";

import { authRoutes } from "@/features/auth/content";
import { refresh } from "@/features/auth/gateway";
import { SESSION_COOKIE, REFRESH_COOKIE } from "@/features/auth/google/constants";
import { accessTokenMaxAgeSeconds } from "@/features/auth/google/jwt";
import { clearSessionCookies, setSessionCookies } from "@/features/auth/session";

/**
 * Route protection for the signed-in app (Next 16 renamed `middleware` →
 * `proxy`; it runs on the Node.js runtime). A request reaching a guarded app
 * section must carry a live session, or it is sent to sign-in. Conversely, a
 * request for the sign-in form that already carries a session is sent into the
 * app — so a signed-in visitor never sees the sign-in screen.
 *
 * This is a UX gate, not the security boundary: it trusts the httpOnly,
 * SameSite=Lax cookies we ourselves set (httpOnly keeps page JS out; Lax still
 * withholds them on a cross-site form POST, so they cannot be forged — while,
 * unlike Strict, they survive a top-level navigation into the app such as a new
 * tab or a bookmark) and only reads the access token's `exp` — the gateway
 * verifies the signature when the token is actually used.
 *
 * Auto-refresh runs ONLY on real document navigations (`Sec-Fetch-Dest:
 * document`). Refresh tokens are single-use and rotate; the burst of concurrent
 * RSC/prefetch requests a page fires would otherwise present the same token
 * many times over, and the gateway's reuse-detection would revoke the whole
 * session. A document navigation happens one at a time, so one refresh at a
 * time. RSC/prefetch requests are still gated — they just don't refresh.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const access = request.cookies.get(SESSION_COOKIE)?.value;
  const hasLiveAccess =
    access !== undefined && accessTokenMaxAgeSeconds(access, nowSeconds, 0) > 0;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  // Reverse gate: a signed-in visitor must never land on the sign-in form. Send
  // them into the app; /dashboard's own gate (below) validates or refreshes the
  // session, or — if it is actually dead — bounces back here after clearing the
  // cookies, so this settles in one round-trip instead of looping. Scoped to the
  // exact /sign-in form: the sub-routes (success, callback, password, sso) are
  // shown to an authenticated user mid-flow and must stay reachable.
  if (request.nextUrl.pathname === authRoutes.signIn) {
    if (hasLiveAccess || refreshToken !== undefined) {
      return NextResponse.redirect(new URL(authRoutes.dashboard, request.url));
    }
    return NextResponse.next();
  }

  // Forward gate: the authenticated app requires a live (or refreshable) session.
  if (hasLiveAccess) {
    return NextResponse.next();
  }

  const isDocumentNavigation = request.headers.get("sec-fetch-dest") === "document";

  if (isDocumentNavigation && refreshToken) {
    try {
      const session = await refresh(refreshToken);
      if (session) {
        const res = NextResponse.next();
        setSessionCookies(res, session);
        return res;
      }
    } catch (error) {
      // A gateway fault must not wedge the app: fall through to sign-in.
      console.error("proxy refresh failed", error);
    }
  }

  const res = NextResponse.redirect(new URL(authRoutes.signIn, request.url));
  clearSessionCookies(res);
  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/endpoints/:path*",
    "/policies/:path*",
    "/manage/:path*",
    "/incidents/:path*",
    "/settings/:path*",
    // Exact /sign-in only — reverse-gate the form. Sub-routes (success, callback,
    // password, sso) are intentionally excluded; a mid-flow user must see them.
    "/sign-in",
  ],
};
