import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPolicyDetail, listPolicies } from "@/features/policies/api";

const apiFetchMock = vi.fn();
const apiFetchWithEtagMock = vi.fn();
vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
  apiFetchWithEtag: (...args: unknown[]) => apiFetchWithEtagMock(...args),
}));

function apiPolicy(overrides: Record<string, unknown> = {}) {
  return {
    id: "p1",
    tenantId: "t_1",
    name: "Financial records to unmanaged cloud",
    state: "Active",
    intent: { response: { action: "Block", onUnknown: "WarnJustify" } },
    headVersion: 3,
    updatedBy: "R. Advani",
    updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    ...overrides,
  };
}

describe("listPolicies", () => {
  beforeEach(() => apiFetchMock.mockReset());

  it("maps an active policy to an enforced row with its action label", async () => {
    apiFetchMock.mockResolvedValue({ policies: [apiPolicy()] });

    const [row] = await listPolicies();

    expect(apiFetchMock).toHaveBeenCalledWith("/v1/policies");
    expect(row).toMatchObject({
      id: "p1",
      name: "Financial records to unmanaged cloud",
      lifecycle: "enforced",
      enforcementMode: "Block",
      health: "unknown",
      owner: "R. Advani",
    });
    expect(row.lastChange).toMatch(/ago/);
  });

  it("shows no enforcement mode for draft and off policies", async () => {
    apiFetchMock.mockResolvedValue({
      policies: [
        apiPolicy({ id: "p2", state: "Draft", intent: undefined }),
        apiPolicy({ id: "p3", state: "Off" }),
      ],
    });

    const rows = await listPolicies();
    expect(rows[0]).toMatchObject({ lifecycle: "draft", enforcementMode: null });
    expect(rows[1]).toMatchObject({ lifecycle: "off", enforcementMode: null });
  });

  it("falls back to the creator when a policy has no last editor", async () => {
    apiFetchMock.mockResolvedValue({
      policies: [apiPolicy({ updatedBy: undefined, createdBy: "Compliance" })],
    });
    const [row] = await listPolicies();
    expect(row.owner).toBe("Compliance");
  });
});

describe("getPolicyDetail", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    apiFetchWithEtagMock.mockReset();
  });

  it("returns the parsed policy, its ETag, and its version history", async () => {
    apiFetchWithEtagMock.mockResolvedValue({ data: apiPolicy(), etag: '"v3"' });
    apiFetchMock.mockResolvedValue({ versions: [{ version: 1, state: "Active" }] });

    const detail = await getPolicyDetail("p1");

    expect(apiFetchWithEtagMock).toHaveBeenCalledWith("/v1/policies/p1");
    expect(apiFetchMock).toHaveBeenCalledWith("/v1/policies/p1/versions");
    expect(detail?.policy.name).toBe("Financial records to unmanaged cloud");
    expect(detail?.etag).toBe('"v3"');
    expect(detail?.versions).toEqual([{ version: 1, state: "Active" }]);
  });

  it("prefers the policy body's etag when no header is present", async () => {
    apiFetchWithEtagMock.mockResolvedValue({ data: apiPolicy({ etag: "body-tag" }), etag: null });
    apiFetchMock.mockResolvedValue({ versions: [] });

    const detail = await getPolicyDetail("p1");
    expect(detail?.etag).toBe("body-tag");
  });
});
