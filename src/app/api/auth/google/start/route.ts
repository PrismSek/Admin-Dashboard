import { NextResponse, type NextRequest } from "next/server";

import { gatewayStartUrl } from "@/features/auth/google/config";
import { NONCE_COOKIE, NONCE_MAX_AGE_SECONDS } from "@/features/auth/google/constants";
import { generateNonce } from "@/features/auth/google/crypto";
import { authRoutes } from "@/features/auth/content";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const nonce = generateNonce();
    const res = NextResponse.redirect(gatewayStartUrl(nonce), 302);
    res.cookies.set(NONCE_COOKIE, nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: NONCE_MAX_AGE_SECONDS,
    });
    return res;
  } catch {
    // GATEWAY_ORIGIN missing/misconfigured — fail to the generic error.
    return NextResponse.redirect(new URL(`${authRoutes.signIn}?error=google`, request.url));
  }
}
