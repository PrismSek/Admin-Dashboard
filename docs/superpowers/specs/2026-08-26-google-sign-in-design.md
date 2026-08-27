# Google sign-in integration — design

**Date:** 2026-08-26 (facts confirmed against `PrismSek/Backend` 2026-08-27)
**Status:** Approved (design); backend contract now confirmed from source (§3, §10)
**Scope owner:** ankit@prismsek.com

## 1. Goal

Wire the existing **"Continue with Google"** button on the sign-in home screen to
the PrismSek backend's Google OAuth flow, obtain an admin session, and land the
operator in the app — as a **minimal end-to-end** slice.

## 2. Scope

**In:** initiate Google sign-in, receive the session, persist it in HttpOnly
cookies, redirect to the dashboard, and show a generic error on failure.

**Out (deferred, see §11):** refresh-token rotation, logout, an authenticated
gateway client for app data, and route-guard middleware for `/(app)`.

## 3. The backend contract — confirmed from source

Verified against `control-api/internal/identity/googlehttp.go` and `google.go` in
`PrismSek/Backend`. The frontend piece is deliberately thin; the backend does the
whole OAuth dance.

- `GET /v1/auth/google/start?return=<same-site-path>` — sets HttpOnly PKCE(S256)
  + state cookies (`psk_g_state`, `psk_g_verifier`, SameSite=Lax, 10-min TTL),
  optionally stores `return` in `psk_g_return` **only if it is an internal path**
  (`isInternalPath`: starts with `/`, not `//`, no `\` — **a query string is
  allowed**), then **302 → Google**. **503** if no OAuth client is configured.
- `GET /v1/auth/google/callback` — verifies state in constant time, exchanges the
  code with PKCE, requires `email_verified`, and requires an **already-active
  account or a pending invite** (no just-in-time creation; Google subject linked
  on first use). Then:
  - **Success → 302 to** `dest + "#token=<url-encoded access JWT>&refresh=<url-encoded refresh token>"`, where `dest` is `PSK_CONSOLE_URL` (+ the `return` path if one was saved). **The fragment has exactly two keys: `token` and `refresh`. No expiry is passed.**
  - **Any failure → 302 to** `PSK_CONSOLE_URL + "?signin=failed"` — a **query marker on the console root**, identical for every cause (cancelled consent, unverified email, no account, suspended, reassigned address, state mismatch). The real reason is logged server-side only.
  - **503** if not configured.

**`Session`** (the JSON from `/v1/auth/login`) is `{ token, expiresAt,
refreshToken, refreshExpiresAt, user{ id, tenantId, email, name, role, status } }`
— but again, **only `token` and `refreshToken` reach the browser** (in the
fragment). Admin-plane auth is `Authorization: Bearer <token>` (EdDSA JWT).

**Backend config that must be set for staging** (ops, not our repo):
`PSK_CONSOLE_URL=https://app.prismsek.com`,
`PSK_GOOGLE_REDIRECT_URL=https://staging-gw.prismsek.com/v1/auth/google/callback`
(must match a redirect URI registered on the Google client exactly), plus
`PSK_GOOGLE_CLIENT_ID` / `PSK_GOOGLE_CLIENT_SECRET`.

## 4. Architecture & flow

The session arrives in a URL **fragment** (never sent to a server), so the landing
must be a **client** page that reads it and hands the tokens to a **server** route
handler that sets the cookies. A **nonce** minted at initiation and echoed back
via `return`'s query defends the cookie-set step against login-CSRF / session
fixation (confirmed viable — `return` preserves a query string).

```
[Continue with Google]
      │  our own endpoint, so we can set the nonce cookie before leaving our origin
      ▼
GET /api/auth/google/start ── set HttpOnly ps_oauth_nonce cookie ─► 302
      ▼
GET {GATEWAY_ORIGIN}/v1/auth/google/start?return=%2Fsign-in%2Fcallback%3Fn%3D<nonce>
      ▼  backend saves return + sets PKCE/state cookies, 302 → Google consent
Google ─► GET {GATEWAY_ORIGIN}/v1/auth/google/callback
      ▼  backend verifies; 302 →
  success: https://app.prismsek.com/sign-in/callback?n=<nonce>#token=<enc>&refresh=<enc>
  failure: https://app.prismsek.com/?signin=failed
      ▼  (success) client callback page parses fragment, reads n, scrubs fragment
POST /api/auth/session { token, refresh, n }
      ▼  verify n vs nonce cookie (constant-time); set session cookies; clear nonce
302 → /dashboard
```

The **browser only ever touches our own origin** (`app.prismsek.com`); the gateway
origin is used only server-side in the start handler. So `GATEWAY_ORIGIN` is a
**server-only** env, never `NEXT_PUBLIC_*`.

## 5. Components

New unless noted. Route handlers live under `src/app/api/…` and use Next 16's
async `cookies()` from `next/headers` (verify against `node_modules/next/dist/docs/`
per AGENTS.md before coding).

1. **`GET /api/auth/google/start`** — `src/app/api/auth/google/start/route.ts`.
   Mint a random nonce, set a short-TTL HttpOnly `ps_oauth_nonce` cookie, 302 to
   `${GATEWAY_ORIGIN}/v1/auth/google/start?return=${encodeURIComponent('/sign-in/callback?n='+nonce)}`.
2. **`ProviderButtons`** — `src/features/auth/components/provider-buttons.tsx`.
   "Continue with Google" becomes a plain navigation (link) to
   `/api/auth/google/start` — not `fetch`. GitHub stays a stub.
3. **`/sign-in/callback` page** — `src/app/(auth)/sign-in/callback/page.tsx`
   (client). On mount: parse `location.hash` with `URLSearchParams` → `token` +
   `refresh` (both base64url, so `+`→space decoding is a non-issue);
   `history.replaceState` to scrub the fragment; read `n` from the query; `POST`
   to `/api/auth/session`; on 2xx `router.replace('/dashboard')` — **this slice
   always lands on the dashboard**; on any error `router.replace('/sign-in?error=google')`.
   Renders a neutral "Signing you in…" state (reuses `Spinner`). No token is ever
   written to `localStorage`.
4. **`POST /api/auth/session`** — `src/app/api/auth/session/route.ts`. Zod-validate
   `{ token, refresh, n }`; verify `n` against `ps_oauth_nonce` (constant-time;
   403 if absent/mismatch); set the session cookies; clear the nonce cookie;
   return 204.
5. **Root failure handling** — `src/app/page.tsx` becomes `async`, reads
   `searchParams`; `signin=failed` → `redirect('/sign-in?error=google')`;
   otherwise the existing `redirect('/sign-in')`. (Failure always lands on the
   root per §3.)
6. **`session-cookie.ts`** — `src/features/auth/session-cookie.ts` (`server-only`).
   Cookie names/flags/TTLs and set/read/clear helpers. The access cookie's Max-Age
   comes from the JWT `exp` claim (base64url-decode the payload — no signature
   verification needed just to size a cookie); the refresh cookie gets a
   conservative fixed Max-Age (rotation/expiry handling is deferred, §11).
7. **`oauth-nonce.ts`** — `src/features/auth/oauth-nonce.ts` (`server-only`). Mint
   + constant-time verify/clear of the nonce cookie.
8. **`content.ts` + sign-in page** — generic `error=google` copy; the sign-in page
   reads `?error=google` (async `searchParams`) and renders it via the existing
   error styling.
9. **Config** — `GATEWAY_ORIGIN` server env (staging: `https://staging-gw.prismsek.com`),
   documented in `.env.example`; read only in the start handler.

## 6. Cookies

- **`ps_oauth_nonce`** — HttpOnly, Secure, SameSite=Lax, ~10-min TTL, single-use.
  Lax so it is reliably present on the same-origin `POST /api/auth/session` after
  the cross-site redirect chain.
- **`ps_session`** (access JWT) — HttpOnly, Secure, **SameSite=Strict**, `Path=/`,
  Max-Age from the JWT `exp`. Strict is fine: it is never needed on a cross-site
  request, only on same-site navigation after login.
- **`ps_refresh`** (refresh token) — HttpOnly, Secure, SameSite=Strict, `Path=/`,
  conservative fixed Max-Age. Captured now because the fragment hands it to us;
  not yet *used* (refresh is deferred).

## 7. Security

- Token path: fragment → same-origin POST → HttpOnly cookie. Never in
  `localStorage`/`sessionStorage`; scrubbed from the URL via `replaceState`.
- **CSRF / session fixation:** the nonce (cookie + echoed `n`, constant-time
  compared) binds completion to an initiation from *this* browser and is the CSRF
  control for the one state-changing endpoint here. An attacker cannot forge it:
  they can neither read nor set the victim's HttpOnly nonce cookie. Documented as
  the standard pattern for future state-changing POSTs (logout/refresh).
- Failures collapse to one generic message, mirroring the backend's
  indistinguishable-failure design — we must not leak which addresses have accounts.

## 8. Error handling

| Situation | Backend result | Frontend handling |
|---|---|---|
| Any auth failure | `302 {console}/?signin=failed` | root page → `/sign-in?error=google` (generic) |
| Malformed / missing fragment on success landing | — | `/sign-in?error=google` |
| Nonce absent / mismatch | — | `POST /api/auth/session` → 403 → `/sign-in?error=google` |
| `/start` 503 (no OAuth client) | `503` text | gateway's 503 shows for now; friendlier pre-check deferred (§11) |

Edge case: if the backend ever drops the `psk_g_return` cookie, success would land
on `/#token=…` (root, fragment). We rely on `return` being preserved (Lax cookie,
same 10-min window, same origin as `/start`); handling a stray token fragment at
the root is not built.

## 9. Testing

- **Unit (vitest):** fragment parser (2-key success, `signin=failed`, malformed),
  constant-time nonce check, cookie flags, zod body validation.
- **E2E (Playwright):** full run needs the staging backend configured (§3 envs) +
  an active account/pending invite + a Google OAuth client. Until then, drive the
  parse → nonce → cookie path with a **mocked** callback URL (synthetic fragment)
  and assert the cookies are set and the redirect happens.

## 10. Facts — now confirmed (was "open")

Resolved from `PrismSek/Backend` source:

1. **Fragment** — success `#token=<enc>&refresh=<enc>` (two keys only); **failure**
   `?signin=failed` on the console **root**. ✓
2. **`return` + fragment** — `return` preserves a query string and is re-applied to
   the success `dest` before the fragment, so the nonce echo (`?n=…`) works. ✓
3. **Redirect target** — `PSK_CONSOLE_URL` = `https://app.prismsek.com` (per user);
   success uses `PSK_CONSOLE_URL + return`, i.e. `/sign-in/callback`. ✓
4. **Gateway origin** — `GATEWAY_ORIGIN` = `https://staging-gw.prismsek.com` for
   staging (matches where `/v1/` + the docs are served). ✓

**Still required (ops/backend, not this repo):** the staging control-api must have
`PSK_CONSOLE_URL`, `PSK_GOOGLE_REDIRECT_URL`, `PSK_GOOGLE_CLIENT_ID/SECRET` set and
a Google OAuth client whose redirect URI matches — plus a test account — before
end-to-end verification is possible.

## 11. Deferred / future work

Refresh-token rotation (`/v1/auth/refresh`, single-use rotation), logout
(`/v1/auth/logout`), an authenticated gateway proxy for app data (attaching the
Bearer server-side), `/(app)` route-guard middleware, and a friendly "Google
sign-in not configured" (503) screen.
