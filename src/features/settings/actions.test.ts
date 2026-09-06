import { beforeEach, describe, expect, it, vi } from "vitest";

import { createInvite } from "@/features/settings/actions";

const apiFetchMock = vi.fn();
vi.mock("@/lib/api-client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-client")>("@/lib/api-client");
  return { ...actual, apiFetch: (...args: unknown[]) => apiFetchMock(...args) };
});

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

function created(overrides: Record<string, unknown> = {}) {
  return {
    invite: {
      id: "inv_1",
      tenantId: "t_1",
      email: "omar.sadiq@northwind.example",
      role: "analyst",
      status: "pending",
      invitedBy: "u_1",
      createdAt: "2026-09-07T09:15:00Z",
      expiresAt: "2026-09-14T09:15:00Z",
    },
    token: "raw-token-shown-once",
    ...overrides,
  };
}

describe("createInvite", () => {
  beforeEach(() => apiFetchMock.mockReset());

  it("posts the validated email and role to POST /v1/invites", async () => {
    apiFetchMock.mockResolvedValue(created());

    const result = await createInvite("  Omar.Sadiq@northwind.example  ", "analyst");

    expect(result).toEqual({ ok: true, mailFailed: false });
    expect(apiFetchMock).toHaveBeenCalledWith("/v1/invites", {
      method: "POST",
      body: { email: "Omar.Sadiq@northwind.example", role: "analyst" },
    });
  });

  it("reports mailFailed so the caller can suggest a resend", async () => {
    apiFetchMock.mockResolvedValue(created({ mailFailed: true }));

    const result = await createInvite("omar@northwind.example", "auditor");

    expect(result).toEqual({ ok: true, mailFailed: true });
  });

  it("rejects a malformed email without calling the gateway", async () => {
    const result = await createInvite("not-an-email", "analyst");

    expect(result.ok).toBe(false);
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("rejects an unknown role without calling the gateway", async () => {
    const result = await createInvite("omar@northwind.example", "superuser");

    expect(result.ok).toBe(false);
    expect(apiFetchMock).not.toHaveBeenCalled();
  });
});
