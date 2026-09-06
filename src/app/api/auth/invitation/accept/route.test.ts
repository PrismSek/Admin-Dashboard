import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

import { POST } from "@/app/api/auth/invitation/accept/route";

const fetchMock = vi.fn();
const gwResponse = (status: number) =>
  ({ status, ok: status >= 200 && status < 300, json: async () => undefined }) as unknown as Response;
const req = (body: unknown) => ({ json: async () => body }) as unknown as NextRequest;

describe("POST /api/auth/invitation/accept", () => {
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

  it("forwards token, name and password and returns 201 on success", async () => {
    fetchMock.mockResolvedValue(gwResponse(201));
    const res = await POST(req({ token: "tok", name: "Amara Osei", password: "newpassword" }));
    expect(res.status).toBe(201);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      token: "tok",
      name: "Amara Osei",
      password: "newpassword",
    });
  });

  it("returns 400 when the gateway rejects the token", async () => {
    fetchMock.mockResolvedValue(gwResponse(400));
    const res = await POST(req({ token: "bad", name: "Amara", password: "newpassword" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 on a malformed body (missing name) without calling the gateway", async () => {
    const res = await POST(req({ token: "tok", password: "newpassword" }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 400 on a too-short password without calling the gateway", async () => {
    const res = await POST(req({ token: "tok", name: "Amara", password: "short" }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 502 when the gateway is unreachable", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    const res = await POST(req({ token: "tok", name: "Amara", password: "newpassword" }));
    expect(res.status).toBe(502);
  });
});
