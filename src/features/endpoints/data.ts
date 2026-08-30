import "server-only";

import { type Protection } from "@/components/app/protection";

/**
 * Endpoint fleet data. Server-only fixtures matching the Figma content
 * (frames "All Endpoints" 388:11973 and the endpoint detail 388:18577). When
 * the PrismSek API exists, replace the bodies below with calls through
 * `lib/api-client.ts` and parse the responses with zod — the signatures are
 * already async.
 *
 * Note on `protection`: "unknown" is a first-class state, not a fallback. The
 * design is explicit that an endpoint whose protection evidence could not be
 * established is never rendered as Protected — keep that when wiring the API.
 * "unknown" endpoints also render their browser-coverage marks faded, because
 * their coverage evidence is likewise unestablished.
 *
 * `online` is independent of `protection`: it drives the fleet "Offline" figure
 * and the detail header Active/Offline pill, and an offline device still has a
 * last-known protection state.
 */

export { protectionLabel } from "@/components/app/protection";
export type { Protection } from "@/components/app/protection";

export type OsFamily = "windows" | "macos" | "ubuntu" | "rhel";

export type EndpointOs = {
  family: OsFamily;
  /** Short label for the list, e.g. "Windows 11". */
  name: string;
  /** Full build for the detail, e.g. "Windows 11 23H2". */
  version: string;
  /** Agent build, e.g. "7.4.2" (the list prefixes "Agent "). */
  agentVersion: string;
};

export type Endpoint = {
  id: string;
  name: string;
  deviceId: string;
  lastSeen: string;
  assignedUser: string | null;
  online: boolean;
  protection: Protection;
  /** Additional covered browsers beyond the three shown, as a "+N" pill. */
  extraBrowsers: number;
  os: EndpointOs;
  endpointType: string;
  groups: string[];
  directoryDomain: string;
  ipAddress: string;
  deploymentState: string;
  channel: string;
};

export type ActivityEvent = {
  kind: "protection" | "info";
  title: string;
  detail: string;
  time: string;
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

const DIRECTORY_DOMAIN = "NORTHWIND.LOCAL";
const CHANNEL = "Signed, mutually authenticated";

/**
 * Compact per-endpoint seed. Detail fields that are constant or derivable
 * (endpoint type, directory domain, channel) are filled in by `build` rather
 * than repeated on every row.
 */
type Seed = {
  id: string;
  name: string;
  deviceId: string;
  lastSeen: string;
  /** Local-part of the assignee, or null for unassigned service hosts. */
  user: string | null;
  family: OsFamily;
  osName: string;
  osVersion: string;
  agent: string;
  protection: Protection;
  online: boolean;
  extra: number;
  groups: string[];
  ip: string;
};

function endpointTypeFor(name: string): string {
  if (name.startsWith("WKS")) return "Workstation";
  if (name.startsWith("LAP")) return "Laptop";
  if (name.startsWith("SRV")) return "Server";
  return "Managed device";
}

function build(seed: Seed): Endpoint {
  return {
    id: seed.id,
    name: seed.name,
    deviceId: seed.deviceId,
    lastSeen: seed.lastSeen,
    assignedUser: seed.user ? `${seed.user}@northwind.com` : null,
    online: seed.online,
    protection: seed.protection,
    extraBrowsers: seed.extra,
    os: {
      family: seed.family,
      name: seed.osName,
      version: seed.osVersion,
      agentVersion: seed.agent,
    },
    endpointType: endpointTypeFor(seed.name),
    groups: seed.groups,
    directoryDomain: DIRECTORY_DOMAIN,
    ipAddress: seed.ip,
    deploymentState: "Enrolled · production ring",
    channel: CHANNEL,
  };
}

// Page 1 (rows 1–20) transcribed from frame 388:11973; page 2 (21–23) continues
// the fleet so the counts read Total 23 / Protected 15 / Attention 5 /
// Unprotected · Unknown 3 / Offline 9.
const seeds: Seed[] = [
  { id: "wks-atl-0142", name: "WKS-ATL-0142", deviceId: "D7A1-2F90", lastSeen: "8 hours ago", user: "m.okafor", family: "windows", osName: "Windows 11", osVersion: "Windows 11 23H2", agent: "7.4.2", protection: "protected", online: true, extra: 1, groups: ["Finance", "Executive Pilot"], ip: "10.12.65.77" },
  { id: "wks-atl-0187", name: "WKS-ATL-0187", deviceId: "D7A1-3C14", lastSeen: "3 days ago", user: "r.lindqvist", family: "windows", osName: "Windows 11", osVersion: "Windows 11 23H2", agent: "7.4.1", protection: "attention", online: false, extra: 1, groups: ["Finance"], ip: "10.12.65.81" },
  { id: "wks-atl-0203", name: "WKS-ATL-0203", deviceId: "D7A1-4B77", lastSeen: "13 min ago", user: "t.nakamura", family: "ubuntu", osName: "Ubuntu 24", osVersion: "Ubuntu 24.04 LTS", agent: "7.4.2", protection: "protected", online: true, extra: 0, groups: ["Engineering"], ip: "10.12.65.93" },
  { id: "wks-bos-0311", name: "WKS-BOS-0311", deviceId: "E2C4-1188", lastSeen: "Yesterday", user: "a.delacruz", family: "windows", osName: "Windows 11", osVersion: "Windows 11 23H2", agent: "7.3.9", protection: "unknown", online: false, extra: 0, groups: ["Sales"], ip: "10.12.66.12" },
  { id: "wks-bos-0329", name: "WKS-BOS-0329", deviceId: "E2C4-2210", lastSeen: "24 min ago", user: "j.moreau", family: "macos", osName: "macOS 15", osVersion: "macOS 15 Sequoia", agent: "7.4.2", protection: "protected", online: true, extra: 1, groups: ["Engineering"], ip: "10.12.66.24" },
  { id: "wks-bos-0350", name: "WKS-BOS-0350", deviceId: "E2C4-4402", lastSeen: "53 min ago", user: "p.venkatesan", family: "ubuntu", osName: "Ubuntu 24", osVersion: "Ubuntu 24.04 LTS", agent: "7.4.2", protection: "protected", online: true, extra: 1, groups: ["Engineering"], ip: "10.12.66.40" },
  { id: "lap-chi-1002", name: "LAP-CHI-1002", deviceId: "F5B8-0071", lastSeen: "8 hours ago", user: "k.owusu", family: "macos", osName: "macOS 15", osVersion: "macOS 15 Sequoia", agent: "7.4.2", protection: "protected", online: true, extra: 0, groups: ["Executive Pilot"], ip: "10.12.70.5" },
  { id: "lap-chi-1017", name: "LAP-CHI-1017", deviceId: "F5B8-0182", lastSeen: "8 hours ago", user: "d.schneider", family: "windows", osName: "Windows 11", osVersion: "Windows 11 23H2", agent: "7.4.2", protection: "protected", online: true, extra: 0, groups: ["Legal"], ip: "10.12.70.17" },
  { id: "lap-chi-1044", name: "LAP-CHI-1044", deviceId: "F5B8-0290", lastSeen: "8 hours ago", user: "n.acheampong", family: "windows", osName: "Windows 11", osVersion: "Windows 11 23H2", agent: "7.4.2", protection: "protected", online: true, extra: 1, groups: ["Sales"], ip: "10.12.70.44" },
  { id: "lap-chi-1055", name: "LAP-CHI-1055", deviceId: "F5B8-0345", lastSeen: "5 days ago", user: "l.petrov", family: "windows", osName: "Windows 10", osVersion: "Windows 10 22H2", agent: "7.4.0", protection: "attention", online: false, extra: 2, groups: ["Sales"], ip: "10.12.70.55" },
  { id: "lap-chi-1078", name: "LAP-CHI-1078", deviceId: "F5B8-0417", lastSeen: "Yesterday", user: "h.yamamoto", family: "macos", osName: "macOS 14", osVersion: "macOS 14 Sonoma", agent: "7.4.2", protection: "protected", online: false, extra: 0, groups: ["Finance"], ip: "10.12.70.78" },
  { id: "wks-den-2201", name: "WKS-DEN-2201", deviceId: "A3D9-5510", lastSeen: "20 min ago", user: "c.mbeki", family: "windows", osName: "Windows 11", osVersion: "Windows 11 23H2", agent: "7.3.9", protection: "unknown", online: false, extra: 0, groups: ["IT Operations"], ip: "10.12.72.1" },
  { id: "wks-den-2216", name: "WKS-DEN-2216", deviceId: "A3D9-6621", lastSeen: "56 min ago", user: "f.rossi", family: "windows", osName: "Windows 11", osVersion: "Windows 11 23H2", agent: "7.4.2", protection: "protected", online: true, extra: 0, groups: ["IT Operations"], ip: "10.12.72.16" },
  { id: "wks-den-2230", name: "WKS-DEN-2230", deviceId: "A3D9-7732", lastSeen: "6 days ago", user: "g.haddad", family: "windows", osName: "Windows 11", osVersion: "Windows 11 23H2", agent: "7.4.1", protection: "attention", online: false, extra: 1, groups: ["IT Operations"], ip: "10.12.72.30" },
  { id: "wks-den-2248", name: "WKS-DEN-2248", deviceId: "A3D9-8843", lastSeen: "41 min ago", user: "w.nkemdirim", family: "windows", osName: "Windows 11", osVersion: "Windows 11 23H2", agent: "7.4.2", protection: "protected", online: true, extra: 0, groups: ["Engineering"], ip: "10.12.72.48" },
  { id: "srv-dfw-3010", name: "SRV-DFW-3010", deviceId: "B8E2-1120", lastSeen: "51 min ago", user: null, family: "windows", osName: "Windows 2022", osVersion: "Windows Server 2022", agent: "7.4.2", protection: "protected", online: true, extra: 0, groups: ["IT Operations"], ip: "10.12.80.10" },
  { id: "srv-dfw-3024", name: "SRV-DFW-3024", deviceId: "B8E2-2231", lastSeen: "5 days ago", user: null, family: "rhel", osName: "RHEL 9", osVersion: "RHEL 9.4", agent: "7.4.1", protection: "attention", online: false, extra: 1, groups: ["IT Operations"], ip: "10.12.80.24" },
  { id: "srv-dfw-3038", name: "SRV-DFW-3038", deviceId: "B8E2-3342", lastSeen: "8 hours ago", user: null, family: "windows", osName: "Windows 2019", osVersion: "Windows Server 2019", agent: "7.4.2", protection: "protected", online: true, extra: 1, groups: ["IT Operations"], ip: "10.12.80.38" },
  { id: "lap-sea-4101", name: "LAP-SEA-4101", deviceId: "C1F7-4455", lastSeen: "21 min ago", user: "e.bjornsson", family: "windows", osName: "Windows 11", osVersion: "Windows 11 23H2", agent: "7.4.2", protection: "protected", online: true, extra: 0, groups: ["Sales"], ip: "10.12.84.1" },
  { id: "lap-sea-4119", name: "LAP-SEA-4119", deviceId: "C1F7-5566", lastSeen: "7 hours ago", user: "i.chaudhry", family: "ubuntu", osName: "Ubuntu 22", osVersion: "Ubuntu 22.04 LTS", agent: "7.3.9", protection: "unknown", online: false, extra: 0, groups: ["Engineering"], ip: "10.12.84.19" },
  { id: "lap-sea-4210", name: "LAP-SEA-4210", deviceId: "C1F7-6120", lastSeen: "2 hours ago", user: "s.almeida", family: "windows", osName: "Windows 11", osVersion: "Windows 11 23H2", agent: "7.4.2", protection: "protected", online: true, extra: 1, groups: ["Finance"], ip: "10.12.84.30" },
  { id: "srv-pdx-5007", name: "SRV-PDX-5007", deviceId: "D4A7-3301", lastSeen: "4 days ago", user: null, family: "rhel", osName: "RHEL 9", osVersion: "RHEL 9.4", agent: "7.4.0", protection: "attention", online: false, extra: 1, groups: ["IT Operations"], ip: "10.12.88.7" },
  { id: "lap-pdx-5142", name: "LAP-PDX-5142", deviceId: "D4A7-4412", lastSeen: "33 min ago", user: "v.kowalski", family: "macos", osName: "macOS 15", osVersion: "macOS 15 Sequoia", agent: "7.4.2", protection: "protected", online: true, extra: 0, groups: ["Executive Pilot"], ip: "10.12.88.42" },
];

const endpoints: Endpoint[] = seeds.map(build);

export async function getEndpoints(): Promise<Endpoint[]> {
  return endpoints;
}

export async function getEndpoint(id: string): Promise<Endpoint | undefined> {
  return endpoints.find((endpoint) => endpoint.id === id);
}

export async function getEndpointCounts() {
  return {
    total: endpoints.length,
    protected: endpoints.filter((e) => e.protection === "protected").length,
    attention: endpoints.filter((e) => e.protection === "attention").length,
    unknown: endpoints.filter((e) => e.protection === "unknown").length,
    offline: endpoints.filter((e) => !e.online).length,
  };
}

// Illustrative recent-activity feed for the detail Overview. Same shape the
// audit API will return; not endpoint-specific in the fixture.
export async function getRecentActivity(_id: string): Promise<ActivityEvent[]> {
  return [
    { kind: "protection", title: "Protection status changed to Protected", detail: "Policy v18 acknowledged", time: "12 min ago" },
    { kind: "info", title: "Connection established", detail: "Signed channel active", time: "12 min ago" },
    { kind: "protection", title: "Agent updated to 7.4.2", detail: "Driver reloaded, no reboot required", time: "Yesterday" },
    { kind: "info", title: "Added to Finance", detail: "Inherited from Mariam Okafor", time: "10 Aug 09:00" },
  ];
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
      profiles: [{ name: "Default", covered: true, detail: "m.okafor@northwind.com" }],
    },
    {
      browser: "Firefox",
      status: "Active",
      summary: "Content inspection and upload interception enforcing",
      version: "v7.4.2 · checked 12 min ago",
      profiles: [{ name: "default-release", covered: true, detail: "m.okafor@northwind.com" }],
    },
    {
      browser: "Edge",
      status: "Active",
      summary: "Content inspection and upload interception enforcing",
      version: "v7.4.2 · checked 12 min ago",
      profiles: [
        { name: "Work", covered: true, detail: "m.okafor@northwind.com" },
        { name: "Personal", covered: false, detail: "no tenant identity signed in" },
      ],
    },
  ];
}
