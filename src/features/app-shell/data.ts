import "server-only";

/**
 * Tenant- and session-level data for the app shell.
 *
 * Server-only by construction: `import "server-only"` turns an accidental
 * client import into a build error rather than a leaked fetch.
 *
 * These are fixtures matching the Figma content. When the PrismSek API exists,
 * replace each body with a call through `lib/api-client.ts` and parse the
 * response with zod — the signatures are already async so callers do not change.
 *
 * The tenant must come from the session, never from a URL parameter
 * (docs/CODING_STANDARDS.md §12).
 */

export type CurrentUser = {
  name: string;
  email: string;
  initials: string;
  role: string;
};

export type Organization = {
  name: string;
  legalName: string;
  displayName: string | null;
  tenantId: string;
  timezone: string;
  language: string;
};

export async function getCurrentUser(): Promise<CurrentUser> {
  return {
    name: "Jae Sanders",
    email: "jae.sanders@northwind.example",
    initials: "JS",
    role: "Org Owner",
  };
}

export async function getOrganization(): Promise<Organization> {
  return {
    name: "Northwind Logistics",
    legalName: "Northwind Logistics, Inc.",
    displayName: null,
    tenantId: "org_9f4c2a7e-northwind",
    timezone: "UTC (Coordinated Universal Time)",
    language: "English (US)",
  };
}
