import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { z } from "zod";

import { serverEnv } from "@/env";
import { adminUserRoleSchema, type AdminUser } from "@/features/auth/gateway";
import { accessTokenMaxAgeSeconds } from "@/features/auth/google/jwt";
import { ACCESS_FALLBACK_MAX_AGE_SECONDS, USER_COOKIE } from "@/features/auth/google/constants";

/**
 * The `ps_user` cookie: the minimal identity the sidebar renders (name + role),
 * written by the server at login/refresh and read back on each server render so
 * the shell reflects the real session instead of a fixture.
 *
 * It is DISPLAY DATA ONLY. Authorization always rides on the `ps_session` JWT,
 * which the gateway verifies; this cookie is never consulted for access
 * decisions. It is still encrypted-and-authenticated (AES-256-GCM) so a client
 * cannot forge or tamper with what the shell shows, httpOnly/Secure/SameSite
 * like the session cookies, and short-lived — sized to the access token's `exp`
 * and re-minted on every refresh, then cleared on logout.
 */

/** What we persist: enough to render the sidebar, plus an `exp` we re-check server-side. */
const displayUserPayloadSchema = z.object({
  name: z.string(),
  email: z.string(),
  role: adminUserRoleSchema,
  exp: z.number().finite(),
});
export type DisplayUser = Pick<z.infer<typeof displayUserPayloadSchema>, "name" | "email" | "role">;

/** A 256-bit key derived from the configured secret. */
function key(): Buffer {
  return createHash("sha256").update(serverEnv().USER_COOKIE_SECRET).digest();
}

/** `iv.tag.ciphertext`, each base64url — AES-256-GCM, so tampering fails `final()`. */
function encrypt(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ciphertext].map((part) => part.toString("base64url")).join(".");
}

/** Reverse of `encrypt`. Returns `null` for anything malformed, wrong-key, or tampered. */
function decrypt(value: string): string | null {
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  try {
    const [iv, tag, ciphertext] = parts.map((part) => Buffer.from(part, "base64url"));
    const decipher = createDecipheriv("aes-256-gcm", key(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

function secure(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Write the display cookie from a freshly issued session's user. Sized to the
 * access token's `exp` so it lives exactly as long as the session it describes.
 */
export function setDisplayUserCookie(
  res: NextResponse,
  user: AdminUser,
  accessToken: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): void {
  const maxAge = accessTokenMaxAgeSeconds(accessToken, nowSeconds, ACCESS_FALLBACK_MAX_AGE_SECONDS);
  const value = encrypt(
    JSON.stringify({
      name: user.name,
      email: user.email,
      role: user.role,
      exp: nowSeconds + maxAge,
    }),
  );
  res.cookies.set(USER_COOKIE, value, {
    httpOnly: true,
    secure: secure(),
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

/** Expire the display cookie immediately (sign-out, or a session that was rejected). */
export function clearDisplayUserCookie(res: NextResponse): void {
  res.cookies.set(USER_COOKIE, "", {
    httpOnly: true,
    secure: secure(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * The display user for this request, or `null` when the cookie is missing,
 * tampered, malformed, or past its embedded `exp`. Server Components call this
 * to render the shell; callers fall back when it is `null`.
 */
export async function readDisplayUser(
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<DisplayUser | null> {
  const raw = (await cookies()).get(USER_COOKIE)?.value;
  if (!raw) return null;

  const decrypted = decrypt(raw);
  if (decrypted === null) return null;

  let json: unknown;
  try {
    json = JSON.parse(decrypted);
  } catch {
    return null;
  }

  const parsed = displayUserPayloadSchema.safeParse(json);
  if (!parsed.success || parsed.data.exp <= nowSeconds) return null;

  const { name, email, role } = parsed.data;
  return { name, email, role };
}
