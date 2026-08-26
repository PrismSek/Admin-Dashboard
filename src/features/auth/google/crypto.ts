import { randomBytes, timingSafeEqual } from "crypto";

/** 256-bit url-safe nonce for the sign-in flow. */
export function generateNonce(): string {
  return randomBytes(32).toString("base64url");
}

/** Length-safe constant-time string comparison (timingSafeEqual throws on length mismatch). */
export function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
