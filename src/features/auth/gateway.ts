import "server-only";

import { z } from "zod";

import { serverEnv } from "@/env";

/**
 * Server-only client for the admin-plane auth endpoints.
 *
 * The browser never calls the gateway directly: it POSTs to our own
 * `/api/auth/*` route handlers, which call these functions. That keeps
 * `GATEWAY_ORIGIN` server-only and lets the handlers set httpOnly cookies the
 * page's JavaScript can never read.
 *
 * Every response that crosses this boundary is re-parsed with zod — a gateway
 * that changes shape fails loudly here rather than surfacing as `undefined`
 * three layers up (CODING_STANDARDS §6, §8).
 */

/** The admin-plane gateway origin (e.g. https://staging-gw.prismsek.com). */
export function gatewayOrigin(): string {
  return serverEnv().GATEWAY_ORIGIN.replace(/\/+$/, "");
}

export const adminUserSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.enum(["org_owner", "policy_admin", "analyst", "auditor"]),
  status: z.enum(["pending", "active", "suspended", "deactivated"]),
});

/** A login/refresh result: short-lived access token plus a rotating refresh token. */
export const sessionSchema = z.object({
  token: z.string(),
  expiresAt: z.string(),
  refreshToken: z.string(),
  refreshExpiresAt: z.string(),
  user: adminUserSchema,
});
export type Session = z.infer<typeof sessionSchema>;
export type AdminUser = z.infer<typeof adminUserSchema>;

async function post(path: string, body: unknown): Promise<Response> {
  return fetch(`${gatewayOrigin()}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

/** Exchange email + password for a session. `null` means invalid credentials (401). */
export async function login(email: string, password: string): Promise<Session | null> {
  const res = await post("/v1/auth/login", { email, password });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`login: unexpected gateway status ${res.status}`);
  return sessionSchema.parse(await res.json());
}

/** Exchange a refresh token for a rotated session. `null` means it is no longer valid (401). */
export async function refresh(refreshToken: string): Promise<Session | null> {
  const res = await post("/v1/auth/refresh", { refreshToken });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`refresh: unexpected gateway status ${res.status}`);
  return sessionSchema.parse(await res.json());
}

/**
 * End the session behind a refresh token. Idempotent and best-effort: the caller
 * clears the cookies regardless, so a gateway hiccup must not strand the user
 * signed-in on the client.
 */
export async function logout(refreshToken: string): Promise<void> {
  try {
    await post("/v1/auth/logout", { refreshToken });
  } catch (error) {
    console.error("gateway logout failed (cookies cleared anyway)", error);
  }
}

/** Request a reset link. Resolves on success; throws on a server fault so the caller can log it. */
export async function forgotPassword(email: string): Promise<void> {
  const res = await post("/v1/auth/password/forgot", { email });
  if (!res.ok) throw new Error(`forgotPassword: unexpected gateway status ${res.status}`);
}

export type ResetOutcome = "ok" | "invalid-token" | "weak-password";

/** Set a password from an emailed link. */
export async function resetPassword(token: string, password: string): Promise<ResetOutcome> {
  const res = await post("/v1/auth/password/reset", { token, password });
  if (res.ok) return "ok";
  if (res.status === 401) return "invalid-token";
  if (res.status === 422) return "weak-password";
  throw new Error(`resetPassword: unexpected gateway status ${res.status}`);
}
