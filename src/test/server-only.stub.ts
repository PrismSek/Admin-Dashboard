// Test stub for the `server-only` marker package. Its real entrypoint throws
// when bundled outside a React Server Component, which breaks Vitest's Node
// environment. Aliased in vitest.config.ts so server-only modules stay unit
// testable without weakening the guard in the actual build.
export {};
