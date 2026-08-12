import "server-only";

import { departments, type DepartmentSlug } from "@/features/app-shell/nav";

/**
 * Department (group) data for the Manage section.
 *
 * Membership has two sources — directory-derived and direct. Inherited
 * membership follows the user; a direct assignment is an override. That
 * distinction is load-bearing in the UI, so it is modelled explicitly rather
 * than flattened to a boolean label.
 */

export type MembershipSource = "directory-derived" | "direct";
export type MemberStatus = "active" | "pending" | "suspended";

export type DepartmentMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: MemberStatus;
  source: MembershipSource;
};

export type DepartmentEndpoint = {
  id: string;
  name: string;
  deviceId: string;
  assignedUser: string | null;
  protection: "protected" | "attention" | "unknown";
  source: MembershipSource;
};

export type Department = {
  slug: DepartmentSlug;
  label: string;
  description: string;
  directoryOu: string;
  userCount: number;
  manuallyAdded: number;
  endpointCount: number;
  directEndpoints: number;
  inheritedEndpoints: number;
  policyScope: string;
  policyConfig: string;
  lastReviewed: string;
  reviewCadence: string;
  members: DepartmentMember[];
  endpoints: DepartmentEndpoint[];
};

export type ActivityEntry = { title: string; detail: string };

const memberSets: Record<DepartmentSlug, DepartmentMember[]> = {
  finance: [
    { id: "m1", name: "M. Okafor", email: "m.okafor@northwind.com", role: "Analyst", status: "active", source: "directory-derived" },
    { id: "m2", name: "R. Lindqvist", email: "r.lindqvist@northwind.com", role: "Analyst", status: "active", source: "directory-derived" },
    { id: "m3", name: "C. Mbeki", email: "c.mbeki@northwind.com", role: "Controller", status: "pending", source: "directory-derived" },
    { id: "m4", name: "F. Rossi", email: "f.rossi@northwind.com", role: "Analyst", status: "active", source: "directory-derived" },
    { id: "m5", name: "Z. Ferreira", email: "z.ferreira@northwind.com", role: "Manager", status: "active", source: "directory-derived" },
  ],
  legal: [
    { id: "m6", name: "A. Whitfield", email: "a.whitfield@northwind.com", role: "Counsel", status: "active", source: "directory-derived" },
    { id: "m7", name: "N. Haddad", email: "n.haddad@northwind.com", role: "Paralegal", status: "active", source: "directory-derived" },
    { id: "m8", name: "M. Okafor", email: "m.okafor@northwind.com", role: "Analyst", status: "active", source: "direct" },
  ],
  engineering: [
    { id: "m9", name: "H. Beck", email: "h.beck@northwind.com", role: "Staff Engineer", status: "active", source: "directory-derived" },
    { id: "m10", name: "Y. Tanaka", email: "y.tanaka@northwind.com", role: "Engineer", status: "active", source: "directory-derived" },
    { id: "m11", name: "T. Nowak", email: "t.nowak@northwind.com", role: "Engineer", status: "active", source: "directory-derived" },
    { id: "m12", name: "I. Krause", email: "i.krause@northwind.com", role: "Engineer", status: "suspended", source: "directory-derived" },
  ],
  sales: [
    { id: "m13", name: "P. Desai", email: "p.desai@northwind.com", role: "Account Executive", status: "active", source: "directory-derived" },
    { id: "m14", name: "O. Adeyemi", email: "o.adeyemi@northwind.com", role: "Account Executive", status: "active", source: "directory-derived" },
    { id: "m15", name: "D. Rao", email: "d.rao@northwind.com", role: "Sales Manager", status: "active", source: "directory-derived" },
  ],
  "it-operations": [
    { id: "m16", name: "A. Whitfield", email: "a.whitfield@northwind.com", role: "Platform Lead", status: "active", source: "directory-derived" },
    { id: "m17", name: "S. Almeida", email: "s.almeida@northwind.com", role: "SRE", status: "active", source: "directory-derived" },
    { id: "m18", name: "R. Dahl", email: "r.dahl@northwind.com", role: "SRE", status: "active", source: "direct" },
  ],
  "executive-pilot": [
    { id: "m19", name: "A. Osei", email: "a.osei@northwind.com", role: "Org Owner", status: "active", source: "direct" },
    { id: "m20", name: "Z. Ferreira", email: "z.ferreira@northwind.com", role: "Manager", status: "active", source: "direct" },
  ],
};

const endpointSets: Record<DepartmentSlug, DepartmentEndpoint[]> = {
  finance: [
    { id: "e1", name: "FIN-LAP-024", deviceId: "F5B8-0071", assignedUser: "m.okafor@northwind.com", protection: "protected", source: "directory-derived" },
    { id: "e2", name: "FIN-LAP-031", deviceId: "F5B8-0088", assignedUser: "r.lindqvist@northwind.com", protection: "protected", source: "directory-derived" },
    { id: "e3", name: "FIN-DSK-004", deviceId: "F5B8-0104", assignedUser: "c.mbeki@northwind.com", protection: "attention", source: "directory-derived" },
    { id: "e4", name: "FIN-LAP-045", deviceId: "F5B8-0119", assignedUser: "f.rossi@northwind.com", protection: "protected", source: "directory-derived" },
    { id: "e5", name: "FIN-LAP-052", deviceId: "F5B8-0126", assignedUser: "z.ferreira@northwind.com", protection: "unknown", source: "directory-derived" },
  ],
  legal: [
    { id: "e6", name: "LEG-LAP-002", deviceId: "A2C4-0011", assignedUser: "a.whitfield@northwind.com", protection: "protected", source: "directory-derived" },
    { id: "e7", name: "LEG-LAP-008", deviceId: "A2C4-0019", assignedUser: "n.haddad@northwind.com", protection: "protected", source: "directory-derived" },
    { id: "e8", name: "HR-DSK-005", deviceId: "C1F7-5566", assignedUser: "m.hale@northwind.com", protection: "unknown", source: "direct" },
  ],
  engineering: [
    { id: "e9", name: "ENG-MBP-007", deviceId: "F5B8-0290", assignedUser: "h.beck@northwind.com", protection: "unknown", source: "directory-derived" },
    { id: "e10", name: "ENG-MBP-014", deviceId: "F5B8-0301", assignedUser: "y.tanaka@northwind.com", protection: "protected", source: "directory-derived" },
    { id: "e11", name: "ENG-MBP-021", deviceId: "F5B8-0318", assignedUser: "t.nowak@northwind.com", protection: "protected", source: "directory-derived" },
    { id: "e12", name: "ENG-DSK-003", deviceId: "F5B8-0327", assignedUser: "i.krause@northwind.com", protection: "attention", source: "directory-derived" },
  ],
  sales: [
    { id: "e13", name: "SLS-LAP-019", deviceId: "C1F7-4455", assignedUser: "p.desai@northwind.com", protection: "protected", source: "directory-derived" },
    { id: "e14", name: "SLS-LAP-033", deviceId: "C1F7-6677", assignedUser: "o.adeyemi@northwind.com", protection: "protected", source: "directory-derived" },
    { id: "e15", name: "MKT-DSK-011", deviceId: "F5B8-0182", assignedUser: "d.rao@northwind.com", protection: "attention", source: "directory-derived" },
  ],
  "it-operations": [
    { id: "e16", name: "OPS-SRV-002", deviceId: "F5B8-0345", assignedUser: null, protection: "attention", source: "direct" },
    { id: "e17", name: "SRV-DFW-3024", deviceId: "D3E9-0024", assignedUser: null, protection: "protected", source: "direct" },
    { id: "e18", name: "SRV-DFW-3038", deviceId: "D3E9-0038", assignedUser: null, protection: "protected", source: "direct" },
  ],
  "executive-pilot": [
    { id: "e19", name: "EXE-LAP-001", deviceId: "B7A1-0001", assignedUser: "a.osei@northwind.com", protection: "protected", source: "direct" },
    { id: "e20", name: "EXE-LAP-002", deviceId: "B7A1-0002", assignedUser: "z.ferreira@northwind.com", protection: "protected", source: "direct" },
  ],
};

const descriptions: Record<DepartmentSlug, string> = {
  finance:
    "Handles regulated financial records. Strictest DLP scope: clipboard and browser upload interception on, USB write blocked.",
  legal:
    "Holds privileged and contractual material. Retention holds apply; external sharing requires justification.",
  engineering:
    "Source code and build infrastructure. Repository egress and package publishing are inspected.",
  sales:
    "Customer and pipeline data. CRM export interception on; bulk download requires approval.",
  "it-operations":
    "Shared infrastructure and unassigned servers. Membership is largely direct because these endpoints have no assigned user.",
  "executive-pilot":
    "Limited pilot group for evaluating new policy defaults before tenant-wide rollout.",
};

const ous: Record<DepartmentSlug, string> = {
  finance: "OU=Finance",
  legal: "OU=Legal",
  engineering: "OU=Engineering",
  sales: "OU=Sales",
  "it-operations": "OU=ITOps",
  "executive-pilot": "Manual group",
};

export async function getDepartment(slug: string): Promise<Department | undefined> {
  const entry = departments.find((department) => department.slug === slug);
  if (!entry) return undefined;

  const members = memberSets[entry.slug];
  const endpoints = endpointSets[entry.slug];
  const direct = endpoints.filter((endpoint) => endpoint.source === "direct").length;

  return {
    slug: entry.slug,
    label: entry.label,
    description: descriptions[entry.slug],
    directoryOu: ous[entry.slug],
    userCount: members.length,
    manuallyAdded: members.filter((member) => member.source === "direct").length,
    endpointCount: endpoints.length,
    directEndpoints: direct,
    inheritedEndpoints: endpoints.length - direct,
    policyScope: "Scoped",
    policyConfig: "Effective config v18",
    lastReviewed: "05 Aug",
    reviewCadence: "Reviewed monthly",
    members,
    endpoints,
  };
}

/**
 * Candidates for the "add to group" drawer — endpoints and users not already
 * in the department. Server-side so the drawer's list is rendered as HTML.
 */
export async function getCandidates(kind: "users" | "endpoints") {
  if (kind === "endpoints") {
    return [
      { id: "c1", name: "WKS-ATL-0203", detail: "D7A1-4B77 · t.nakamura@northwind.com", status: "Protected", statusTone: "ok" as const },
      { id: "c2", name: "WKS-BOS-0311", detail: "E2C4-1188 · a.delacruz@northwind.com", status: "Unknown", statusTone: "unknown" as const },
      { id: "c3", name: "WKS-BOS-0329", detail: "E2C4-2210 · j.moreau@northwind.com", status: "Protected", statusTone: "ok" as const },
      { id: "c4", name: "WKS-BOS-0350", detail: "E2C4-4402 · p.venkatesan@northwind.com", status: "Protected", statusTone: "ok" as const },
      { id: "c5", name: "LAP-CHI-1002", detail: "F5B8-0071 · k.owusu@northwind.com", status: "Protected", statusTone: "ok" as const },
      { id: "c6", name: "LAP-CHI-1017", detail: "F5B8-0182 · d.schneider@northwind.com", status: "Protected", statusTone: "ok" as const },
    ];
  }

  return [
    { id: "c7", name: "T. Nakamura", detail: "t.nakamura@northwind.com · Analyst", status: "Active", statusTone: "ok" as const },
    { id: "c8", name: "A. Delacruz", detail: "a.delacruz@northwind.com · Viewer", status: "Active", statusTone: "ok" as const },
    { id: "c9", name: "J. Moreau", detail: "j.moreau@northwind.com · Auditor", status: "Active", statusTone: "ok" as const },
    { id: "c10", name: "P. Venkatesan", detail: "p.venkatesan@northwind.com · Analyst", status: "Active", statusTone: "ok" as const },
    { id: "c11", name: "K. Owusu", detail: "k.owusu@northwind.com · Analyst", status: "Active", statusTone: "ok" as const },
  ];
}

export async function getMembershipActivity(): Promise<ActivityEntry[]> {
  return [
    {
      title: "1 user added to Legal as direct member",
      detail: "you · 10 Aug 14:41 UTC · m.okafor",
    },
    {
      title: "SRV-DFW-3024 and SRV-DFW-3038 added to IT Operations as direct members",
      detail: 'a.whitfield · 07 Aug 16:22 UTC · reason "Shared servers have no assigned user"',
    },
    {
      title: "Executive Pilot created with 2 users",
      detail: "a.whitfield · 05 Aug 09:14 UTC",
    },
  ];
}
