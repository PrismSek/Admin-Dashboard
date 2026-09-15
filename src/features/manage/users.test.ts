import { expect, it } from "vitest";

import {
  getDepartmentSummaries,
  getManageUser,
  getManageUserMemberships,
  getManageUsers,
} from "@/features/manage/users";

it("lists the managed users", async () => {
  const users = await getManageUsers();
  expect(users).toHaveLength(20);
});

it("expands a user with groups and endpoint count derived from the fleet", async () => {
  // Mariam Okafor owns WKS-ATL-0142 (Finance, Executive Pilot) — the detail
  // must resolve to those exact groups and one endpoint (frame 388:7355).
  const mariam = await getManageUser("m01");
  expect(mariam?.name).toBe("Mariam Okafor");
  expect(mariam?.departmentLabel).toBe("Finance");
  expect(mariam?.groups).toEqual(["Finance", "Executive Pilot"]);
  expect(mariam?.assignedEndpoints).toBe(1);
  expect(mariam?.directorySource).toBe("Entra ID · NORTHWIND.LOCAL");
});

it("returns undefined for an unknown id", async () => {
  expect(await getManageUser("nope")).toBeUndefined();
});

it("splits membership into directory (from department) and direct groups", async () => {
  // Mariam: Finance is her department (directory-managed), Executive Pilot was
  // added by hand (direct, removable) — frame 388:8687.
  const memberships = await getManageUserMemberships("m01");
  expect(memberships).toEqual([
    { name: "Finance", source: "directory" },
    { name: "Executive Pilot", source: "direct" },
  ]);
});

it("summarises every department with user and endpoint counts", async () => {
  const summaries = await getDepartmentSummaries();
  const finance = summaries.find((entry) => entry.slug === "finance");
  expect(finance?.label).toBe("Finance");
  expect(finance?.users).toBe(5);
  expect(finance?.endpoints).toBeGreaterThan(0);
});
