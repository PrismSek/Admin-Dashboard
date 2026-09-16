export const NONCE_COOKIE = "ps_oauth_nonce";
export const SESSION_COOKIE = "ps_session";
export const REFRESH_COOKIE = "ps_refresh";
/** Encrypted, non-authoritative display data (name + role) for the sidebar. */
export const USER_COOKIE = "ps_user";

export const NONCE_MAX_AGE_SECONDS = 600; // 10 min — matches the backend flow TTL
export const ACCESS_FALLBACK_MAX_AGE_SECONDS = 3600; // used only if the JWT exp is unreadable
export const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days, conservative

export const CALLBACK_PATH = "/sign-in/callback";
export const NONCE_QUERY_PARAM = "n";
export const GATEWAY_START_PATH = "/v1/auth/google/start";
