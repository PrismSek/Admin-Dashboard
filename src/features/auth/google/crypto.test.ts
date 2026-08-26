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
