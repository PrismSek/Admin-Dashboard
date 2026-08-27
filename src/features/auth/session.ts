import type { NextResponse } from "next/server";

import {
  ACCESS_FALLBACK_MAX_AGE_SECONDS,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE_SECONDS,
  SESSION_COOKIE,
} from "@/features/auth/google/constants";
import { accessTokenMaxAgeSeconds } from "@/features/auth/google/jwt";

/**
 * The httpOnly session cookies, in one place. Written by every route that mints
 * or rotates a session (Google callback, email login, refresh) and cleared by
 * logout — so cookie flags and lifetimes are defined once, not copied per route.
 */

/** The minimum a session write needs: the access token and its rotating refresh token. */
type SessionTokens = { token: string; refreshToken: string };

function secure(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Write the access + refresh cookies. The session cookie is sized to the access token's `exp`. */
export function setSessionCookies(
  res: NextResponse,
  { token, refreshToken }: SessionTokens,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): void {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: secure(),
    sameSite: "lax",
    path: "/",
    maxAge: accessTokenMaxAgeSeconds(token, nowSeconds, ACCESS_FALLBACK_MAX_AGE_SECONDS),
  });
  res.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: secure(),
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_MAX_AGE_SECONDS,
  });
}

/** Expire both session cookies immediately (sign-out, or a refresh token the gateway rejected). */
export function clearSessionCookies(res: NextResponse): void {
  for (const name of [SESSION_COOKIE, REFRESH_COOKIE]) {
    res.cookies.set(name, "", {
      httpOnly: true,
      secure: secure(),
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
}
