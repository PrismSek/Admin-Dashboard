import "server-only";

/**
 * Deployment (agent rollout) fixtures — Figma "Deployment (manage)" (2004:1355)
 * and the 3-step launch wizard (2069:12702, 2025:6644, 2025:7102). Server-only,
 * swap for gateway calls (zod-parsed) when the API lands.
 */

export type CampaignState = "on-track" | "expired" | "draft";

export type Campaign = {
  id: string;
  name: string;
  detail: string;
  recipients: string;
  protectedCount: number;
  total: number;
  progressNote: string;
  expires: string;
  created: string;
};

export type ProtectionState =
  | "needs-it"
  | "blocked"
  | "wrong-device"
  | "awaiting-restart"
  | "invited";

export type UnprotectedPerson = {
  id: string;
  name: string;
  email: string;
  department: string;
  campaign: string;
  state: ProtectionState;
  stateTone: "warn" | "danger" | "neutral";
  note: string;
};

export type DeployStat = { label: string; value: string };

export type AgentRelease = {
  version: string;
  released: string;
  channel: string;
};

const AGENT: AgentRelease = { version: "Agent 7.4.2", released: "Released 2 Sep 2026", channel: "Latest" };

const STATS: readonly DeployStat[] = [
  { label: "Employees", value: "50" },
  { label: "Protected devices", value: "32" },
  { label: "Installing", value: "7" },
  { label: "Needs attention", value: "3" },
  { label: "Not started", value: "8" },
];

const CAMPAIGNS: readonly Campaign[] = [
  { id: "windows-agent-rollout", name: "Windows agent rollout", detail: "All employees · self-install link", recipients: "50 employees", protectedCount: 18, total: 50, progressNote: "18 protected · 6 installing", expires: "In 5 days", created: "8 Sep 2026" },
  { id: "contractor-laptops", name: "Contractor laptops", detail: "9 people · IT approval required", recipients: "9 people", protectedCount: 2, total: 9, progressNote: "2 protected · 1 needs IT", expires: "In 12 days", created: "6 Sep 2026" },
  { id: "finance-pilot", name: "Finance pilot", detail: "Finance department", recipients: "12 employees", protectedCount: 12, total: 12, progressNote: "12 protected", expires: "Expired", created: "24 Aug 2026" },
  { id: "engineering-re-enrol", name: "Engineering re-enrol", detail: "Agent 7.4 upgrade", recipients: "20 employees", protectedCount: 20, total: 20, progressNote: "20 protected", expires: "Expired", created: "12 Aug 2026" },
  { id: "sales-new-joiners", name: "Sales — new joiners", detail: "Onboarding batch, September", recipients: "6 employees", protectedCount: 3, total: 6, progressNote: "3 protected · 1 installing", expires: "In 9 days", created: "4 Sep 2026" },
  { id: "operations-berlin", name: "Operations — Berlin site", detail: "Site rollout, wave 2", recipients: "14 employees", protectedCount: 13, total: 14, progressNote: "13 protected · 1 offline", expires: "Expired", created: "28 Aug 2026" },
  { id: "hr-shared-workstations", name: "HR — shared workstations", detail: "Kiosk profile, restart required", recipients: "5 devices", protectedCount: 2, total: 5, progressNote: "2 protected · 1 awaiting restart", expires: "In 3 days", created: "2 Sep 2026" },
  { id: "executive-laptops", name: "Executive laptops", detail: "Draft — not launched", recipients: "4 employees", protectedCount: 0, total: 4, progressNote: "Not started", expires: "—", created: "1 Sep 2026" },
];

const UNPROTECTED: readonly UnprotectedPerson[] = [
  { id: "elena-brandt", name: "Elena Brandt", email: "e.brandt@northwind.com", department: "Sales", campaign: "Windows agent rollout", state: "needs-it", stateTone: "warn", note: "REQ-7412 · raised 6 min ago" },
  { id: "omar-haddad", name: "Omar Haddad", email: "o.haddad@northwind.com", department: "Engineering", campaign: "Windows agent rollout", state: "blocked", stateTone: "danger", note: "Unsupported Windows version" },
  { id: "lena-moreau", name: "Lena Moreau", email: "l.moreau@northwind.com", department: "Finance", campaign: "Windows agent rollout", state: "wrong-device", stateTone: "warn", note: "Opened on a Mac — needs Windows" },
  { id: "tomas-silva", name: "Tomas Silva", email: "t.silva@northwind.com", department: "Operations", campaign: "Windows agent rollout", state: "awaiting-restart", stateTone: "warn", note: "Drivers activate after restart" },
  { id: "victor-petrov", name: "Victor Petrov", email: "v.petrov@northwind.com", department: "Sales", campaign: "Windows agent rollout", state: "invited", stateTone: "neutral", note: "No activity for 1 day" },
  { id: "sofia-bjornsson", name: "Sofia Bjornsson", email: "s.bjornsson@northwind.com", department: "HR", campaign: "Contractor laptops", state: "invited", stateTone: "neutral", note: "No activity for 2 days" },
];

export const stateLabel: Record<ProtectionState, string> = {
  "needs-it": "Needs IT approval",
  blocked: "Blocked",
  "wrong-device": "Wrong device",
  "awaiting-restart": "Awaiting restart",
  invited: "Invited",
};

export async function getAgentRelease(): Promise<AgentRelease> {
  return AGENT;
}
export async function getDeployStats(): Promise<DeployStat[]> {
  return [...STATS];
}
export async function getCampaigns(): Promise<Campaign[]> {
  return [...CAMPAIGNS];
}
export async function getUnprotected(): Promise<UnprotectedPerson[]> {
  return [...UNPROTECTED];
}
