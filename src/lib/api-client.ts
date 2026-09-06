import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { serverEnv } from "@/env";
import { authRoutes } from "@/features/auth/content";
import { SESSION_COOKIE } from "@/features/auth/google/constants";

/**
 * The single module that issues authenticated requests to the PrismSek admin
 * gateway (CODING_STANDARDS §6). It owns the base URL, the auth header, and
 * error normalization, so no feature does `fetch(gatewayOrigin() + …)` itself.
 *
 * Auth rides on the httpOnly `ps_session` cookie: it is read server-side and
 * sent as `Authorization: Bearer …`, so the gateway origin and the JWT never
 * reach the browser (§12). Unauthenticated auth calls (login, refresh) are a
 * different concern and stay in `features/auth/gateway.ts`.
 */

function gatewayOrigin(): string {
  return serverEnv().GATEWAY_ORIGIN.replace(/\/+$/, "");
}

/** A non-2xx gateway response other than 401 (which redirects to sign-in). */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const apiErrorShape = z.object({ name: z.literal("ApiError"), status: z.number() });

/**
 * The HTTP status carried by a thrown `ApiError`, or `undefined` for anything
 * else (including a `redirect()` control-flow throw). Read structurally rather
 * than with `instanceof` so it is reliable across module realms — callers map
 * a gateway status to UI copy without importing the class.
 */
export function apiErrorStatus(error: unknown): number | undefined {
  const parsed = apiErrorShape.safeParse(error);
  return parsed.success ? parsed.data.status : undefined;
}

type ApiFetchOptions = {
  method?: string;
  body?: unknown;
  /** Query params; `undefined` or `""` values are omitted rather than sent blank. */
  searchParams?: Record<string, string | undefined>;
  /** Extra request headers, e.g. `If-Match` for the ETag-guarded policy routes. */
  headers?: Record<string, string>;
};

/**
 * Issue an authenticated request. Reads the session cookie, sends it as a
 * Bearer token, applies query params and headers, and normalises failures:
 * a 401 redirects to sign-in (see below), any other non-2xx throws `ApiError`.
 *
 * The proxy refreshes on document navigations, so a 401 here only bites a
 * client-side navigation whose access token lapsed — sign-in recovers it from
 * the refresh cookie. `redirect()` throws, so control does not return past it.
 */
async function perform(path: string, options: ApiFetchOptions): Promise<Response> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect(authRoutes.signIn);

  const url = new URL(`${gatewayOrigin()}${path}`);
  for (const [key, value] of Object.entries(options.searchParams ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, value);
  }

  const hasBody = options.body !== undefined;
  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      authorization: `Bearer ${token}`,
      ...(hasBody ? { "content-type": "application/json" } : {}),
      ...options.headers,
    },
    body: hasBody ? JSON.stringify(options.body) : undefined,
    // Per-tenant data must never be cached across requests (§3, §12).
    cache: "no-store",
  });

  if (res.status === 401) redirect(authRoutes.signIn);
  if (!res.ok) {
    throw new ApiError(res.status, `${options.method ?? "GET"} ${path}: gateway ${res.status}`);
  }
  return res;
}

/**
 * Issue an authenticated request and return the raw parsed JSON. The caller
 * re-parses it with zod so a gateway contract drift fails loudly at the
 * boundary rather than surfacing as `undefined` three layers up (§6).
 */
export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<unknown> {
  const res = await perform(path, options);
  if (res.status === 204) return null;
  return res.json();
}

/**
 * As `apiFetch`, but also returns the `ETag` response header. The policy routes
 * hand back an ETag on every read and mutation; the caller stores it and sends
 * it as `If-Match` on the next write so a stale edit is rejected (412) rather
 * than silently clobbering a concurrent change.
 */
export async function apiFetchWithEtag(
  path: string,
  options: ApiFetchOptions = {},
): Promise<{ data: unknown; etag: string | null }> {
  const res = await perform(path, options);
  const etag = res.headers.get("etag");
  const data = res.status === 204 ? null : await res.json();
  return { data, etag };
}
