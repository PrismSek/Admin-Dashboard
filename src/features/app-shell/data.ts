import "server-only";

import { readDisplayUser } from "@/features/auth/display-user";
import { roleLabels } from "@/features/settings/roles";

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

/** Up to two initials from a display name, e.g. "Jae Sanders" → "JS". */
function initialsOf(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean);
  return (letters[0] ?? "") + (letters[letters.length - 1] ?? "");
}

/**
 * The signed-in user for the app shell, from the `ps_user` display cookie the
 * login/refresh routes mint from the gateway's session response.
 *
 * Falls back to a fixture when the cookie is absent — an unauthenticated render,
 * a Google session (whose callback carries only tokens, not a user object), or
 * local dev without a gateway — so the shell still renders. Never used for
 * authorization: that always rides on the verified `ps_session` JWT.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const display = await readDisplayUser();
  if (display) {
    return {
      name: display.name,
      email: display.email,
      initials: initialsOf(display.name).toUpperCase(),
      role: roleLabels[display.role],
    };
  }

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
