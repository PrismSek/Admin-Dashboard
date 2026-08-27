import { NextResponse, type NextRequest } from "next/server";

import { authRoutes } from "@/features/auth/content";
import { refresh } from "@/features/auth/gateway";
import { SESSION_COOKIE, REFRESH_COOKIE } from "@/features/auth/google/constants";
import { accessTokenMaxAgeSeconds } from "@/features/auth/google/jwt";
import { clearSessionCookies, setSessionCookies } from "@/features/auth/session";

/**
 * Route protection for the signed-in app (Next 16 renamed `middleware` →
 * `proxy`; it runs on the Node.js runtime). A request reaching a guarded
 * section must carry a live session, or it is sent to sign-in.
 *
 * This is a UX gate, not the security boundary: it trusts the httpOnly,
 * SameSite=Strict cookies we ourselves set (they cannot be forged by page JS or
 * a cross-site form) and only reads the access token's `exp` — the gateway
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
  const access = request.cookies.get(SESSION_COOKIE)?.value;
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (access && accessTokenMaxAgeSeconds(access, nowSeconds, 0) > 0) {
    return NextResponse.next();
  }

  const isDocumentNavigation = request.headers.get("sec-fetch-dest") === "document";
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

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
  ],
};
