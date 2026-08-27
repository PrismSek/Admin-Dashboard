import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

import { POST } from "@/app/api/auth/password/forgot/route";

const fetchMock = vi.fn();
const gwResponse = (status: number) =>
  ({ status, ok: status >= 200 && status < 300, json: async () => undefined }) as unknown as Response;
const req = (body: unknown) => ({ json: async () => body }) as unknown as NextRequest;

describe("POST /api/auth/password/forgot", () => {
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

  it("forwards the email and returns 202", async () => {
    fetchMock.mockResolvedValue(gwResponse(202));
    const res = await POST(req({ email: "demo@prismsek.com" }));
    expect(res.status).toBe(202);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ email: "demo@prismsek.com" });
  });

  it("returns 400 on a malformed email without calling the gateway", async () => {
    const res = await POST(req({ email: "nope" }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("still returns 202 when the gateway errors — no account-existence oracle", async () => {
    fetchMock.mockResolvedValue(gwResponse(500));
    const res = await POST(req({ email: "demo@prismsek.com" }));
    expect(res.status).toBe(202);
  });
});
