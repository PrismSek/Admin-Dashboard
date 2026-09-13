import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
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
