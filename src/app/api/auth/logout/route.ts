import { NextResponse, type NextRequest } from "next/server";

import { logout } from "@/features/auth/gateway";
import { REFRESH_COOKIE } from "@/features/auth/google/constants";
import { clearSessionCookies } from "@/features/auth/session";

export const dynamic = "force-dynamic";

/**
 * End this session. Revokes the refresh token at the gateway (best-effort) and
 * always clears the cookies — signing out must succeed on the client even if
 * the gateway is briefly unreachable. Idempotent: no cookie is fine.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (refreshToken) await logout(refreshToken);

  const res = new NextResponse(null, { status: 204 });
  clearSessionCookies(res);
  return res;
}
