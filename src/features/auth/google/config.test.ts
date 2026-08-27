import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { gatewayStartUrl } from "@/features/auth/google/config";

describe("gatewayStartUrl", () => {
  const prev = process.env.GATEWAY_ORIGIN;
  beforeEach(() => { process.env.GATEWAY_ORIGIN = "https://gw.example/"; }); // trailing slash on purpose
  afterEach(() => { process.env.GATEWAY_ORIGIN = prev; });

  it("builds an absolute start URL with the nonce in an encoded same-site return path", () => {
    const url = gatewayStartUrl("NONCE123");
    expect(url).toBe(
      "https://gw.example/v1/auth/google/start?return=" +
        encodeURIComponent("/sign-in/callback?n=NONCE123"),
    );
  });

  it("throws when GATEWAY_ORIGIN is unset", () => {
    delete process.env.GATEWAY_ORIGIN;
    expect(() => gatewayStartUrl("x")).toThrow(/GATEWAY_ORIGIN/);
  });
});
