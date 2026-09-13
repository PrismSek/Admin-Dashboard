import { defineConfig, devices } from "@playwright/test";

/**
 * Authenticated e2e coverage for the signed-in Policy screens (task 11).
 *
 * The dev server boots with a deliberately dead `GATEWAY_ORIGIN` — the
 * Policy list & builder routes read local server fixtures (`data.ts`), never
 * the gateway, so the suite never needs a real backend. `authenticate()`
 * (see `e2e/authenticated-page.ts`) forges the session cookie `proxy.ts`
 * checks; nothing here talks to a live credential store.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    actionTimeout: 10_000,
  },
  webServer: {
    command: "GATEWAY_ORIGIN=http://127.0.0.1:9 pnpm dev --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/sign-in",
    reuseExistingServer: false,
    // `next dev`'s first compile (this route tree, uncached) is slow — give
    // it a lot of runway rather than flaking the whole suite on a cold start.
    timeout: 180_000,
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 957 } },
    },
    {
      name: "narrow",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } },
    },
  ],
});
