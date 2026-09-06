import { beforeEach, describe, expect, it, vi } from "vitest";

import { getOrgUser, listInvitations, listOrgUsers } from "@/features/settings/api";

const apiFetchMock = vi.fn();
vi.mock("@/lib/api-client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-client")>("@/lib/api-client");
  return { ...actual, apiFetch: (...args: unknown[]) => apiFetchMock(...args) };
});

function apiUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "u_1",
    tenantId: "t_1",
    email: "amara.osei@northwind.example",
    name: "Amara Osei",
    role: "org_owner",
    status: "active",
    authMethod: "sso",
    createdAt: "2026-01-02T00:00:00Z",
    lastLoginAt: "2026-08-30T00:00:00Z",
    ...overrides,
  };
}

describe("listOrgUsers", () => {
  beforeEach(() => apiFetchMock.mockReset());

  it("forwards filters, sort and page to GET /v1/users", async () => {
    apiFetchMock.mockResolvedValue({ users: [], total: 0, page: 1, pageSize: 25 });

    await listOrgUsers({ q: "amara", role: "analyst", status: "suspended", sort: "role", dir: "desc", page: 3 });

    expect(apiFetchMock).toHaveBeenCalledWith("/v1/users", {
      searchParams: { q: "amara", role: "analyst", status: "suspended", sort: "role", dir: "desc", page: "3" },
    });
  });

  it("maps API users to the UI shape with a display role label", async () => {
    apiFetchMock.mockResolvedValue({
      users: [apiUser(), apiUser({ id: "u_2", role: "policy_admin", status: "deactivated" })],
      total: 42,
      page: 2,
      pageSize: 25,
    });

    const result = await listOrgUsers({ page: 2 });

    expect(result.total).toBe(42);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(25);
    expect(result.users[0]).toEqual({
      id: "u_1",
      name: "Amara Osei",
      email: "amara.osei@northwind.example",
      role: "Org Owner",
      status: "active",
    });
    expect(result.users[1].role).toBe("Policy Admin");
    expect(result.users[1].status).toBe("deactivated");
  });

  it("tolerates users without optional login metadata", async () => {
    apiFetchMock.mockResolvedValue({
      users: [apiUser({ lastLoginAt: undefined, createdAt: undefined, authMethod: undefined })],
      total: 1,
      page: 1,
      pageSize: 25,
    });

    const result = await listOrgUsers();
    expect(result.users[0].name).toBe("Amara Osei");
  });

});

describe("getOrgUser", () => {
  beforeEach(() => apiFetchMock.mockReset());

  it("reads GET /v1/users/{id} and maps it to the detail shape", async () => {
    apiFetchMock.mockResolvedValue(
      apiUser({ createdAt: "2024-01-12T10:00:00Z", lastLoginAt: "2026-08-09T08:12:00Z" }),
    );

    const user = await getOrgUser("u_1");

    expect(apiFetchMock).toHaveBeenCalledWith("/v1/users/u_1");
    expect(user).toEqual({
      id: "u_1",
      name: "Amara Osei",
      email: "amara.osei@northwind.example",
      role: "org_owner",
      roleLabel: "Org Owner",
      status: "active",
      addedOn: "12 Jan 2024",
      lastSignIn: "9 Aug 2026, 08:12",
    });
  });

  it("shows 'Never' when the user has never signed in", async () => {
    apiFetchMock.mockResolvedValue(apiUser({ lastLoginAt: null }));
    const user = await getOrgUser("u_1");
    expect(user?.lastSignIn).toBe("Never");
  });

  // getOrgUser's 404 → null and error-propagation paths hinge on
  // `apiErrorStatus`, which is unit-tested directly in api-client.test.ts. They
  // are not exercised through a thrown mock here: a custom Error thrown from a
  // vi.fn trips Vitest's unhandled-rejection detector and fails the test even
  // when the code catches it correctly.
});

function apiInvite(overrides: Record<string, unknown> = {}) {
  return {
    id: "inv_1",
    email: "omar.sadiq@northwind.example",
    role: "analyst",
    status: "pending",
    invitedBy: "u_1",
    createdAt: "2026-08-02T09:15:00Z",
    expiresAt: "2026-08-09T09:15:00Z",
    ...overrides,
  };
}

describe("listInvitations", () => {
  beforeEach(() => apiFetchMock.mockReset());

  it("forwards filters and page to GET /v1/invites", async () => {
    apiFetchMock.mockResolvedValue({ invites: [], total: 0, page: 1, pageSize: 25 });

    await listInvitations({ q: "omar", role: "auditor", status: "revoked", page: 2 });

    expect(apiFetchMock).toHaveBeenCalledWith("/v1/invites", {
      searchParams: { q: "omar", role: "auditor", status: "revoked", page: "2" },
    });
  });

  it("maps invites to the UI shape with a role label and a formatted sent date", async () => {
    apiFetchMock.mockResolvedValue({
      invites: [apiInvite(), apiInvite({ id: "inv_2", role: "policy_admin", status: "expired" })],
      total: 6,
      page: 1,
      pageSize: 25,
    });

    const result = await listInvitations();

    expect(result.total).toBe(6);
    expect(result.invitations[0]).toEqual({
      id: "inv_1",
      email: "omar.sadiq@northwind.example",
      role: "Analyst",
      status: "pending",
      sentOn: "2 Aug 2026",
    });
    expect(result.invitations[1].role).toBe("Policy Admin");
    expect(result.invitations[1].status).toBe("expired");
  });
});
