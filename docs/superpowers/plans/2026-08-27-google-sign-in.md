# Google Sign-In Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the "Continue with Google" button to the backend's `/v1/auth/google` redirect flow, land the returned session in HttpOnly cookies, and forward the operator to the dashboard.

**Architecture:** Our `/api/auth/google/start` handler mints a nonce (HttpOnly cookie) and 302s to the gateway's start URL, carrying `return=/sign-in/callback?n=<nonce>`. The backend runs the OAuth dance and 302s back to `https://app.prismsek.com/sign-in/callback?n=<nonce>#token=<enc>&refresh=<enc>` on success, or `…/?signin=failed` on any failure. A client callback page reads the fragment + `n`, POSTs to `/api/auth/session`, which verifies the nonce (constant-time) and sets `ps_session`/`ps_refresh` cookies. Failures land on the root, which redirects to `/sign-in?error=google`.

**Tech Stack:** Next 16.3 (App Router, Route Handlers, async `cookies()`/`searchParams`), React 19, zod 4, vitest 4, Node `crypto`.

## Global Constraints

- **Next 16 is not the Next.js you know** — `cookies()` and `searchParams` are async; verify against `node_modules/next/dist/docs/` before changing an API surface.
- **Toolchain is pinned; add NO new runtime dependencies.** Decode the JWT `exp` by hand (no `jose`/`jwt-decode`).
- **All user-facing copy lives in `src/features/auth/content.ts`** — no inline auth strings.
- **No hardcoded design values** — reuse existing tokens/components (`StatusLine`, `buttonVariants`, `text-danger`).
- **Session cookies:** HttpOnly, `Secure` in production, `SameSite=Strict`; the nonce cookie is `SameSite=Lax`. Tokens never touch `localStorage`.
- **Route handlers** set `export const dynamic = "force-dynamic"` and use `NextResponse` + `req.cookies`/`res.cookies`.
- **`server-only` is NOT used in any unit-tested module** (it throws under vitest); testable logic lives in plain modules, cookie-setting is inline in the handlers.
- **`pnpm verify` (lint, typecheck, test, build) must pass** before the feature is done.
- **Gateway origin is server-only config** — `process.env.GATEWAY_ORIGIN`, never `NEXT_PUBLIC_*`.

## File Structure

```
src/features/auth/google/
  constants.ts     cookie names, TTLs, paths, query-param name          (pure)
  fragment.ts      parseSessionFragment(hash) -> {token,refresh}|null    (pure)
  jwt.ts           accessTokenMaxAgeSeconds(token, now, fallback)        (pure, Node Buffer)
  crypto.ts        generateNonce(), constantTimeEqual(a,b)              (pure, Node crypto)
  config.ts        gatewayOrigin(), gatewayStartUrl(nonce)               (reads env)
  schema.ts        sessionPayloadSchema (zod)                            (pure)
src/features/auth/root-redirect.ts   resolveRootDestination(signin)      (pure)
src/app/api/auth/google/start/route.ts   GET  — mint nonce, redirect to gateway
src/app/api/auth/session/route.ts        POST — verify nonce, set session cookies
src/app/(auth)/sign-in/callback/page.tsx client — parse fragment, POST, redirect
vitest.config.ts                          node env + "@" alias (enables tests)
.env.example                              documents GATEWAY_ORIGIN
```

Modified: `src/app/page.tsx` (root failure redirect), `src/app/(auth)/sign-in/page.tsx` (error surface), `src/features/auth/components/sign-in-email-form.tsx` (error banner prop), `src/features/auth/components/provider-buttons.tsx` (Google → link), `src/features/auth/content.ts` (routes + copy).

> **Note on the spec's file list:** spec §5 named `session-cookie.ts` / `oauth-nonce.ts` as `server-only` modules. Because `server-only` throws under vitest and there is no jsdom, this plan keeps the logic in pure, node-testable modules and folds cookie-setting into the handlers. Same behaviour, testable.

---

### Task 1: Test harness + fragment parser

**Files:**
- Create: `vitest.config.ts`
- Create: `src/features/auth/google/fragment.ts`
- Test: `src/features/auth/google/fragment.test.ts`

**Interfaces:**
- Produces: `parseSessionFragment(hash: string): { token: string; refresh: string } | null`

- [ ] **Step 1: Add the vitest config so tests resolve the `@` alias**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: { environment: "node" },
  resolve: { alias: { "@": resolve(process.cwd(), "src") } },
});
```

- [ ] **Step 2: Write the failing test**

```ts
// src/features/auth/google/fragment.test.ts
import { describe, expect, it } from "vitest";
import { parseSessionFragment } from "@/features/auth/google/fragment";

describe("parseSessionFragment", () => {
  it("reads token and refresh from the success fragment", () => {
    expect(parseSessionFragment("#token=abc.def.ghi&refresh=r123")).toEqual({
      token: "abc.def.ghi",
      refresh: "r123",
    });
  });
  it("works without a leading #", () => {
    expect(parseSessionFragment("token=a&refresh=b")).toEqual({ token: "a", refresh: "b" });
  });
  it("returns null when refresh is missing", () => {
    expect(parseSessionFragment("#token=a")).toBeNull();
  });
  it("returns null for an empty fragment", () => {
    expect(parseSessionFragment("#")).toBeNull();
  });
});
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `pnpm vitest run src/features/auth/google/fragment.test.ts`
Expected: FAIL — cannot resolve `@/features/auth/google/fragment`.

- [ ] **Step 4: Implement the parser**

```ts
// src/features/auth/google/fragment.ts
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
```

- [ ] **Step 5: Run tests — expect PASS**

Run: `pnpm vitest run src/features/auth/google/fragment.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts src/features/auth/google/fragment.ts src/features/auth/google/fragment.test.ts
git commit -m "feat(auth): parse Google callback session fragment"
```

---

### Task 2: Access-token TTL from the JWT `exp`

**Files:**
- Create: `src/features/auth/google/jwt.ts`
- Test: `src/features/auth/google/jwt.test.ts`

**Interfaces:**
- Produces: `accessTokenMaxAgeSeconds(token: string, nowSeconds: number, fallbackSeconds: number): number`

- [ ] **Step 1: Write the failing test**

```ts
// src/features/auth/google/jwt.test.ts
import { describe, expect, it } from "vitest";
import { accessTokenMaxAgeSeconds } from "@/features/auth/google/jwt";

const b64url = (s: string) => Buffer.from(s).toString("base64url");
const jwtWithExp = (exp: number) => `${b64url("{}")}.${b64url(JSON.stringify({ exp }))}.sig`;

describe("accessTokenMaxAgeSeconds", () => {
  it("returns seconds remaining until exp", () => {
    expect(accessTokenMaxAgeSeconds(jwtWithExp(1000), 400, 3600)).toBe(600);
  });
  it("returns 0 for an already-expired token", () => {
    expect(accessTokenMaxAgeSeconds(jwtWithExp(100), 400, 3600)).toBe(0);
  });
  it("falls back when exp is missing", () => {
    const noExp = `${b64url("{}")}.${b64url("{}")}.sig`;
    expect(accessTokenMaxAgeSeconds(noExp, 400, 3600)).toBe(3600);
  });
  it("falls back for a malformed token", () => {
    expect(accessTokenMaxAgeSeconds("not-a-jwt", 400, 3600)).toBe(3600);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm vitest run src/features/auth/google/jwt.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// src/features/auth/google/jwt.ts
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
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as {
      exp?: unknown;
    };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm vitest run src/features/auth/google/jwt.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/google/jwt.ts src/features/auth/google/jwt.test.ts
git commit -m "feat(auth): derive session cookie TTL from the access JWT exp"
```

---

### Task 3: Nonce generation + constant-time compare

**Files:**
- Create: `src/features/auth/google/crypto.ts`
- Test: `src/features/auth/google/crypto.test.ts`

**Interfaces:**
- Produces: `generateNonce(): string`, `constantTimeEqual(a: string, b: string): boolean`

- [ ] **Step 1: Write the failing test**

```ts
// src/features/auth/google/crypto.test.ts
import { describe, expect, it } from "vitest";
import { constantTimeEqual, generateNonce } from "@/features/auth/google/crypto";

describe("generateNonce", () => {
  it("returns a 43-char url-safe string (32 bytes base64url) that varies", () => {
    const a = generateNonce();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(a).not.toBe(generateNonce());
  });
});

describe("constantTimeEqual", () => {
  it("is true for equal strings", () => {
    expect(constantTimeEqual("abc123", "abc123")).toBe(true);
  });
  it("is false for different same-length strings", () => {
    expect(constantTimeEqual("abc123", "abc124")).toBe(false);
  });
  it("is false for different-length strings", () => {
    expect(constantTimeEqual("abc", "abcd")).toBe(false);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm vitest run src/features/auth/google/crypto.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// src/features/auth/google/crypto.ts
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
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm vitest run src/features/auth/google/crypto.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/google/crypto.ts src/features/auth/google/crypto.test.ts
git commit -m "feat(auth): nonce generation and constant-time compare"
```

---

### Task 4: Constants + gateway start-URL builder

**Files:**
- Create: `src/features/auth/google/constants.ts`
- Create: `src/features/auth/google/config.ts`
- Create: `.env.example`
- Test: `src/features/auth/google/config.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: constants `NONCE_COOKIE`, `SESSION_COOKIE`, `REFRESH_COOKIE`, `NONCE_MAX_AGE_SECONDS`, `ACCESS_FALLBACK_MAX_AGE_SECONDS`, `REFRESH_MAX_AGE_SECONDS`, `CALLBACK_PATH`, `NONCE_QUERY_PARAM`, `GATEWAY_START_PATH`; functions `gatewayOrigin(): string`, `gatewayStartUrl(nonce: string): string`.

- [ ] **Step 1: Write the constants**

```ts
// src/features/auth/google/constants.ts
export const NONCE_COOKIE = "ps_oauth_nonce";
export const SESSION_COOKIE = "ps_session";
export const REFRESH_COOKIE = "ps_refresh";

export const NONCE_MAX_AGE_SECONDS = 600; // 10 min — matches the backend flow TTL
export const ACCESS_FALLBACK_MAX_AGE_SECONDS = 3600; // used only if the JWT exp is unreadable
export const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days, conservative

export const CALLBACK_PATH = "/sign-in/callback";
export const NONCE_QUERY_PARAM = "n";
export const GATEWAY_START_PATH = "/v1/auth/google/start";
```

- [ ] **Step 2: Write the failing test**

```ts
// src/features/auth/google/config.test.ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { gatewayStartUrl } from "@/features/auth/google/config";

describe("gatewayStartUrl", () => {
  const prev = process.env.GATEWAY_ORIGIN;
  beforeEach(() => { process.env.GATEWAY_ORIGIN = "https://gw.example/"; }); // trailing slash on purpose
  afterEach(() => { process.env.GATEWAY_ORIGIN = prev; });

  it("builds an absolute start URL with the nonce in an encoded same-site return path", () => {
    const url = gatewayStartUrl("NONCE123");
    expect(url).toBe(
      "https://gw.example/v1/auth/google/start?return=" +
        encodeURIComponent("/sign-in/callback?n=NONCE123"),
    );
  });

  it("throws when GATEWAY_ORIGIN is unset", () => {
    delete process.env.GATEWAY_ORIGIN;
    expect(() => gatewayStartUrl("x")).toThrow(/GATEWAY_ORIGIN/);
  });
});
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `pnpm vitest run src/features/auth/google/config.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement the config**

```ts
// src/features/auth/google/config.ts
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
```

- [ ] **Step 5: Create `.env.example`**

```bash
# Admin-plane gateway origin the Google sign-in start handler redirects to.
# Staging: https://staging-gw.prismsek.com    Prod: https://api.prismsek.com
# Server-only (never exposed to the browser). For local dev, copy to .env.local.
GATEWAY_ORIGIN=https://staging-gw.prismsek.com
```

- [ ] **Step 6: Run tests — expect PASS**

Run: `pnpm vitest run src/features/auth/google/config.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add src/features/auth/google/constants.ts src/features/auth/google/config.ts src/features/auth/google/config.test.ts .env.example
git commit -m "feat(auth): Google sign-in constants and gateway start URL"
```

---

### Task 5: Start route handler

**Files:**
- Create: `src/app/api/auth/google/start/route.ts`
- Test: `src/app/api/auth/google/start/route.test.ts`

**Interfaces:**
- Consumes: `generateNonce`, `gatewayStartUrl`, `NONCE_COOKIE`, `NONCE_MAX_AGE_SECONDS`, `authRoutes`.
- Produces: `GET(request: NextRequest): Promise<NextResponse>` — 302 to the gateway with a `ps_oauth_nonce` cookie, or 302 to `/sign-in?error=google` if `GATEWAY_ORIGIN` is missing.

- [ ] **Step 1: Write the failing test**

```ts
// src/app/api/auth/google/start/route.test.ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/auth/google/start/route";
import { NONCE_COOKIE } from "@/features/auth/google/constants";

describe("GET /api/auth/google/start", () => {
  const prev = process.env.GATEWAY_ORIGIN;
  beforeEach(() => { process.env.GATEWAY_ORIGIN = "https://gw.example"; });
  afterEach(() => { process.env.GATEWAY_ORIGIN = prev; });

  it("redirects to the gateway and sets an HttpOnly nonce cookie carrying the same nonce", async () => {
    const res = await GET(new Request("http://localhost/api/auth/google/start") as never);
    expect(res.status).toBe(302);
    const nonce = res.cookies.get(NONCE_COOKIE)?.value;
    expect(nonce).toMatch(/^[A-Za-z0-9_-]{43}$/);

    const location = res.headers.get("location")!;
    expect(location.startsWith("https://gw.example/v1/auth/google/start?return=")).toBe(true);
    expect(decodeURIComponent(location.split("return=")[1])).toBe(`/sign-in/callback?n=${nonce}`);

    const setCookie = res.headers.get("set-cookie")!;
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
    expect(setCookie).toContain("Max-Age=600");
  });

  it("redirects to the generic error when GATEWAY_ORIGIN is unset", async () => {
    delete process.env.GATEWAY_ORIGIN;
    const res = await GET(new Request("http://localhost/api/auth/google/start") as never);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/sign-in?error=google");
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm vitest run src/app/api/auth/google/start/route.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// src/app/api/auth/google/start/route.ts
import { NextResponse, type NextRequest } from "next/server";

import { gatewayStartUrl } from "@/features/auth/google/config";
import { NONCE_COOKIE, NONCE_MAX_AGE_SECONDS } from "@/features/auth/google/constants";
import { generateNonce } from "@/features/auth/google/crypto";
import { authRoutes } from "@/features/auth/content";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const nonce = generateNonce();
    const res = NextResponse.redirect(gatewayStartUrl(nonce), 302);
    res.cookies.set(NONCE_COOKIE, nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: NONCE_MAX_AGE_SECONDS,
    });
    return res;
  } catch {
    // GATEWAY_ORIGIN missing/misconfigured — fail to the generic error.
    return NextResponse.redirect(new URL(`${authRoutes.signIn}?error=google`, request.url));
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm vitest run src/app/api/auth/google/start/route.test.ts`
Expected: PASS (2 tests).

> If importing `next/server` fails under vitest, cover this handler via the Task 10 mocked-E2E instead and keep the pure `gatewayStartUrl` test (Task 4) as the unit guard.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/auth/google/start/route.ts src/app/api/auth/google/start/route.test.ts
git commit -m "feat(auth): Google sign-in start route handler"
```

---

### Task 6: Session route handler (nonce verify + set cookies)

**Files:**
- Create: `src/features/auth/google/schema.ts`
- Create: `src/app/api/auth/session/route.ts`
- Test: `src/app/api/auth/session/route.test.ts`

**Interfaces:**
- Consumes: `accessTokenMaxAgeSeconds`, `constantTimeEqual`, cookie/TTL constants.
- Produces: `POST(request: NextRequest): Promise<NextResponse>` — 204 + `ps_session`/`ps_refresh` cookies on a matching nonce; 403 on nonce mismatch/absence; 400 on a bad body.

- [ ] **Step 1: Write the schema**

```ts
// src/features/auth/google/schema.ts
import { z } from "zod";

export const sessionPayloadSchema = z.object({
  token: z.string().min(1),
  refresh: z.string().min(1),
  n: z.string().min(1),
});
export type SessionPayload = z.infer<typeof sessionPayloadSchema>;
```

- [ ] **Step 2: Write the failing test**

```ts
// src/app/api/auth/session/route.test.ts
import { describe, expect, it } from "vitest";
import type { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/session/route";
import { NONCE_COOKIE, REFRESH_COOKIE, SESSION_COOKIE } from "@/features/auth/google/constants";

const b64url = (s: string) => Buffer.from(s).toString("base64url");
const jwt = (exp: number) => `${b64url("{}")}.${b64url(JSON.stringify({ exp }))}.sig`;

function req(body: unknown, cookieNonce?: string): NextRequest {
  return {
    json: async () => body,
    cookies: {
      get: (name: string) =>
        name === NONCE_COOKIE && cookieNonce !== undefined ? { value: cookieNonce } : undefined,
    },
  } as unknown as NextRequest;
}

describe("POST /api/auth/session", () => {
  it("sets session + refresh cookies when the nonce matches", async () => {
    const token = jwt(9_999_999_999);
    const res = await POST(req({ token, refresh: "r1", n: "good" }, "good"));
    expect(res.status).toBe(204);
    expect(res.cookies.get(SESSION_COOKIE)?.value).toBe(token);
    expect(res.cookies.get(REFRESH_COOKIE)?.value).toBe("r1");
    const setCookie = res.headers.get("set-cookie")!;
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Strict");
  });

  it("returns 403 on a mismatched nonce", async () => {
    const res = await POST(req({ token: "a.b.c", refresh: "r", n: "good" }, "bad"));
    expect(res.status).toBe(403);
  });

  it("returns 403 when the nonce cookie is absent", async () => {
    const res = await POST(req({ token: "a.b.c", refresh: "r", n: "good" }));
    expect(res.status).toBe(403);
  });

  it("returns 400 on a malformed body", async () => {
    const res = await POST(req({ token: "", refresh: "r", n: "good" }, "good"));
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `pnpm vitest run src/app/api/auth/session/route.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement**

```ts
// src/app/api/auth/session/route.ts
import { NextResponse, type NextRequest } from "next/server";

import {
  ACCESS_FALLBACK_MAX_AGE_SECONDS,
  NONCE_COOKIE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE_SECONDS,
  SESSION_COOKIE,
} from "@/features/auth/google/constants";
import { constantTimeEqual } from "@/features/auth/google/crypto";
import { accessTokenMaxAgeSeconds } from "@/features/auth/google/jwt";
import { sessionPayloadSchema } from "@/features/auth/google/schema";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const parsed = sessionPayloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  const { token, refresh, n } = parsed.data;

  const nonce = request.cookies.get(NONCE_COOKIE)?.value;
  if (!nonce || !constantTimeEqual(n, nonce)) {
    return new NextResponse(null, { status: 403 });
  }

  const secure = process.env.NODE_ENV === "production";
  const nowSeconds = Math.floor(Date.now() / 1000);
  const res = new NextResponse(null, { status: 204 });

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: accessTokenMaxAgeSeconds(token, nowSeconds, ACCESS_FALLBACK_MAX_AGE_SECONDS),
  });
  res.cookies.set(REFRESH_COOKIE, refresh, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: REFRESH_MAX_AGE_SECONDS,
  });
  // Burn the single-use nonce.
  res.cookies.set(NONCE_COOKIE, "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
```

- [ ] **Step 5: Run tests — expect PASS**

Run: `pnpm vitest run src/app/api/auth/session/route.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/features/auth/google/schema.ts src/app/api/auth/session/route.ts src/app/api/auth/session/route.test.ts
git commit -m "feat(auth): session route handler with nonce verification"
```

---

### Task 7: Root failure redirect

**Files:**
- Create: `src/features/auth/root-redirect.ts`
- Test: `src/features/auth/root-redirect.test.ts`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: `resolveRootDestination(signin: string | undefined): string`

- [ ] **Step 1: Write the failing test**

```ts
// src/features/auth/root-redirect.test.ts
import { describe, expect, it } from "vitest";
import { resolveRootDestination } from "@/features/auth/root-redirect";

describe("resolveRootDestination", () => {
  it("routes a failed Google sign-in to the sign-in error", () => {
    expect(resolveRootDestination("failed")).toBe("/sign-in?error=google");
  });
  it("routes everything else to plain sign-in", () => {
    expect(resolveRootDestination(undefined)).toBe("/sign-in");
    expect(resolveRootDestination("whatever")).toBe("/sign-in");
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm vitest run src/features/auth/root-redirect.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the helper**

```ts
// src/features/auth/root-redirect.ts
import { authRoutes } from "@/features/auth/content";

/**
 * A failed Google sign-in lands on the console root with `?signin=failed`
 * (see the backend's opaque failure marker). Map it to the generic sign-in
 * error; everything else goes to plain sign-in.
 */
export function resolveRootDestination(signin: string | undefined): string {
  return signin === "failed" ? `${authRoutes.signIn}?error=google` : authRoutes.signIn;
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm vitest run src/features/auth/root-redirect.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Wire it into the root page**

```tsx
// src/app/page.tsx
import { redirect } from "next/navigation";

import { resolveRootDestination } from "@/features/auth/root-redirect";

/**
 * The dashboard is not built yet, so the root forwards to sign-in. A failed
 * Google sign-in returns here as `?signin=failed`; surface it as a generic
 * sign-in error. Once authenticated routes exist this should also check the
 * session and choose dashboard vs sign-in.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ signin?: string }>;
}) {
  const { signin } = await searchParams;
  redirect(resolveRootDestination(signin));
}
```

- [ ] **Step 6: Verify the build accepts the async page**

Run: `pnpm typecheck`
Expected: PASS (no type errors).

- [ ] **Step 7: Commit**

```bash
git add src/features/auth/root-redirect.ts src/features/auth/root-redirect.test.ts src/app/page.tsx
git commit -m "feat(auth): map root ?signin=failed to the sign-in error"
```

---

### Task 8: Content routes + copy, and the sign-in error surface

**Files:**
- Modify: `src/features/auth/content.ts`
- Modify: `src/app/(auth)/sign-in/page.tsx`
- Modify: `src/features/auth/components/sign-in-email-form.tsx`

**Interfaces:**
- Produces: `authRoutes.googleStart` = `"/api/auth/google/start"`; `signInContent.googleError`, `signInContent.googleSigningIn`; `SignInEmailForm` gains an optional `error?: string` prop.

- [ ] **Step 1: Add the route and copy**

In `src/features/auth/content.ts`, add to the `authRoutes` object (after `sso`):

```ts
  /** Our own endpoint that mints the nonce and redirects to the gateway. */
  googleStart: "/api/auth/google/start",
```

And add to the `signInContent` object (after `github`):

```ts
  googleError: "Google sign-in didn't work. Please try again.",
  googleSigningIn: "Signing you in…",
```

- [ ] **Step 2: Add the `error` prop + banner to the form**

In `src/features/auth/components/sign-in-email-form.tsx`, change the signature and render a banner under the heading:

```tsx
export function SignInEmailForm({ error }: { error?: string }) {
```

Immediately after `<AuthHeading title={signInContent.title} />`:

```tsx
      {error ? (
        <p role="alert" className="text-help text-danger">
          {error}
        </p>
      ) : null}
```

- [ ] **Step 3: Read the error param in the sign-in page**

Replace `src/app/(auth)/sign-in/page.tsx` with:

```tsx
import type { Metadata } from "next";

import { AuthSplitLayout } from "@/features/auth/components/auth-split-layout";
import { SignInEmailForm } from "@/features/auth/components/sign-in-email-form";
import { signInContent } from "@/features/auth/content";

export const metadata: Metadata = { title: signInContent.title };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <AuthSplitLayout>
      <SignInEmailForm error={error === "google" ? signInContent.googleError : undefined} />
    </AuthSplitLayout>
  );
}
```

- [ ] **Step 4: Verify types**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/content.ts src/app/\(auth\)/sign-in/page.tsx src/features/auth/components/sign-in-email-form.tsx
git commit -m "feat(auth): sign-in error surface and Google route/copy"
```

---

### Task 9: The callback page + Google button wiring

**Files:**
- Create: `src/app/(auth)/sign-in/callback/page.tsx`
- Modify: `src/features/auth/components/provider-buttons.tsx`

**Interfaces:**
- Consumes: `parseSessionFragment`, `NONCE_QUERY_PARAM`, `authRoutes`, `signInContent`, `StatusLine`.

- [ ] **Step 1: Create the callback page**

```tsx
// src/app/(auth)/sign-in/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { StatusLine } from "@/features/auth/components/spinner";
import { authRoutes, signInContent } from "@/features/auth/content";
import { NONCE_QUERY_PARAM } from "@/features/auth/google/constants";
import { parseSessionFragment } from "@/features/auth/google/fragment";

/**
 * Landing for a successful Google sign-in. The backend returns the session in
 * the URL fragment (never sent to a server), so we read it here, scrub it from
 * the URL, and hand the tokens to /api/auth/session which sets HttpOnly cookies.
 * Any problem falls through to the generic sign-in error.
 */
export default function GoogleCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const fail = () => router.replace(`${authRoutes.signIn}?error=google`);

    const tokens = parseSessionFragment(window.location.hash);
    const nonce = new URLSearchParams(window.location.search).get(NONCE_QUERY_PARAM);
    // Scrub the token fragment (and the nonce query) from URL + history immediately.
    window.history.replaceState(null, "", window.location.pathname);

    if (!tokens || !nonce) {
      fail();
      return;
    }

    fetch("/api/auth/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: tokens.token, refresh: tokens.refresh, n: nonce }),
    })
      .then((res) => (res.ok ? router.replace(authRoutes.dashboard) : fail()))
      .catch(fail);
  }, [router]);

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <StatusLine label={signInContent.googleSigningIn} />
    </main>
  );
}
```

- [ ] **Step 2: Point the Google button at the start endpoint**

In `src/features/auth/components/provider-buttons.tsx`:

Update the import line to bring back `buttonVariants` and add `authRoutes`:

```tsx
import { Button, buttonVariants } from "@/components/ui/button";
import { authRoutes, signInContent } from "@/features/auth/content";
```

Replace the Google `<Button>` block with a real navigation (a full-page `<a>`, because the target 302s cross-origin to the gateway — a client `<Link>` would not follow that):

```tsx
      <a href={authRoutes.googleStart} className={buttonVariants({ variant: "provider" })}>
        <GoogleMark />
        {signInContent.google}
      </a>
```

Leave the GitHub `<Button>` as the stub it is.

- [ ] **Step 3: Verify types + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 4: Build and manually confirm the neutral state renders**

Run: `pnpm build`
Expected: build succeeds; `/sign-in/callback` appears in the route list (static) and `/api/auth/google/start` + `/api/auth/session` appear as ƒ (dynamic).

- [ ] **Step 5: Commit**

```bash
git add src/app/\(auth\)/sign-in/callback/page.tsx src/features/auth/components/provider-buttons.tsx
git commit -m "feat(auth): Google callback page and button wiring"
```

---

### Task 10: Full verification + mocked end-to-end

**Files:**
- Create: `scripts/e2e-google-signin.mjs` (dev-only harness; not shipped)

**Interfaces:**
- Consumes: the running production server.

- [ ] **Step 1: Run the full gate**

Run: `pnpm verify`
Expected: lint, typecheck, all vitest tests, and build all PASS.

- [ ] **Step 2: Write a mocked-callback E2E harness**

This exercises the whole *frontend* loop with a synthetic fragment (no real Google): hit `/api/auth/google/start` to get a real nonce cookie + the echoed `n`, then drive the callback page with a fabricated `#token=…&refresh=…` and assert `ps_session` is set and we land on `/dashboard`.

```js
// scripts/e2e-google-signin.mjs
const pw = await import(
  "file:///Users/ak/prismsek/Admin-Dashboard/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright/index.js"
);
const chromium = pw.default.chromium;

const BASE = process.env.BASE ?? "http://localhost:3117";
const b64url = (s) => Buffer.from(s).toString("base64url");
const jwt = (exp) => `${b64url("{}")}.${b64url(JSON.stringify({ exp }))}.sig`;

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

// 1. Start: capture the nonce the server sets (block the cross-origin hop to the gateway).
await ctx.route("**/v1/auth/google/start**", (route) => route.abort());
await page.goto(`${BASE}/api/auth/google/start`).catch(() => {});
const nonceCookie = (await ctx.cookies()).find((c) => c.name === "ps_oauth_nonce");
if (!nonceCookie) throw new Error("nonce cookie was not set by /start");
const nonce = nonceCookie.value;

// 2. Drive the callback with a synthetic success fragment.
await page.goto(`${BASE}/sign-in/callback?n=${nonce}#token=${jwt(9_999_999_999)}&refresh=r1`);
await page.waitForURL("**/dashboard", { timeout: 5000 });

// 3. Assert the session cookie landed and the nonce was burned.
const cookies = await ctx.cookies();
const session = cookies.find((c) => c.name === "ps_session");
if (!session) throw new Error("ps_session cookie was not set");
if (!session.httpOnly) throw new Error("ps_session must be HttpOnly");
console.log("E2E OK: landed on /dashboard with HttpOnly ps_session");

await browser.close();
```

- [ ] **Step 3: Run the harness against a production build**

```bash
pnpm build
GATEWAY_ORIGIN=https://staging-gw.prismsek.com pnpm start -p 3117 &
SERVER=$!
sleep 4
node scripts/e2e-google-signin.mjs
kill $SERVER
```
Expected: `E2E OK: landed on /dashboard with HttpOnly ps_session`.

- [ ] **Step 4: Commit**

```bash
git add scripts/e2e-google-signin.mjs
git commit -m "test(auth): mocked end-to-end for Google sign-in"
```

- [ ] **Step 5: Real staging check (requires backend config)**

Once the staging control-api has `PSK_CONSOLE_URL=https://app.prismsek.com`, `PSK_GOOGLE_REDIRECT_URL=https://staging-gw.prismsek.com/v1/auth/google/callback`, `PSK_GOOGLE_CLIENT_ID/SECRET`, and a matching Google OAuth client + a test account: deploy the console at `https://app.prismsek.com`, click **Continue with Google**, and confirm you land on `/dashboard` with an HttpOnly `ps_session`. A cancelled/denied consent must land on `/sign-in` showing the generic error.

---

## Self-Review

**Spec coverage:**
- Initiate (button → `/api/auth/google/start` → gateway with nonce): Tasks 5, 9. ✓
- Client fragment callback → session cookie: Tasks 1, 6, 9. ✓
- Nonce CSRF/fixation (mint, echo via `return`, constant-time verify, single-use): Tasks 3, 4, 5, 6. ✓
- Failure marker at root → generic error: Task 7. ✓
- Cookie policy (HttpOnly/Secure/SameSite; TTL from JWT exp): Tasks 2, 6. ✓ (Global Constraints)
- Copy in content.ts, no inline strings: Task 8. ✓
- Config `GATEWAY_ORIGIN` server-only: Task 4. ✓
- Deferred items (refresh rotation, logout, route-guard) intentionally absent. ✓

**Placeholder scan:** No TBD/TODO; every code and test step is complete. Task 5/9's "if `next/server` fails under vitest" note names a concrete fallback (Task 10), not a placeholder.

**Type consistency:** `parseSessionFragment → {token,refresh}`; the session POST body is `{token, refresh, n}` in the schema (Task 6), the fetch (Task 9), and the tests (Task 6) — consistent. Cookie names come only from `constants.ts`. `gatewayStartUrl(nonce)` signature matches its caller in Task 5. `resolveRootDestination(signin)` matches its caller in Task 7.

**Testability caveat (recorded, not a gap):** the callback page and the async root/sign-in pages have no unit tests (no jsdom; server-component `redirect()` throws a control-flow signal). Their *logic* is extracted into tested pure helpers (`parseSessionFragment`, `resolveRootDestination`) and covered end-to-end by the Task 10 harness.
