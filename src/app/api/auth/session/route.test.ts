import { describe, expect, it } from "vitest";
import type { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/session/route";
import { NONCE_COOKIE, REFRESH_COOKIE, SESSION_COOKIE } from "@/features/auth/google/constants";

const b64url = (s: string) => Buffer.from(s).toString("base64url");
const jwt = (exp: number) => `${b64url("{}")}.${b64url(JSON.stringify({ exp }))}.sig`;

function req(body: unknown, cookieNonce?: string): NextRequest {
  return {
    json: async () => body,
    cookies: {
      get: (name: string) =>
        name === NONCE_COOKIE && cookieNonce !== undefined ? { value: cookieNonce } : undefined,
    },
  } as unknown as NextRequest;
}

describe("POST /api/auth/session", () => {
  it("sets session + refresh cookies when the nonce matches", async () => {
    const token = jwt(9_999_999_999);
    const res = await POST(req({ token, refresh: "r1", n: "good" }, "good"));
    expect(res.status).toBe(204);
    expect(res.cookies.get(SESSION_COOKIE)?.value).toBe(token);
    expect(res.cookies.get(REFRESH_COOKIE)?.value).toBe("r1");
    const setCookie = res.headers.get("set-cookie")!;
    expect(setCookie).toContain("HttpOnly");
    // Lax so the session survives a top-level navigation into the app (a new
    // tab / bookmark); Strict would force a re-login there. See session.ts.
    expect(setCookie.toLowerCase()).toContain("samesite=lax");
  });

  it("returns 403 on a mismatched nonce", async () => {
    const res = await POST(req({ token: "a.b.c", refresh: "r", n: "good" }, "bad"));
    expect(res.status).toBe(403);
  });

  it("returns 403 when the nonce cookie is absent", async () => {
    const res = await POST(req({ token: "a.b.c", refresh: "r", n: "good" }));
    expect(res.status).toBe(403);
  });

  it("returns 400 on a malformed body", async () => {
    const res = await POST(req({ token: "", refresh: "r", n: "good" }, "good"));
    expect(res.status).toBe(400);
  });
});
