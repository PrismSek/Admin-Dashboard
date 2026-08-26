import { NextResponse, type NextRequest } from "next/server";

import {
  ACCESS_FALLBACK_MAX_AGE_SECONDS,
  NONCE_COOKIE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE_SECONDS,
  SESSION_COOKIE,
} from "@/features/auth/google/constants";
import { constantTimeEqual } from "@/features/auth/google/crypto";
import { accessTokenMaxAgeSeconds } from "@/features/auth/google/jwt";
import { sessionPayloadSchema } from "@/features/auth/google/schema";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const parsed = sessionPayloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  const { token, refresh, n } = parsed.data;

  const nonce = request.cookies.get(NONCE_COOKIE)?.value;
  if (!nonce || !constantTimeEqual(n, nonce)) {
    return new NextResponse(null, { status: 403 });
  }

  const secure = process.env.NODE_ENV === "production";
  const nowSeconds = Math.floor(Date.now() / 1000);
  const res = new NextResponse(null, { status: 204 });

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: accessTokenMaxAgeSeconds(token, nowSeconds, ACCESS_FALLBACK_MAX_AGE_SECONDS),
  });
  res.cookies.set(REFRESH_COOKIE, refresh, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: REFRESH_MAX_AGE_SECONDS,
  });
  // Burn the single-use nonce.
  res.cookies.set(NONCE_COOKIE, "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
