import "server-only";

import { type DepartmentSlug } from "@/features/app-shell/nav";
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
