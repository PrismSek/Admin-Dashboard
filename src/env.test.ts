import { afterEach, describe, expect, it } from "vitest";
import { serverEnv } from "@/env";

describe("serverEnv", () => {
  const prev = process.env.GATEWAY_ORIGIN;
  afterEach(() => { process.env.GATEWAY_ORIGIN = prev; });

  it("returns the validated env when GATEWAY_ORIGIN is a valid URL", () => {
    process.env.GATEWAY_ORIGIN = "https://gw.example";
    expect(serverEnv().GATEWAY_ORIGIN).toBe("https://gw.example");
  });

  it("throws when GATEWAY_ORIGIN is missing", () => {
    delete process.env.GATEWAY_ORIGIN;
    expect(() => serverEnv()).toThrow(/GATEWAY_ORIGIN/);
  });

  it("throws when GATEWAY_ORIGIN is not a URL", () => {
    process.env.GATEWAY_ORIGIN = "not-a-url";
    expect(() => serverEnv()).toThrow(/GATEWAY_ORIGIN/);
  });
});
