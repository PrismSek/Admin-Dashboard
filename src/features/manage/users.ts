import "server-only";

import { departments, type DepartmentSlug } from "@/features/app-shell/nav";
import { getEndpoints, type Endpoint } from "@/features/endpoints/data";

/**
 * Manage → Users & Groups data. The people list is here; the endpoints list is
 * the same fleet the Endpoints screen uses (re-exported below) so the two never
 * drift. Server-only fixtures matching the Figma content. The Department
 * control filters people by `department` and endpoints by their `groups`.
 */

export type MemberStatus = "active" | "invited" | "suspended";

export type ManageUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: DepartmentSlug;
  status: MemberStatus;
};

/** The endpoints tab shows the fleet; one source of truth (see features/endpoints). */
export type ManageEndpoint = Endpoint;
export const getManageEndpoints = getEndpoints;

export const memberStatusLabel: Record<MemberStatus, string> = {
  active: "Active",
  invited: "Invited",
  suspended: "Suspended",
};

/** Status dot tone for `StateMarker`. */
export const memberStatusTone: Record<MemberStatus, "ok" | "warn" | "unknown"> = {
  active: "ok",
  invited: "warn",
  suspended: "unknown",
};

const users: ManageUser[] = [
  { id: "m01", name: "Mariam Okafor", email: "m.okafor@northwind.com", role: "Controller", department: "finance", status: "active" },
  { id: "m02", name: "Rasmus Lindqvist", email: "r.lindqvist@northwind.com", role: "Financial analyst", department: "finance", status: "active" },
  { id: "m03", name: "Fabio Rossi", email: "f.rossi@northwind.com", role: "AP specialist", department: "finance", status: "active" },
  { id: "m04", name: "Zoe Ferreira", email: "z.ferreira@northwind.com", role: "Treasury", department: "finance", status: "active" },
  { id: "m05", name: "Chipo Mbeki", email: "c.mbeki@northwind.com", role: "Payroll", department: "finance", status: "active" },
  { id: "m06", name: "Taro Nakamura", email: "t.nakamura@northwind.com", role: "Counsel", department: "legal", status: "active" },
  { id: "m07", name: "Ana Dela Cruz", email: "a.delacruz@northwind.com", role: "Paralegal", department: "legal", status: "active" },
  { id: "m08", name: "Julien Moreau", email: "j.moreau@northwind.com", role: "Contracts manager", department: "legal", status: "active" },
  { id: "m09", name: "Priya Venkatesan", email: "p.venkatesan@northwind.com", role: "Staff engineer", department: "engineering", status: "active" },
  { id: "m10", name: "Kwame Owusu", email: "k.owusu@northwind.com", role: "Software engineer", department: "engineering", status: "active" },
  { id: "m11", name: "Dana Schneider", email: "d.schneider@northwind.com", role: "Software engineer", department: "engineering", status: "active" },
  { id: "m12", name: "Nana Acheampong", email: "n.acheampong@northwind.com", role: "Site reliability engineer", department: "engineering", status: "active" },
  { id: "m13", name: "Lev Petrov", email: "l.petrov@northwind.com", role: "Software engineer", department: "engineering", status: "invited" },
  { id: "m14", name: "Hana Yamamoto", email: "h.yamamoto@northwind.com", role: "Account executive", department: "sales", status: "active" },
  { id: "m15", name: "George Haddad", email: "g.haddad@northwind.com", role: "Account executive", department: "sales", status: "active" },
  { id: "m16", name: "Winnie Nkemdirim", email: "w.nkemdirim@northwind.com", role: "Sales development rep", department: "sales", status: "active" },
  { id: "m17", name: "Erik Bjornsson", email: "e.bjornsson@northwind.com", role: "Systems administrator", department: "it-operations", status: "active" },
  { id: "m18", name: "Imran Chaudhry", email: "i.chaudhry@northwind.com", role: "Systems administrator", department: "it-operations", status: "active" },
  { id: "m19", name: "Alex Whitfield", email: "a.whitfield@northwind.com", role: "Security administrator", department: "it-operations", status: "active" },
  { id: "m20", name: "Olu Adeyemi", email: "o.adeyemi@northwind.com", role: "Program lead", department: "executive-pilot", status: "suspended" },
];

export async function getManageUsers(): Promise<ManageUser[]> {
  return users;
}

const departmentLabel: Record<string, string> = Object.fromEntries(
  departments.map((d) => [d.slug, d.label]),
);

/** Every managed person is provisioned from the tenant directory. */
const DIRECTORY_SOURCE = "Entra ID · NORTHWIND.LOCAL";

/**
 * One person, expanded for the detail view (frame 388:7355). `groups`,
 * `assignedEndpoints` and the department label are derived from the same
 * endpoint fixtures the fleet uses, so the detail never drifts from the list —
 * e.g. Mariam Okafor resolves to "Finance, Executive Pilot" and 1 endpoint.
 */
export type ManageUserDetail = ManageUser & {
  departmentLabel: string;
  groups: string[];
  directorySource: string;
  assignedEndpoints: number;
};

export async function getManageUser(id: string): Promise<ManageUserDetail | undefined> {
  const user = users.find((entry) => entry.id === id);
  if (!user) return undefined;

  const endpoints = await getManageEndpoints();
  const owned = endpoints.filter((endpoint) => endpoint.assignedUser === user.email);
  const label = departmentLabel[user.department] ?? user.department;
  const groups = Array.from(new Set([label, ...owned.flatMap((endpoint) => endpoint.groups)]));

  return {
    ...user,
    departmentLabel: label,
    groups,
    directorySource: DIRECTORY_SOURCE,
    assignedEndpoints: owned.length,
  };
}

/**
 * One line of the Group membership drawer (frame 388:8687). A `directory` group
 * comes from the user's department (managed by Entra ID, not removable here); a
 * `direct` group was added by hand and can be removed.
 */
export type ManageMembership = {
  name: string;
  source: "directory" | "direct";
};

export async function getManageUserMemberships(id: string): Promise<ManageMembership[]> {
  const detail = await getManageUser(id);
  if (!detail) return [];
  return detail.groups.map((name) => ({
    name,
    source: name === detail.departmentLabel ? "directory" : "direct",
  }));
}

/**
 * Department roll-up for the "Add users → choose a department" drawer (frame
 * 388:22621). Counts are derived from the same people and fleet fixtures the
 * lists use, so they never drift.
 */
export type DepartmentSummary = {
  slug: DepartmentSlug;
  label: string;
  users: number;
  endpoints: number;
};

export async function getDepartmentSummaries(): Promise<DepartmentSummary[]> {
  const endpoints = await getManageEndpoints();
  return departments.map((department) => ({
    slug: department.slug,
    label: department.label,
    users: users.filter((user) => user.department === department.slug).length,
    endpoints: endpoints.filter((endpoint) => endpoint.groups.includes(department.label)).length,
  }));
}
