import "server-only";

/**
 * Endpoint fleet data. Server-only fixtures matching the Figma content.
 *
 * Note on `protection`: "unknown" is a first-class state, not a fallback.
 * The design is explicit that an endpoint whose protection evidence could not
 * be established is never rendered as Protected — keep that when wiring the API.
 */

export type Protection = "protected" | "attention" | "unknown";
export type DeploymentState = "current" | "upgrading" | "rolled-back" | "unknown";

export type Endpoint = {
  id: string;
  name: string;
  deviceId: string;
  assignedUser: string | null;
  protection: Protection;
  evidence: string;
  evidenceDetail: string;
  deployment: DeploymentState;
  agentVersion: string;
  lastSeen: string;
  department: string;
};

export type DeploymentStage = {
  stage: string;
  state: "completed" | "active" | "not-required";
  evidence: string;
  freshness: string;
};

export type BrowserCoverage = {
  browser: string;
  status: string;
  summary: string;
  version: string;
  profiles: { name: string; covered: boolean; detail: string }[];
};

export const protectionLabel: Record<Protection, string> = {
  protected: "Protected",
  attention: "Attention",
  unknown: "Unknown",
};

export const deploymentLabel: Record<DeploymentState, string> = {
  current: "Current",
  upgrading: "Upgrading",
  "rolled-back": "Rolled back",
  unknown: "Unknown",
};

const endpoints: Endpoint[] = [
  {
    id: "fin-lap-024",
    name: "FIN-LAP-024",
    deviceId: "F5B8-0071",
    assignedUser: "a.osei@northwind.com",
    protection: "protected",
    evidence: "Agent 7.4.2 · Driver current · Policy v18 ack",
    evidenceDetail: "Extension 3/3 active · 1 profile uncovered",
    deployment: "current",
    agentVersion: "Agent 7.4.2",
    lastSeen: "12 min ago",
    department: "finance",
  },
  {
    id: "mkt-dsk-011",
    name: "MKT-DSK-011",
    deviceId: "F5B8-0182",
    assignedUser: "d.rao@northwind.com",
    protection: "attention",
    evidence: "Upgrade rolled back to 7.2.0 · coverage reduced",
    evidenceDetail: "Extension 1/3 active · 2 profiles uncovered",
    deployment: "rolled-back",
    agentVersion: "Agent 7.2.0",
    lastSeen: "2 hr ago",
    department: "sales",
  },
  {
    id: "eng-mbp-007",
    name: "ENG-MBP-007",
    deviceId: "F5B8-0290",
    assignedUser: "h.beck@northwind.com",
    protection: "unknown",
    evidence: "Evidence stale · last seen 2 days ago",
    evidenceDetail: "Extension coverage unknown",
    deployment: "unknown",
    agentVersion: "Agent 7.2.1",
    lastSeen: "2 days ago",
    department: "engineering",
  },
  {
    id: "ops-srv-002",
    name: "OPS-SRV-002",
    deviceId: "F5B8-0345",
    assignedUser: null,
    protection: "attention",
    evidence: "Agent 6.9.4 · Driver outdated · Policy v17 ack",
    evidenceDetail: "Extension 2/3 active · 1 profile uncovered",
    deployment: "upgrading",
    agentVersion: "Agent 6.9.4",
    lastSeen: "4 hr ago",
    department: "it-operations",
  },
  {
    id: "sls-lap-019",
    name: "SLS-LAP-019",
    deviceId: "C1F7-4455",
    assignedUser: "p.desai@northwind.com",
    protection: "protected",
    evidence: "Agent 7.4.2 · Driver current · Policy v18 ack",
    evidenceDetail: "Extension 3/3 active · 1 profile uncovered",
    deployment: "current",
    agentVersion: "Agent 7.4.2",
    lastSeen: "30 min ago",
    department: "sales",
  },
  {
    id: "hr-dsk-005",
    name: "HR-DSK-005",
    deviceId: "C1F7-5566",
    assignedUser: "m.hale@northwind.com",
    protection: "unknown",
    evidence: "Evidence stale · last seen 8 days ago",
    evidenceDetail: "Extension coverage unknown",
    deployment: "unknown",
    agentVersion: "Agent 7.1.0",
    lastSeen: "8 days ago",
    department: "legal",
  },
  {
    id: "sls-lap-033",
    name: "SLS-LAP-033",
    deviceId: "C1F7-6677",
    assignedUser: "o.adeyemi@northwind.com",
    protection: "protected",
    evidence: "Agent 7.4.1 · Driver current · Policy v17 ack",
    evidenceDetail: "Extension 2/3 active · 2 profiles uncovered",
    deployment: "upgrading",
    agentVersion: "Agent 7.4.1",
    lastSeen: "42 min ago",
    department: "executive-pilot",
  },
];

export async function getEndpoints(): Promise<Endpoint[]> {
  return endpoints;
}

export async function getEndpoint(id: string): Promise<Endpoint | undefined> {
  return endpoints.find((endpoint) => endpoint.id === id);
}

export async function getEndpointCounts() {
  return {
    protected: endpoints.filter((e) => e.protection === "protected").length,
    attention: endpoints.filter((e) => e.protection === "attention").length,
    unknown: endpoints.filter((e) => e.protection === "unknown").length,
    total: endpoints.length,
  };
}

export async function getDeploymentStages(): Promise<DeploymentStage[]> {
  return [
    { stage: "Package delivered", state: "completed", evidence: "Distributed by Intune · package 7.4.2", freshness: "09 Aug 06:12" },
    { stage: "Install completed", state: "completed", evidence: "Agent 7.4.2 installed successfully", freshness: "09 Aug 06:18" },
    { stage: "Enrollment", state: "completed", evidence: "Device identity bound to tenant", freshness: "09 Aug 06:21" },
    { stage: "Backend handshake", state: "completed", evidence: "Signed channel established", freshness: "12 min ago" },
    { stage: "Policy / config activation", state: "active", evidence: "Effective policy acknowledged", freshness: "10 Aug 11:04" },
    { stage: "Reboot", state: "not-required", evidence: "No restart required for current version", freshness: "—" },
    { stage: "Protection active", state: "active", evidence: "Agent 7.4.2 · Driver current · Policy v18 ack", freshness: "12 min ago" },
  ];
}

export async function getBrowserCoverage(): Promise<BrowserCoverage[]> {
  return [
    {
      browser: "Chrome",
      status: "Active",
      summary: "Content inspection and upload interception enforcing",
      version: "v7.4.2 · checked 12 min ago",
      profiles: [{ name: "Default", covered: true, detail: "a.osei@northwind.com" }],
    },
    {
      browser: "Firefox",
      status: "Active",
      summary: "Content inspection and upload interception enforcing",
      version: "v7.4.2 · checked 12 min ago",
      profiles: [{ name: "default-release", covered: true, detail: "a.osei@northwind.com" }],
    },
    {
      browser: "Edge",
      status: "Active",
      summary: "Content inspection and upload interception enforcing",
      version: "v7.4.2 · checked 12 min ago",
      profiles: [
        { name: "Work", covered: true, detail: "a.osei@northwind.com" },
        { name: "Personal", covered: false, detail: "No tenant identity signed in" },
      ],
    },
  ];
}
