import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { forgotPassword, login, logout, refresh, resetPassword } from "@/features/auth/gateway";

const SESSION = {
  token: "a.b.c",
  expiresAt: "2026-08-27T17:30:57Z",
  refreshToken: "r1",
  refreshExpiresAt: "2026-09-03T17:15:57Z",
  user: {
    id: "u_1",
    tenantId: "t_1",
    email: "demo@prismsek.com",
    name: "demo@prismsek.com",
    role: "org_owner",
    status: "active",
  },
};

function response(status: number, body?: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  } as unknown as Response;
}

const fetchMock = vi.fn();

describe("gateway auth client", () => {
  const prev = process.env.GATEWAY_ORIGIN;
  beforeEach(() => {
    process.env.GATEWAY_ORIGIN = "https://gw.example/";
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.GATEWAY_ORIGIN = prev;
  });

  describe("login", () => {
    it("posts credentials to the gateway and returns the parsed session", async () => {
      fetchMock.mockResolvedValue(response(200, SESSION));
      const session = await login("demo@prismsek.com", "pw");
      expect(session?.user.role).toBe("org_owner");
      expect(session?.refreshToken).toBe("r1");
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("https://gw.example/v1/auth/login");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body)).toEqual({ email: "demo@prismsek.com", password: "pw" });
    });

    it("returns null on 401 (invalid credentials)", async () => {
      fetchMock.mockResolvedValue(response(401));
      expect(await login("demo@prismsek.com", "wrong")).toBeNull();
    });

    it("throws on an unexpected status", async () => {
      fetchMock.mockResolvedValue(response(500));
      await expect(login("demo@prismsek.com", "pw")).rejects.toThrow();
    });
  });

  describe("refresh", () => {
    it("returns a rotated session on 200", async () => {
      fetchMock.mockResolvedValue(response(200, SESSION));
      const session = await refresh("r0");
      expect(session?.token).toBe("a.b.c");
      expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ refreshToken: "r0" });
    });

    it("returns null on 401 (unknown/used/revoked)", async () => {
      fetchMock.mockResolvedValue(response(401));
      expect(await refresh("stale")).toBeNull();
    });
  });

  describe("logout", () => {
    it("posts the refresh token and resolves on 204", async () => {
      fetchMock.mockResolvedValue(response(204));
      await expect(logout("r1")).resolves.toBeUndefined();
      expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ refreshToken: "r1" });
    });

    it("resolves even when the gateway errors (idempotent, best-effort)", async () => {
      fetchMock.mockResolvedValue(response(500));
      await expect(logout("r1")).resolves.toBeUndefined();
    });
  });

  describe("forgotPassword", () => {
    it("posts the email and resolves on 202", async () => {
      fetchMock.mockResolvedValue(response(202));
      await expect(forgotPassword("demo@prismsek.com")).resolves.toBeUndefined();
      expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ email: "demo@prismsek.com" });
    });

    it("throws on a server error so the caller can log it", async () => {
      fetchMock.mockResolvedValue(response(500));
      await expect(forgotPassword("demo@prismsek.com")).rejects.toThrow();
    });
  });

  describe("resetPassword", () => {
    it("returns 'ok' on 200", async () => {
      fetchMock.mockResolvedValue(response(200));
      expect(await resetPassword("tok", "newpassword")).toBe("ok");
      expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ token: "tok", password: "newpassword" });
    });

    it("returns 'invalid-token' on 401", async () => {
      fetchMock.mockResolvedValue(response(401));
      expect(await resetPassword("bad", "newpassword")).toBe("invalid-token");
    });

    it("returns 'weak-password' on 422", async () => {
      fetchMock.mockResolvedValue(response(422));
      expect(await resetPassword("tok", "short")).toBe("weak-password");
    });
  });
});
