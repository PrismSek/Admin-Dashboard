import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

import { config, proxy } from "@/proxy";
import { REFRESH_COOKIE, SESSION_COOKIE } from "@/features/auth/google/constants";

const b64url = (s: string) => Buffer.from(s).toString("base64url");
const jwt = (exp: number) => `${b64url("{}")}.${b64url(JSON.stringify({ exp }))}.sig`;
const now = () => Math.floor(Date.now() / 1000);

const SESSION = {
  token: jwt(now() + 900),
  expiresAt: "2026-08-27T17:30:57Z",
  refreshToken: "r2",
  refreshExpiresAt: "2026-09-03T17:15:57Z",
  user: {
    id: "u_1",
    tenantId: "t_1",
    email: "demo@prismsek.com",
    name: "Demo",
    role: "org_owner",
    status: "active",
  },
};

const fetchMock = vi.fn();
const gwResponse = (status: number, body?: unknown) =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as unknown as Response;

function req({
  access,
  refresh,
  dest = "document",
  url = "https://app.example/dashboard",
}: {
  access?: string;
  refresh?: string;
  dest?: string;
  url?: string;
}): NextRequest {
  return {
    url,
    nextUrl: new URL(url),
    cookies: {
      get: (name: string) => {
        if (name === SESSION_COOKIE && access !== undefined) return { value: access };
        if (name === REFRESH_COOKIE && refresh !== undefined) return { value: refresh };
        return undefined;
      },
    },
    headers: new Headers(dest ? { "sec-fetch-dest": dest } : {}),
  } as unknown as NextRequest;
}

const location = (res: Awaited<ReturnType<typeof proxy>>) => res.headers.get("location");

describe("proxy (route gating + auto-refresh)", () => {
  const prev = process.env.GATEWAY_ORIGIN;
  beforeEach(() => {
    process.env.GATEWAY_ORIGIN = "https://gw.example";
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.GATEWAY_ORIGIN = prev;
  });

  it("allows a request that carries a fresh access token, without touching the gateway", async () => {
    const res = await proxy(req({ access: jwt(now() + 900) }));
    expect(location(res)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("redirects to sign-in when there is no session at all", async () => {
    const res = await proxy(req({}));
    expect(location(res)).toBe("https://app.example/sign-in");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("auto-refreshes on a document navigation with an expired access token", async () => {
    fetchMock.mockResolvedValue(gwResponse(200, SESSION));
    const res = await proxy(req({ access: jwt(now() - 10), refresh: "r1", dest: "document" }));
    expect(location(res)).toBeNull(); // allowed through
    expect(res.cookies.get(REFRESH_COOKIE)?.value).toBe("r2"); // rotated
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ refreshToken: "r1" });
  });

  it("redirects and clears cookies when the refresh token is rejected", async () => {
    fetchMock.mockResolvedValue(gwResponse(401));
    const res = await proxy(req({ access: jwt(now() - 10), refresh: "stale", dest: "document" }));
    expect(location(res)).toBe("https://app.example/sign-in");
    expect(res.cookies.get(REFRESH_COOKIE)?.maxAge).toBe(0);
  });

  it("does NOT refresh on a non-document (prefetch/RSC) request — avoids racing the rotating token", async () => {
    const res = await proxy(req({ access: jwt(now() - 10), refresh: "r1", dest: "empty" }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(location(res)).toBe("https://app.example/sign-in");
  });

  it("reverse-gate: sends a signed-in visitor (live access) away from /sign-in into the app", async () => {
    const res = await proxy(req({ access: jwt(now() + 900), url: "https://app.example/sign-in" }));
    expect(location(res)).toBe("https://app.example/policies");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reverse-gate: sends a visitor with only a refresh token away from /sign-in (the app then refreshes)", async () => {
    const res = await proxy(req({ refresh: "r1", url: "https://app.example/sign-in" }));
    expect(location(res)).toBe("https://app.example/policies");
    expect(fetchMock).not.toHaveBeenCalled(); // no refresh here — the app's own gate does that
  });

  it("reverse-gate: shows the sign-in form when there is no session", async () => {
    const res = await proxy(req({ url: "https://app.example/sign-in" }));
    expect(location(res)).toBeNull(); // rendered, not redirected
  });

  it("guards the authenticated app sections and reverse-gates the sign-in form", () => {
    expect(config.matcher).toEqual(
      expect.arrayContaining([
        "/endpoints/:path*",
        "/policies/:path*",
        "/manage/:path*",
        "/settings/:path*",
        "/sign-in",
      ]),
    );
  });
});
