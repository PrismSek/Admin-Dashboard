/**
 * The app's navigation tree — the single source of truth for sidebar
 * structure, labels, icons and URLs. Add an item here and the sidebar and
 * its active-state highlighting both follow.
 *
 * The signed-in sidebar (Figma, node 398:16105 "Policies") is a flat list —
 * no OVERVIEW/ACCOUNT section grouping — so this is a flat array rather than
 * a tree of sections.
 */
import type { AppIconName } from "@/components/icons/AppIcon";
import { appShellContent, appShellRoutes } from "@/features/app-shell/content";

export type NavChild = { label: string; href: string };

/** Departments under Manage. Slugs are used in `/manage/[department]`. */
export const departments = [
  { slug: "finance", label: "Finance" },
  { slug: "legal", label: "Legal" },
  { slug: "engineering", label: "Engineering" },
  { slug: "sales", label: "Sales" },
  { slug: "it-operations", label: "IT Operations" },
  { slug: "executive-pilot", label: "Executive Pilot" },
] as const;

export type DepartmentSlug = (typeof departments)[number]["slug"];

export const settingsNav: NavChild[] = [
  { label: "Overview", href: "/settings/overview" },
  { label: "Organization", href: "/settings/organization" },
  { label: "Users and Access", href: "/settings/users" },
  { label: "Authentication / SSO", href: "/settings/sso" },
  { label: "Notifications", href: "/settings/notifications" },
  { label: "Profile", href: "/settings/profile" },
];

export type AppNavItem = {
  label: string;
  href: string;
  icon: AppIconName;
};

export const appNavigation: readonly AppNavItem[] = [
  { label: appShellContent.dashboard, href: appShellRoutes.dashboard, icon: "dashboard" },
  { label: appShellContent.issues, href: appShellRoutes.issues, icon: "issues" },
  { label: appShellContent.policies, href: appShellRoutes.policies, icon: "policy" },
  { label: appShellContent.manage, href: appShellRoutes.manage, icon: "manage" },
  { label: appShellContent.settings, href: appShellRoutes.settings, icon: "settings" },
] as const;
