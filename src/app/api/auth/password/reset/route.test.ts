import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

import { POST } from "@/app/api/auth/password/reset/route";

const fetchMock = vi.fn();
const gwResponse = (status: number) =>
  ({ status, ok: status >= 200 && status < 300, json: async () => undefined }) as unknown as Response;
const req = (body: unknown) => ({ json: async () => body }) as unknown as NextRequest;

describe("POST /api/auth/password/reset", () => {
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

  it("forwards token + password and returns 200 on success", async () => {
    fetchMock.mockResolvedValue(gwResponse(200));
    const res = await POST(req({ token: "tok", password: "newpassword" }));
    expect(res.status).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ token: "tok", password: "newpassword" });
  });

  it("returns 401 when the link is not valid", async () => {
    fetchMock.mockResolvedValue(gwResponse(401));
    const res = await POST(req({ token: "bad", password: "newpassword" }));
    expect(res.status).toBe(401);
  });

  it("returns 422 when the password fails policy", async () => {
    fetchMock.mockResolvedValue(gwResponse(422));
    const res = await POST(req({ token: "tok", password: "newpassword" }));
    expect(res.status).toBe(422);
  });

  it("returns 400 on a malformed body (short password) without calling the gateway", async () => {
    const res = await POST(req({ token: "tok", password: "short" }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
