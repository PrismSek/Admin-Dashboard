import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPolicyDetail, listPolicies } from "@/features/policies/api";
import { getPolicyCatalogs, getPolicyFixtures } from "@/features/policies/data";
import { APP_ICON_NAMES } from "@/components/icons/app-icon-definitions";
import { policyListItemSchema } from "@/features/policies/schemas";
import { z } from "zod";

// The Figma list capture (398:16105) row order, transcribed verbatim. Only 15
// rows exist in that frame — see data.ts's module doc comment for why this
// fixture has 15 rows rather than the 20 the frame's own footer text claims.
const EXPECTED_FIXTURE_NAMES = [
  "Financial records to unmanaged cloud",
  "Customer PII to web destinations",
  "India Aadhaar & PAN — removable media",
  "Source code to personal Git remotes",
  "Highly Confidential label — print",
  "Contract drafts to AI assistants",
  "Patient records to email attachments",
  "Payroll exports to network shares",
  "Cardholder data to removable media",
  "Board minutes to personal email",
  "Screen capture in payroll application",
  "CRM bulk export to browser downloads",
  "Vendor contracts to unmanaged sync",
  "Credentials and API keys to any channel",
  "HR case files to print",
];

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

describe("getPolicyFixtures", () => {
  it("is the Figma reference list (15 rows — see data.ts), each row valid against policyListItemSchema", async () => {
    const fixtures = await getPolicyFixtures();
    expect(fixtures).toHaveLength(EXPECTED_FIXTURE_NAMES.length);
    expect(() =>
      z.array(policyListItemSchema).length(EXPECTED_FIXTURE_NAMES.length).parse(fixtures),
    ).not.toThrow();
  });

  it("keeps its rows in Figma capture order (398:16105)", async () => {
    const fixtures = await getPolicyFixtures();
    expect(fixtures.map((row) => row.name)).toEqual(EXPECTED_FIXTURE_NAMES);
  });

  it("only marks a row enforced with an enforcement mode; draft/off rows carry none", async () => {
    const fixtures = await getPolicyFixtures();
    for (const row of fixtures) {
      if (row.lifecycle === "enforced") {
        expect(typeof row.enforcementMode).toBe("string");
      } else {
        expect(row.enforcementMode).toBeNull();
      }
    }
  });
});

describe("getPolicyCatalogs", () => {
  it("parses every authoring catalog with at least one option", async () => {
    const catalogs = await getPolicyCatalogs();
    for (const [key, options] of Object.entries(catalogs)) {
      expect(options.length, `${key} should not be empty`).toBeGreaterThan(0);
    }
  });

  it("only uses application/channel icons that exist in the AppIcon definitions", async () => {
    const catalogs = await getPolicyCatalogs();
    for (const application of catalogs.applications) {
      expect(APP_ICON_NAMES).toContain(application.icon);
    }
    for (const channel of catalogs.channels) {
      expect(APP_ICON_NAMES).toContain(channel.icon);
    }
  });
});

describe("listPolicies", () => {
  it("delegates to the server-only Figma fixture set", async () => {
    const [viaApi, viaFixtures] = await Promise.all([listPolicies(), getPolicyFixtures()]);
    expect(viaApi).toEqual(viaFixtures);
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
