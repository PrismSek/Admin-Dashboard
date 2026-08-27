import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

import { POST } from "@/app/api/auth/login/route";
import { SESSION_COOKIE } from "@/features/auth/google/constants";

const b64url = (s: string) => Buffer.from(s).toString("base64url");
const jwt = (exp: number) => `${b64url("{}")}.${b64url(JSON.stringify({ exp }))}.sig`;

const SESSION = {
  token: jwt(9_999_999_999),
  expiresAt: "2026-08-27T17:30:57Z",
  refreshToken: "r1",
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
const req = (body: unknown) => ({ json: async () => body }) as unknown as NextRequest;
const gwResponse = (status: number, body?: unknown) =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as unknown as Response;

describe("POST /api/auth/login", () => {
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

  it("sets session cookies and returns the user on success", async () => {
    fetchMock.mockResolvedValue(gwResponse(200, SESSION));
    const res = await POST(req({ email: "demo@prismsek.com", password: "pw" }));
    expect(res.status).toBe(200);
    expect(res.cookies.get(SESSION_COOKIE)?.value).toBe(SESSION.token);
    expect((await res.json()).user.role).toBe("org_owner");
  });

  it("returns 401 with no cookie on invalid credentials", async () => {
    fetchMock.mockResolvedValue(gwResponse(401));
    const res = await POST(req({ email: "demo@prismsek.com", password: "wrong" }));
    expect(res.status).toBe(401);
    expect(res.cookies.get(SESSION_COOKIE)?.value).toBeFalsy();
  });

  it("returns 400 on a malformed body without calling the gateway", async () => {
    const res = await POST(req({ email: "not-an-email" }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 502 when the gateway is unreachable/unexpected", async () => {
    fetchMock.mockResolvedValue(gwResponse(500));
    const res = await POST(req({ email: "demo@prismsek.com", password: "pw" }));
    expect(res.status).toBe(502);
  });
});
