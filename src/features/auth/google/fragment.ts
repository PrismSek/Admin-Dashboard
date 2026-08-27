export type SessionTokens = { token: string; refresh: string };

/**
 * Parse the URL fragment the backend delivers on a successful Google sign-in:
 *   #token=<url-encoded access JWT>&refresh=<url-encoded refresh token>
 * Both values are base64url, so URLSearchParams' `+`→space decoding is a
 * non-issue. Returns null if either key is absent.
 */
export function parseSessionFragment(hash: string): SessionTokens | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(raw);
  const token = params.get("token");
  const refresh = params.get("refresh");
  if (!token || !refresh) return null;
  return { token, refresh };
}
