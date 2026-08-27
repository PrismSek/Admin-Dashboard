import { NextResponse, type NextRequest } from "next/server";

import { refresh } from "@/features/auth/gateway";
import { REFRESH_COOKIE } from "@/features/auth/google/constants";
import { clearSessionCookies, setSessionCookies } from "@/features/auth/session";

export const dynamic = "force-dynamic";

/**
 * Rotate the session from the httpOnly refresh cookie. The refresh token is
 * single-use: a success returns a replacement, and a token the gateway rejects
 * (unknown, expired, already used, revoked) clears both cookies so the client
 * is sent cleanly back to sign-in rather than looping on a dead token.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return new NextResponse(null, { status: 401 });

  let session;
  try {
    session = await refresh(refreshToken);
  } catch (error) {
    console.error("refresh failed at the gateway", error);
    return new NextResponse(null, { status: 502 });
  }

  if (!session) {
    const res = new NextResponse(null, { status: 401 });
    clearSessionCookies(res);
    return res;
  }

  const res = NextResponse.json({ user: session.user }, { status: 200 });
  setSessionCookies(res, session);
  return res;
}
