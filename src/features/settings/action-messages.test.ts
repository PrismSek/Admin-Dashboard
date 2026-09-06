import { describe, expect, it } from "vitest";

import { describeUserActionError } from "@/features/settings/action-messages";

describe("describeUserActionError", () => {
  it("explains why a role change was refused", () => {
    expect(describeUserActionError("role", 403)).toMatch(/role you already hold/i);
    expect(describeUserActionError("role", 404)).toMatch(/no longer exists/i);
  });

  it("names the last-active-owner guard for suspend and deactivate", () => {
    expect(describeUserActionError("suspend", 409)).toMatch(/last active Org Owner/i);
    expect(describeUserActionError("deactivate", 409)).toMatch(/last active Org Owner/i);
  });

  it("explains the reactivate precondition", () => {
    expect(describeUserActionError("reactivate", 409)).toMatch(/suspended account/i);
  });

  it("reports personal-data deletion as unavailable (501)", () => {
    expect(describeUserActionError("purge", 501)).toMatch(/isn'?t available/i);
    expect(describeUserActionError("purge", 403)).toMatch(/Org Owner/i);
  });

  it("falls back to a generic per-action message for unmapped statuses", () => {
    expect(describeUserActionError("suspend", 500)).toMatch(/couldn'?t suspend/i);
    expect(describeUserActionError("role", undefined)).toMatch(/couldn'?t update the role/i);
  });

  it("explains why an invitation was refused", () => {
    expect(describeUserActionError("invite", 400)).toMatch(/valid email/i);
    expect(describeUserActionError("invite", 403)).toMatch(/role you already hold/i);
    expect(describeUserActionError("invite", 409)).toMatch(/already belongs/i);
    expect(describeUserActionError("invite", 500)).toMatch(/couldn'?t send the invitation/i);
  });

  it("names the resend and revoke preconditions", () => {
    expect(describeUserActionError("resend", 409)).toMatch(/pending or expired/i);
    expect(describeUserActionError("resend", 404)).toMatch(/no longer exists/i);
    expect(describeUserActionError("revoke", 409)).toMatch(/pending invitation/i);
    expect(describeUserActionError("revoke", 404)).toMatch(/no longer exists/i);
  });
});
