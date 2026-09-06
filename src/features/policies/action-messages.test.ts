import { describe, expect, it } from "vitest";

import { describePolicyActionError } from "@/features/policies/action-messages";

describe("describePolicyActionError", () => {
  it("uses one message for a stale ETag across every action", () => {
    expect(describePolicyActionError("enforce", 412)).toMatch(/changed since you opened it/i);
    expect(describePolicyActionError("rollback", 412)).toMatch(/changed since you opened it/i);
  });

  it("explains an illegal lifecycle transition per action", () => {
    expect(describePolicyActionError("enforce", 409)).toMatch(/can'?t be activated/i);
    expect(describePolicyActionError("off", 409)).toMatch(/can'?t be turned off/i);
  });

  it("explains the draft-specific conflicts", () => {
    expect(describePolicyActionError("discardDraft", 409)).toMatch(/no draft to discard/i);
    expect(describePolicyActionError("startDraft", 409)).toMatch(/draft is already open|nothing is published/i);
    expect(describePolicyActionError("rollback", 409)).toMatch(/version/i);
  });

  it("explains create and update conflicts", () => {
    expect(describePolicyActionError("create", 409)).toMatch(/name already exists/i);
    expect(describePolicyActionError("update", 409)).toMatch(/already published/i);
    expect(describePolicyActionError("create", 422)).toMatch(/isn'?t valid/i);
  });

  it("treats 404 as a vanished policy and falls back per action otherwise", () => {
    expect(describePolicyActionError("enforce", 404)).toMatch(/no longer exists/i);
    expect(describePolicyActionError("enforce", 500)).toMatch(/couldn'?t activate/i);
    expect(describePolicyActionError("off", undefined)).toMatch(/couldn'?t turn/i);
  });
});
