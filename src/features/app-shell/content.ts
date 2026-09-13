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
} as const;

export const appShellRoutes = {
  dashboard: "/",
  issues: "/issues",
  policies: "/policies",
  manage: "/manage",
  settings: "/settings",
  helpCentre: "/help",
} as const;
