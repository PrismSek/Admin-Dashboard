/**
 * Every user-facing string and route in the signed-in app shell, in one
 * place — the sidebar, the content header and their nav items all read from
 * here rather than inlining copy (docs/CODING_STANDARDS.md, AGENTS.md).
 */

export const appShellContent = {
  mainNavLabel: "Main",
  dashboard: "Dashboard",
  issues: "Issues",
  policies: "Policies",
  manage: "Manage",
  settings: "Settings",
  helpCentre: "Help Centre",
  logOut: "Log out",
  search: "Search",
  notifications: "Notifications",
  openNavigation: "Open navigation",
  // Manage group sub-items
  usersAndGroups: "Users and Groups",
  endpoints: "Endpoints",
  deployment: "Deployment",
  domains: "Domains",
  applications: "Applications",
  // Settings group sub-items
  settingsOverview: "Overview",
  organization: "Organization",
  usersAndAccess: "Users and Access",
  authenticationSso: "Authentication/SSO",
  profile: "Profile",
} as const;

export const appShellRoutes = {
  dashboard: "/",
  issues: "/issues",
  policies: "/policies",
  manage: "/manage",
  settings: "/settings",
  helpCentre: "/help",
  // Manage group sub-items
  usersAndGroups: "/manage/users",
  endpoints: "/endpoints",
  deployment: "/manage/deployment",
  domains: "/manage/domains",
  applications: "/manage/applications",
  // Settings group sub-items
  settingsOverview: "/settings/overview",
  organization: "/settings/organization",
  usersAndAccess: "/settings/users",
  authenticationSso: "/settings/sso",
  notifications: "/settings/notifications",
  profile: "/settings/profile",
} as const;
