import "server-only";

import { type Disposition } from "./disposition";

export { dispositionLabel } from "./disposition";
export type { Disposition } from "./disposition";

/**
 * Domain governance data for Manage → Domains. Server-only fixtures matching
 * the Figma content (frame "Domains (manage)"). When the PrismSek API exists,
 * replace the body of `getDomains` with a call through `lib/api-client.ts` and
 * parse the response with zod — the signature is already async.
 *
 * A domain may appear in more than one collection; the strictest disposition
 * wins, and those rows carry `note` to say so.
 */

export type MatchScope = "domain-subdomains" | "exact";

export type DomainCollection =
  | "Corporate sanctioned"
  | "Personal cloud storage"
  | "Generative AI"
  | "Personal webmail"
  | "Competitor and research";

export type DomainEntry = {
  id: string;
  domain: string;
  /** Shown as a second line, e.g. cross-collection precedence note. */
  note?: string;
  collection: DomainCollection;
  disposition: Disposition;
  matchScope: MatchScope;
  /** "a.whitfield · 03 Aug" or "SYSTEM · tenant provisioning". */
  addedBy: string;
};

export const matchScopeLabel: Record<MatchScope, string> = {
  "domain-subdomains": "Domain + subdomains",
  exact: "Exact domain",
};

export const domainCollections: DomainCollection[] = [
  "Corporate sanctioned",
  "Personal cloud storage",
  "Generative AI",
  "Personal webmail",
  "Competitor and research",
];

const CROSS_LISTED = "Also listed elsewhere — strictest disposition wins";

const domains: DomainEntry[] = [
  { id: "d01", domain: "*.northwind.com", collection: "Corporate sanctioned", disposition: "allowed", matchScope: "domain-subdomains", addedBy: "SYSTEM · tenant provisioning" },
  { id: "d02", domain: "*.sharepoint.com", collection: "Corporate sanctioned", disposition: "allowed", matchScope: "domain-subdomains", addedBy: "a.whitfield · 03 Aug" },
  { id: "d03", domain: "*.salesforce.com", collection: "Corporate sanctioned", disposition: "allowed", matchScope: "domain-subdomains", addedBy: "a.whitfield · 03 Aug" },
  { id: "d04", domain: "workday.com", collection: "Corporate sanctioned", disposition: "allowed", matchScope: "exact", addedBy: "a.whitfield · 04 Aug" },
  { id: "d05", domain: "*.atlassian.net", collection: "Corporate sanctioned", disposition: "allowed", matchScope: "domain-subdomains", addedBy: "j.moreau · 06 Aug" },
  { id: "d06", domain: "*.dropbox.com", note: CROSS_LISTED, collection: "Personal cloud storage", disposition: "blocked", matchScope: "domain-subdomains", addedBy: "a.whitfield · 03 Aug" },
  { id: "d07", domain: "wetransfer.com", collection: "Personal cloud storage", disposition: "blocked", matchScope: "exact", addedBy: "a.whitfield · 03 Aug" },
  { id: "d08", domain: "mega.nz", collection: "Personal cloud storage", disposition: "blocked", matchScope: "exact", addedBy: "a.whitfield · 03 Aug" },
  { id: "d09", domain: "*.box.com", collection: "Personal cloud storage", disposition: "blocked", matchScope: "domain-subdomains", addedBy: "g.haddad · 08 Aug" },
  { id: "d10", domain: "*.openai.com", collection: "Generative AI", disposition: "monitored", matchScope: "domain-subdomains", addedBy: "a.whitfield · 05 Aug" },
  { id: "d11", domain: "claude.ai", collection: "Generative AI", disposition: "monitored", matchScope: "exact", addedBy: "a.whitfield · 05 Aug" },
  { id: "d12", domain: "*.perplexity.ai", collection: "Generative AI", disposition: "monitored", matchScope: "domain-subdomains", addedBy: "k.owusu · 07 Aug" },
  { id: "d13", domain: "gemini.google.com", collection: "Generative AI", disposition: "monitored", matchScope: "exact", addedBy: "k.owusu · 07 Aug" },
  { id: "d14", domain: "mail.google.com", collection: "Personal webmail", disposition: "blocked", matchScope: "exact", addedBy: "a.whitfield · 03 Aug" },
  { id: "d15", domain: "*.mail.yahoo.com", collection: "Personal webmail", disposition: "blocked", matchScope: "domain-subdomains", addedBy: "a.whitfield · 03 Aug" },
  { id: "d16", domain: "outlook.live.com", collection: "Personal webmail", disposition: "blocked", matchScope: "exact", addedBy: "a.whitfield · 03 Aug" },
  { id: "d17", domain: "proton.me", collection: "Personal webmail", disposition: "blocked", matchScope: "exact", addedBy: "v.kowalski · 09 Aug" },
  { id: "d18", domain: "*.crunchbase.com", collection: "Competitor and research", disposition: "monitored", matchScope: "domain-subdomains", addedBy: "o.adeyemi · 06 Aug" },
  { id: "d19", domain: "*.dropbox.com", note: CROSS_LISTED, collection: "Competitor and research", disposition: "monitored", matchScope: "domain-subdomains", addedBy: "o.adeyemi · 06 Aug" },
  { id: "d20", domain: "news.ycombinator.com", collection: "Competitor and research", disposition: "monitored", matchScope: "exact", addedBy: "t.nakamura · 07 Aug" },
];

export async function getDomains(): Promise<DomainEntry[]> {
  return domains;
}
