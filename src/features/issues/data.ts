import "server-only";

/**
 * Issues (incidents) fixtures matching the Figma "Issues" frame (596:1677) and
 * the severity side panels (597:*). Server-only, like every other feature's
 * data module — swap the bodies for gateway calls (parsed with zod) when the
 * API exists; the async signatures already anticipate it.
 */

export type Severity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "new" | "investigating" | "resolved";
export type IncidentCategory = "exfiltration" | "discovery";

/** One row in the incidents table. */
export type Incident = {
  id: string;
  policy: string;
  rule: string;
  severity: Severity;
  person: string;
  device: string;
  outcome: string;
  outcomeNote: string;
  status: IncidentStatus;
  date: string;
};

export type CaseRecordRow = { label: string; value: string; note: string };
export type EvidenceTone = "neutral" | "amber" | "blue" | "green";
export type EvidenceEvent = {
  time: string;
  title: string;
  badge?: string;
  tone: EvidenceTone;
  description: string;
};
export type TrailEntry = { date: string; time: string; text: string };
export type ContainAction = { title: string; badge: string; description: string };
export type StatusTone = "green" | "amber" | "neutral";

/** The full case shown in the incident drawer. */
export type IncidentDetail = Incident & {
  statusLabel: string;
  statusTone: StatusTone;
  summary: string;
  caseRecord: CaseRecordRow[];
  rawLog: string[];
  evidenceDate: string;
  evidence: EvidenceEvent[];
  trailIntro: string;
  trail: TrailEntry[];
  containActions: ContainAction[];
};

export type IncidentStat = { label: string; value: string; suffix?: string; detail: string };

const INCIDENTS: readonly Incident[] = [
  { id: "INC-2026-4471", policy: "Customer PII shared outside the company", rule: "PII-EXFIL-004", severity: "high", person: "Aisha Sharma", device: "FIN-LT-042", outcome: "Blocked", outcomeNote: "prevented", status: "investigating", date: "21 Aug" },
  { id: "INC-2026-4470", policy: "Source code pushed to a personal repository", rule: "CODE-EXFIL-002", severity: "critical", person: "Rahul Okonjo", device: "ENG-LT-118", outcome: "Data left device", outcomeNote: "not prevented", status: "new", date: "21 Aug" },
  { id: "INC-2026-4468", policy: "Customer PII shared outside the company", rule: "PII-EXFIL-004", severity: "medium", person: "Marta Rey", device: "SUP-LT-330", outcome: "Blocked", outcomeNote: "prevented", status: "investigating", date: "20 Aug" },
  { id: "INC-2026-4465", policy: "Payroll data staged for an unapproved destination", rule: "HR-COMP-002", severity: "high", person: "Jonah Pike", device: "FIN-LT-017", outcome: "Blocked", outcomeNote: "offline", status: "investigating", date: "20 Aug" },
  { id: "INC-2026-4461", policy: "Customer PII shared outside the company", rule: "PII-EXFIL-004", severity: "low", person: "Luca Bianchi", device: "QA-LT-004", outcome: "No real data", outcomeNote: "no match confirmed", status: "resolved", date: "19 Aug" },
  { id: "INC-2026-4458", policy: "Contact list mailed to a personal address", rule: "PII-EXFIL-007", severity: "medium", person: "Priya Nair", device: "MKT-LT-221", outcome: "Blocked", outcomeNote: "prevented", status: "resolved", date: "18 Aug" },
  { id: "INC-2026-4455", policy: "Confidential document uploaded to personal storage", rule: "DOC-EXFIL-003", severity: "high", person: "Daniel Whitcombe", device: "SLS-LT-208", outcome: "Blocked", outcomeNote: "prevented", status: "investigating", date: "18 Aug" },
  { id: "INC-2026-4453", policy: "Sensitive text pasted into a public AI service", rule: "GENAI-DLP-001", severity: "high", person: "Neha Kulkarni", device: "OPS-LT-141", outcome: "Data left device", outcomeNote: "not prevented", status: "new", date: "18 Aug" },
  { id: "INC-2026-4450", policy: "Confidential document uploaded to personal storage", rule: "DOC-EXFIL-003", severity: "medium", person: "Ibrahim Toure", device: "FIN-LT-076", outcome: "Blocked", outcomeNote: "prevented", status: "resolved", date: "17 Aug" },
  { id: "INC-2026-4447", policy: "Customer PII shared outside the company", rule: "PII-EXFIL-004", severity: "medium", person: "Marta Rey", device: "SUP-LT-330", outcome: "Blocked", outcomeNote: "prevented", status: "investigating", date: "20 Aug" },
];

const EXFILTRATION_STATS: readonly IncidentStat[] = [
  { label: "Open incidents", value: "84", suffix: "/ 248", detail: "unresolved right now" },
  { label: "Unclaimed", value: "23", detail: "no owner assigned" },
  { label: "Data left device", value: "19", detail: "prevention did not hold" },
  { label: "Critical & high", value: "31", detail: "open, by severity" },
];

const CONTAIN_ACTIONS: readonly ContainAction[] = [
  { title: "Isolate the endpoint", badge: "Network", description: "Cuts it off the network, keeps it running" },
  { title: "Quarantine the files", badge: "Files", description: "Encrypt and hold, hashes preserved" },
  { title: "Ask the employee why", badge: "24 h", description: "Templated request, 24 h to answer" },
];

function statusFromOutcome(outcome: string): { label: string; tone: StatusTone } {
  if (outcome === "Blocked") return { label: "Blocked — nothing left the device", tone: "green" };
  if (outcome === "Data left device") return { label: "Data left the device", tone: "amber" };
  return { label: "No real data — closed", tone: "neutral" };
}

/** The flagship case (597:*) is reproduced verbatim; every other row gets a
 *  faithful case built from its row so the drawer works for the whole table. */
function buildDetail(incident: Incident): IncidentDetail {
  const status = statusFromOutcome(incident.outcome);
  const destination = incident.outcome === "Blocked" ? "dropbox.com" : "an unmanaged destination";

  if (incident.id === "INC-2026-4471") {
    return {
      ...incident,
      statusLabel: status.label,
      statusTone: status.tone,
      summary:
        "Aisha Sharma tried to move Customer identifiers · 214 matches from FIN-LT-042 to dropbox.com over browser upload. PrismSek blocked it — nothing left the device.",
      caseRecord: [
        { label: "Who", value: "Aisha Sharma", note: "Employee, Finance · manager P. Raghavan" },
        { label: "From", value: "FIN-LT-042", note: "Company laptop · online · PrismSek agent v4.8.2" },
        { label: "What", value: "214 Customer identifiers matches", note: "Detected by rule PII-EXFIL-004 · high severity" },
        { label: "To", value: "dropbox.com", note: "Browser upload · outside the managed estate" },
      ],
      rawLog: [
        "20 Aug 11:05 UTC agent=FIN-LT-017 user=jonah.pike@northwind.com event=channel_activity channel=removable_media",
        "20 Aug 11:05 UTC classifier=HR-COMP-002 matches=3 verdict=match",
        "20 Aug 11:05 UTC destination=Kingston DT101 reputation=unmanaged allowlist=false",
        '20 Aug 11:05 UTC enforcement=blocked_·_offline policy="Payroll data staged for an unapproved destination"',
      ],
      evidenceDate: "21 Aug 2026 · all times IST (UTC+05:30)",
      evidence: [
        { time: "09:14:04", title: "Files read in bulk from C:\\Users\\aishasharma\\OneDrive", tone: "neutral", description: "First time this user has touched that folder in 90 days." },
        { time: "09:16:18", title: "Files zipped into one 22.9 MB archive", badge: "Staged", tone: "amber", description: "Password-protected, saved to the user's Documents folder." },
        { time: "09:18:32", title: "An external dropbox.com session opened", badge: "Personal account", tone: "amber", description: "Signed in with a non-corporate account." },
        { time: "09:18:32", title: "Browser upload matched policy PII-EXFIL-004", badge: "Rule match", tone: "blue", description: "214 Customer identifiers matches, confidence 0.96. Classified restricted." },
        { time: "09:18:32", title: "Transfer blocked — 0 bytes left the device", badge: "Blocked", tone: "green", description: "Blocked by the PrismSek agent. The employee saw a justification prompt and did not answer." },
      ],
      trailIntro: "Every action taken on this case, newest first.",
      trail: [
        { date: "21 Aug", time: "09:14", text: "PrismSek raised this incident automatically" },
        { date: "21 Aug", time: "09:20", text: "You opened it and viewed the masked evidence" },
        { date: "21 Aug", time: "10:04", text: "Assigned to J. Okafor for review" },
      ],
      containActions: [...CONTAIN_ACTIONS],
    };
  }

  return {
    ...incident,
    statusLabel: status.label,
    statusTone: status.tone,
    summary: `${incident.person} tried to move data flagged by ${incident.policy.toLowerCase()} from ${incident.device} to ${destination}. ${
      incident.outcome === "Blocked"
        ? "PrismSek blocked it — nothing left the device."
        : "Some data left the device before enforcement caught up."
    }`,
    caseRecord: [
      { label: "Who", value: incident.person, note: "Employee · manager on file" },
      { label: "From", value: incident.device, note: "Company laptop · PrismSek agent v4.8.2" },
      { label: "What", value: `Matched rule ${incident.rule}`, note: `Detected by ${incident.rule} · ${incident.severity} severity` },
      { label: "To", value: destination, note: "Outside the managed estate" },
    ],
    rawLog: [
      `${incident.date} 11:05 UTC agent=${incident.device} user=${incident.person.toLowerCase().replace(/\s+/g, ".")}@northwind.com event=channel_activity`,
      `${incident.date} 11:05 UTC classifier=${incident.rule} verdict=match`,
      `${incident.date} 11:05 UTC enforcement=${incident.outcome === "Blocked" ? "blocked" : "allowed"} policy="${incident.policy}"`,
    ],
    evidenceDate: `${incident.date} 2026 · all times IST (UTC+05:30)`,
    evidence: [
      { time: "09:16:18", title: "Files staged for transfer", badge: "Staged", tone: "amber", description: "Collected and prepared on the device." },
      { time: "09:18:32", title: `Activity matched policy ${incident.rule}`, badge: "Rule match", tone: "blue", description: `Classified by ${incident.rule}.` },
      {
        time: "09:18:32",
        title: incident.outcome === "Blocked" ? "Transfer blocked" : "Data left the device",
        badge: incident.outcome === "Blocked" ? "Blocked" : "Not prevented",
        tone: incident.outcome === "Blocked" ? "green" : "amber",
        description: incident.outcome === "Blocked" ? "Enforced by the PrismSek agent." : "Enforcement did not hold on this channel.",
      },
    ],
    trailIntro: "Every action taken on this case, newest first.",
    trail: [
      { date: incident.date, time: "09:14", text: "PrismSek raised this incident automatically" },
      { date: incident.date, time: "09:20", text: "You opened it and viewed the masked evidence" },
    ],
    containActions: [...CONTAIN_ACTIONS],
  };
}

export async function getIncidents(): Promise<Incident[]> {
  return [...INCIDENTS];
}

export async function getIncidentStats(): Promise<IncidentStat[]> {
  return [...EXFILTRATION_STATS];
}

export async function getTotalIncidents(): Promise<number> {
  return 248;
}

export async function getIncident(id: string): Promise<IncidentDetail | null> {
  const row = INCIDENTS.find((incident) => incident.id === id);
  return row ? buildDetail(row) : null;
}
