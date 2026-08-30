import "server-only";

import { type Disposition } from "./disposition";

export { dispositionLabel } from "./disposition";
export type { Disposition } from "./disposition";

/**
 * Application governance data for Manage → Applications. Server-only fixtures
 * matching the Figma content (frame "Applications (manage)"). Swap the body of
 * `getApplications` for an API call when the backend exists.
 */

export type AppCollection =
  | "Approved productivity"
  | "Remote access tools"
  | "Developer tooling"
  | "Personal messaging";

export type Application = {
  id: string;
  name: string;
  /** "Signed publisher verified" when the binary's signature was validated. */
  verified: boolean;
  collection: AppCollection;
  disposition: Disposition;
  publisher: string;
  /** Relative last-seen, e.g. "12 hours ago". */
  seenOn: string;
  endpointCount: number;
};

export const appCollections: AppCollection[] = [
  "Approved productivity",
  "Remote access tools",
  "Developer tooling",
  "Personal messaging",
];

const applications: Application[] = [
  { id: "a01", name: "Microsoft Word", verified: true, collection: "Approved productivity", disposition: "allowed", publisher: "Microsoft Corporation", seenOn: "12 hours ago", endpointCount: 22 },
  { id: "a02", name: "Microsoft Excel", verified: true, collection: "Approved productivity", disposition: "allowed", publisher: "Microsoft Corporation", seenOn: "6 hours ago", endpointCount: 23 },
  { id: "a03", name: "Microsoft Outlook", verified: true, collection: "Approved productivity", disposition: "allowed", publisher: "Microsoft Corporation", seenOn: "2 hours ago", endpointCount: 23 },
  { id: "a04", name: "Adobe Acrobat", verified: true, collection: "Approved productivity", disposition: "allowed", publisher: "Adobe Inc.", seenOn: "1 day ago", endpointCount: 17 },
  { id: "a05", name: "Slack", verified: true, collection: "Approved productivity", disposition: "allowed", publisher: "Slack Technologies, LLC", seenOn: "45 minutes ago", endpointCount: 21 },
  { id: "a06", name: "TeamViewer", verified: true, collection: "Remote access tools", disposition: "blocked", publisher: "TeamViewer Germany GmbH", seenOn: "3 days ago", endpointCount: 4 },
  { id: "a07", name: "AnyDesk", verified: true, collection: "Remote access tools", disposition: "blocked", publisher: "AnyDesk Software GmbH", seenOn: "9 days ago", endpointCount: 2 },
  { id: "a08", name: "Chrome Remote Desktop", verified: true, collection: "Remote access tools", disposition: "blocked", publisher: "Google LLC", seenOn: "1 month ago", endpointCount: 1 },
  { id: "a09", name: "Visual Studio Code", verified: true, collection: "Developer tooling", disposition: "allowed", publisher: "Microsoft Corporation", seenOn: "4 hours ago", endpointCount: 9 },
  { id: "a10", name: "Git for Windows", verified: true, collection: "Developer tooling", disposition: "allowed", publisher: "Johannes Schindelin", seenOn: "1 day ago", endpointCount: 9 },
  { id: "a11", name: "Docker Desktop", verified: true, collection: "Developer tooling", disposition: "allowed", publisher: "Docker Inc.", seenOn: "2 days ago", endpointCount: 6 },
  { id: "a12", name: "WhatsApp Desktop", verified: true, collection: "Personal messaging", disposition: "monitored", publisher: "WhatsApp LLC", seenOn: "5 hours ago", endpointCount: 7 },
  { id: "a13", name: "Telegram Desktop", verified: true, collection: "Personal messaging", disposition: "monitored", publisher: "Telegram FZ-LLC", seenOn: "2 days ago", endpointCount: 3 },
];

export async function getApplications(): Promise<Application[]> {
  return applications;
}
