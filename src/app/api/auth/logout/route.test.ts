import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

import { POST } from "@/app/api/auth/logout/route";
import { REFRESH_COOKIE, SESSION_COOKIE } from "@/features/auth/google/constants";

const fetchMock = vi.fn();
const gwResponse = (status: number) =>
  ({ status, ok: status >= 200 && status < 300, json: async () => undefined }) as unknown as Response;
const req = (refreshCookie?: string) =>
  ({
    cookies: {
      get: (name: string) =>
        name === REFRESH_COOKIE && refreshCookie !== undefined ? { value: refreshCookie } : undefined,
    },
  }) as unknown as NextRequest;

describe("POST /api/auth/logout", () => {
  const prev = process.env.GATEWAY_ORIGIN;
  beforeEach(() => {
    process.env.GATEWAY_ORIGIN = "https://gw.example";
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(gwResponse(204));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.GATEWAY_ORIGIN = prev;
  });

  it("revokes the session at the gateway and clears the cookies", async () => {
    const res = await POST(req("r1"));
    expect(res.status).toBe(204);
    expect(res.cookies.get(SESSION_COOKIE)?.maxAge).toBe(0);
    expect(res.cookies.get(REFRESH_COOKIE)?.maxAge).toBe(0);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ refreshToken: "r1" });
  });

  it("still clears cookies and returns 204 when there is no refresh cookie", async () => {
    const res = await POST(req());
    expect(res.status).toBe(204);
    expect(res.cookies.get(SESSION_COOKIE)?.maxAge).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("clears cookies even if the gateway call fails (idempotent)", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    const res = await POST(req("r1"));
    expect(res.status).toBe(204);
    expect(res.cookies.get(REFRESH_COOKIE)?.maxAge).toBe(0);
  });
});
