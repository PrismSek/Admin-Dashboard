import { CALLBACK_PATH, GATEWAY_START_PATH, NONCE_QUERY_PARAM } from "./constants";

/** The admin-plane gateway origin (e.g. https://staging-gw.prismsek.com). Server-only env. */
export function gatewayOrigin(): string {
  const origin = process.env.GATEWAY_ORIGIN;
  if (!origin) throw new Error("GATEWAY_ORIGIN is not set");
  return origin.replace(/\/+$/, "");
}

/**
 * Absolute URL to begin Google sign-in. The `return` path is same-site and
 * carries the nonce (base64url — url-safe, so no inner encoding needed); the
 * whole path is percent-encoded as the `return` query value.
 */
export function gatewayStartUrl(nonce: string): string {
  const returnPath = `${CALLBACK_PATH}?${NONCE_QUERY_PARAM}=${nonce}`;
  return `${gatewayOrigin()}${GATEWAY_START_PATH}?return=${encodeURIComponent(returnPath)}`;
}
