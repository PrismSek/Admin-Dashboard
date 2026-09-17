import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

import { USER_COOKIE } from "@/features/auth/google/constants";
import type { AdminUser } from "@/features/auth/gateway";

const cookieStore = { value: undefined as string | undefined };
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === USER_COOKIE && cookieStore.value !== undefined ? { value: cookieStore.value } : undefined,
  }),
}));

// Imported after the mock so the module's `next/headers` resolves to the stub.
const { setDisplayUserCookie, clearDisplayUserCookie, readDisplayUser } = await import(
  "@/features/auth/display-user"
);

const b64url = (s: string) => Buffer.from(s).toString("base64url");
const jwt = (exp: number) => `${b64url("{}")}.${b64url(JSON.stringify({ exp }))}.sig`;

const USER: AdminUser = {
  id: "u_1",
  tenantId: "t_1",
  email: "amara.osei@northwind.example",
  name: "Amara Osei",
  role: "org_owner",
  status: "active",
};

/** Mint a cookie value the way the routes do, and load it into the stubbed store. */
function issue(user: AdminUser, expSeconds: number, nowSeconds: number) {
  const res = new NextResponse(null, { status: 204 });
  setDisplayUserCookie(res, user, jwt(expSeconds), nowSeconds);
  cookieStore.value = res.cookies.get(USER_COOKIE)?.value;
  return res;
}

describe("display user cookie", () => {
  const prevSecret = process.env.USER_COOKIE_SECRET;
  const prevOrigin = process.env.GATEWAY_ORIGIN;
  beforeEach(() => {
    process.env.USER_COOKIE_SECRET = "test-user-cookie-secret-at-least-32-chars";
    // serverEnv() validates the whole contract, so the origin must be present too.
    process.env.GATEWAY_ORIGIN = "https://gw.example";
    cookieStore.value = undefined;
  });
  afterEach(() => {
    process.env.USER_COOKIE_SECRET = prevSecret;
    process.env.GATEWAY_ORIGIN = prevOrigin;
  });

  it("round-trips the display fields and is sized to the access token exp", async () => {
    const now = 1_000_000;
    const res = issue(USER, now + 900, now);
    expect(res.cookies.get(USER_COOKIE)?.maxAge).toBe(900);

    const display = await readDisplayUser(now);
    expect(display).toEqual({ name: "Amara Osei", email: USER.email, role: "org_owner" });
  });

  it("does not store the display fields in cleartext", () => {
    issue(USER, 2_000_000, 1_000_000);
    expect(cookieStore.value).not.toContain("Amara");
    expect(cookieStore.value).not.toContain("org_owner");
  });

  it("returns null when the cookie is absent", async () => {
    expect(await readDisplayUser(1_000_000)).toBeNull();
  });

  it("rejects a tampered cookie", async () => {
    issue(USER, 2_000_000, 1_000_000);
    cookieStore.value = `${cookieStore.value}tampered`;
    expect(await readDisplayUser(1_000_000)).toBeNull();
  });

  it("rejects a cookie past its embedded exp", async () => {
    const now = 1_000_000;
    issue(USER, now + 100, now);
    expect(await readDisplayUser(now + 200)).toBeNull();
  });

  it("rejects a cookie minted under a different secret", async () => {
    issue(USER, 2_000_000, 1_000_000);
    process.env.USER_COOKIE_SECRET = "a-completely-different-secret-of-32+chars";
    expect(await readDisplayUser(1_000_000)).toBeNull();
  });

  it("clearDisplayUserCookie expires the cookie immediately", () => {
    const res = new NextResponse(null, { status: 204 });
    clearDisplayUserCookie(res);
    expect(res.cookies.get(USER_COOKIE)?.maxAge).toBe(0);
  });
});
