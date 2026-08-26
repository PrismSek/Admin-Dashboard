import { z } from "zod";

const expSchema = z.object({ exp: z.number().finite() });

/**
 * Seconds until the access JWT's `exp`, used only to size the session cookie —
 * the gateway verifies the signature when the token is actually used. Returns
 * `fallbackSeconds` if `exp` is unreadable, 0 if already past.
 */
export function accessTokenMaxAgeSeconds(
  token: string,
  nowSeconds: number,
  fallbackSeconds: number,
): number {
  const exp = readJwtExp(token);
  if (exp === null) return fallbackSeconds;
  const remaining = Math.floor(exp - nowSeconds);
  return remaining > 0 ? remaining : 0;
}

function readJwtExp(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
  const result = expSchema.safeParse(payload);
  return result.success ? result.data.exp : null;
}
