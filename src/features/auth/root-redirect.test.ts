import { describe, expect, it } from "vitest";
import { resolveRootDestination } from "@/features/auth/root-redirect";

describe("resolveRootDestination", () => {
  it("routes a failed Google sign-in to the sign-in error", () => {
    expect(resolveRootDestination("failed")).toBe("/sign-in?error=google");
  });
  it("routes everything else into the app, letting the proxy gate it", () => {
    // Not "/sign-in": a logged-in visitor opening the bare URL must land in the
    // app, never the sign-in screen. The proxy on /dashboard decides logged-in
    // (render, refreshing if needed) vs signed-out (bounce to sign-in).
    expect(resolveRootDestination(undefined)).toBe("/dashboard");
    expect(resolveRootDestination("whatever")).toBe("/dashboard");
  });
});
