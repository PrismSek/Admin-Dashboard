import { describe, expect, it } from "vitest";
import { accessTokenMaxAgeSeconds } from "@/features/auth/google/jwt";

const b64url = (s: string) => Buffer.from(s).toString("base64url");
const jwtWithExp = (exp: number) => `${b64url("{}")}.${b64url(JSON.stringify({ exp }))}.sig`;

describe("accessTokenMaxAgeSeconds", () => {
  it("returns seconds remaining until exp", () => {
    expect(accessTokenMaxAgeSeconds(jwtWithExp(1000), 400, 3600)).toBe(600);
  });
  it("returns 0 for an already-expired token", () => {
    expect(accessTokenMaxAgeSeconds(jwtWithExp(100), 400, 3600)).toBe(0);
  });
  it("falls back when exp is missing", () => {
    const noExp = `${b64url("{}")}.${b64url("{}")}.sig`;
    expect(accessTokenMaxAgeSeconds(noExp, 400, 3600)).toBe(3600);
  });
  it("falls back for a malformed token", () => {
    expect(accessTokenMaxAgeSeconds("not-a-jwt", 400, 3600)).toBe(3600);
  });
});
