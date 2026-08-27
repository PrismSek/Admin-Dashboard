import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

import { POST } from "@/app/api/auth/refresh/route";
import { REFRESH_COOKIE, SESSION_COOKIE } from "@/features/auth/google/constants";

const b64url = (s: string) => Buffer.from(s).toString("base64url");
const jwt = (exp: number) => `${b64url("{}")}.${b64url(JSON.stringify({ exp }))}.sig`;

const SESSION = {
  token: jwt(9_999_999_999),
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
const req = (refreshCookie?: string) =>
  ({
    cookies: {
      get: (name: string) =>
        name === REFRESH_COOKIE && refreshCookie !== undefined ? { value: refreshCookie } : undefined,
    },
  }) as unknown as NextRequest;

const maxAgeOf = (res: Awaited<ReturnType<typeof POST>>, name: string) => res.cookies.get(name)?.maxAge;

describe("POST /api/auth/refresh", () => {
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

  it("rotates the cookies and returns the user on success", async () => {
    fetchMock.mockResolvedValue(gwResponse(200, SESSION));
    const res = await POST(req("r1"));
    expect(res.status).toBe(200);
    expect(res.cookies.get(REFRESH_COOKIE)?.value).toBe("r2");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ refreshToken: "r1" });
  });

  it("clears cookies and returns 401 when the gateway rejects the token", async () => {
    fetchMock.mockResolvedValue(gwResponse(401));
    const res = await POST(req("stale"));
    expect(res.status).toBe(401);
    expect(maxAgeOf(res, SESSION_COOKIE)).toBe(0);
    expect(maxAgeOf(res, REFRESH_COOKIE)).toBe(0);
  });

  it("returns 401 without calling the gateway when no refresh cookie is present", async () => {
    const res = await POST(req());
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 502 on an unexpected gateway error", async () => {
    fetchMock.mockResolvedValue(gwResponse(500));
    const res = await POST(req("r1"));
    expect(res.status).toBe(502);
  });
});
