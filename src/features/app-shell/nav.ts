/**
 * The app's navigation tree — the single source of truth for sidebar
 * structure, labels, icons and URLs. Add an item here and the sidebar and
 * its active-state highlighting both follow.
 *
 * The signed-in sidebar (Figma "Sidebar" component 635:1239) is a mix of
 * leaf rows (Dashboard, Issues, Policies) and expandable groups (Manage,
 * Settings) whose sub-items indent under the group label. Labels and routes
 * come from `content.ts` so no user-facing copy is inlined here.
 */
import type { AppIconName } from "@/components/icons/AppIcon";
import { appShellContent, appShellRoutes } from "@/features/app-shell/content";

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

/** A top-level row that links straight to a destination. */
export type NavLeaf = {
  kind: "leaf";
  label: string;
  href: string;
  icon: AppIconName;
};

/** A row inside an expandable group — label + destination, no icon. */
export type NavSubItem = { label: string; href: string };

/** An expandable group: an icon + label that discloses a list of sub-items. */
export type NavGroup = {
  kind: "group";
  label: string;
  icon: AppIconName;
  children: readonly NavSubItem[];
};

export type NavItem = NavLeaf | NavGroup;

export const appNavigation: readonly NavItem[] = [
  { kind: "leaf", label: appShellContent.dashboard, href: appShellRoutes.dashboard, icon: "dashboard" },
  { kind: "leaf", label: appShellContent.issues, href: appShellRoutes.issues, icon: "issues" },
  { kind: "leaf", label: appShellContent.policies, href: appShellRoutes.policies, icon: "policy" },
  {
    kind: "group",
    label: appShellContent.manage,
    icon: "manage",
    children: [
      { label: appShellContent.usersAndGroups, href: appShellRoutes.usersAndGroups },
      { label: appShellContent.endpoints, href: appShellRoutes.endpoints },
      { label: appShellContent.deployment, href: appShellRoutes.deployment },
      { label: appShellContent.domains, href: appShellRoutes.domains },
      { label: appShellContent.applications, href: appShellRoutes.applications },
    ],
  },
  {
    kind: "group",
    label: appShellContent.settings,
    icon: "settings",
    children: [
      { label: appShellContent.settingsOverview, href: appShellRoutes.settingsOverview },
      { label: appShellContent.organization, href: appShellRoutes.organization },
      { label: appShellContent.usersAndAccess, href: appShellRoutes.usersAndAccess },
      { label: appShellContent.authenticationSso, href: appShellRoutes.authenticationSso },
      { label: appShellContent.notifications, href: appShellRoutes.notifications },
      { label: appShellContent.profile, href: appShellRoutes.profile },
    ],
  },
];
