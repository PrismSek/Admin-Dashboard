import { configDefaults, defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    // `e2e/**` holds Playwright specs (test:e2e), not Vitest ones — they use
    // @playwright/test's own `test`/`expect` and a live dev server, and Vitest's
    // default include glob (`**/*.spec.ts`) would otherwise try to run them too.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
  resolve: {
    alias: {
      "@": resolve(process.cwd(), "src"),
      // `server-only`'s real entrypoint throws outside an RSC bundle; stub it so
      // server-only modules stay unit testable. The guard still holds in `next build`.
      "server-only": resolve(process.cwd(), "src/test/server-only.stub.ts"),
    },
  },
});
