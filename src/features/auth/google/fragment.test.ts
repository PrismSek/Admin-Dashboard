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
