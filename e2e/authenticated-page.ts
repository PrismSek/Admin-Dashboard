import type { BrowserContext } from "@playwright/test";

import { SESSION_COOKIE } from "../src/features/auth/google/constants";

/**
 * A structurally-valid, non-secret test JWT: header `{}`, payload
 * `{"exp":4102444800}` (2100-01-01, far future), signature `test`. `exp` is
 * the only claim `proxy.ts` reads — it never verifies the signature itself
 * (the gateway does that when a token is actually *used*) — so this
 * satisfies the route gate without any real credential. It is generated
 * in-process and never sent to any server other than this test's own local
 * `next dev` instance.
 */
const TEST_ACCESS_TOKEN = "e30.eyJleHAiOjQxMDI0NDQ4MDB9.test";

/**
 * Forge a live session for `context` by setting the same cookie `proxy.ts`
 * gates on (see `src/proxy.ts`), before any navigation. Scoped to
 * `127.0.0.1` (not port-specific — cookie domains aren't) so it applies
 * however the dev server's port is configured in `playwright.config.ts`.
 */
export async function authenticate(context: BrowserContext): Promise<void> {
  await context.addCookies([
    {
      name: SESSION_COOKIE,
      value: TEST_ACCESS_TOKEN,
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
}
