import { describe, expect, it } from "vitest";
import { NextResponse } from "next/server";

import { clearSessionCookies, setSessionCookies } from "@/features/auth/session";
import { REFRESH_COOKIE, SESSION_COOKIE } from "@/features/auth/google/constants";

const b64url = (s: string) => Buffer.from(s).toString("base64url");
const jwt = (exp: number) => `${b64url("{}")}.${b64url(JSON.stringify({ exp }))}.sig`;

describe("setSessionCookies", () => {
  it("writes the access and refresh tokens as lax, httpOnly cookies", () => {
    const res = new NextResponse(null, { status: 204 });
    const token = jwt(9_999_999_999);
    setSessionCookies(res, { token, refreshToken: "r1" });

    expect(res.cookies.get(SESSION_COOKIE)?.value).toBe(token);
    expect(res.cookies.get(REFRESH_COOKIE)?.value).toBe("r1");
    const setCookie = res.headers.get("set-cookie")!;
    expect(setCookie).toContain("HttpOnly");
    // Lax, not Strict: the session must survive a top-level navigation from
    // outside the app (a new tab, a bookmark, an external link). Strict
    // withholds the cookie there and forces a re-login. Lax still blocks
    // cross-site POST/form forgery.
    expect(setCookie.toLowerCase()).toContain("samesite=lax");
    expect(setCookie.toLowerCase()).not.toContain("samesite=strict");
  });

  it("sizes the session cookie from the access token's exp", () => {
    const res = new NextResponse(null, { status: 204 });
    const nowSeconds = 1_000_000;
    setSessionCookies(res, { token: jwt(nowSeconds + 900), refreshToken: "r1" }, nowSeconds);
    expect(res.cookies.get(SESSION_COOKIE)?.maxAge).toBe(900);
  });
});

describe("clearSessionCookies", () => {
  it("expires both cookies immediately", () => {
    const res = new NextResponse(null, { status: 204 });
    clearSessionCookies(res);
    expect(res.cookies.get(SESSION_COOKIE)?.maxAge).toBe(0);
    expect(res.cookies.get(REFRESH_COOKIE)?.maxAge).toBe(0);
  });
});
