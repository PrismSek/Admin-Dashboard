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
