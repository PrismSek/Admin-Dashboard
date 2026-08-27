// src/app/api/auth/google/start/route.test.ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/auth/google/start/route";
import { NONCE_COOKIE } from "@/features/auth/google/constants";

describe("GET /api/auth/google/start", () => {
  const prev = process.env.GATEWAY_ORIGIN;
  beforeEach(() => { process.env.GATEWAY_ORIGIN = "https://gw.example"; });
  afterEach(() => { process.env.GATEWAY_ORIGIN = prev; });

  it("redirects to the gateway and sets an HttpOnly nonce cookie carrying the same nonce", async () => {
    const res = await GET(new Request("http://localhost/api/auth/google/start") as never);
    expect(res.status).toBe(302);
    const nonce = res.cookies.get(NONCE_COOKIE)?.value;
    expect(nonce).toMatch(/^[A-Za-z0-9_-]{43}$/);

    const location = res.headers.get("location")!;
    expect(location.startsWith("https://gw.example/v1/auth/google/start?return=")).toBe(true);
    expect(decodeURIComponent(location.split("return=")[1])).toBe(`/sign-in/callback?n=${nonce}`);

    const setCookie = res.headers.get("set-cookie")!;
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie.toLowerCase()).toContain("samesite=lax");
    expect(setCookie).toContain("Max-Age=600");
  });

  it("redirects to the generic error when GATEWAY_ORIGIN is unset", async () => {
    delete process.env.GATEWAY_ORIGIN;
    const res = await GET(new Request("http://localhost/api/auth/google/start") as never);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/sign-in?error=google");
  });
});
