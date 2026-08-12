/**
 * The app's navigation tree — the single source of truth for sidebar
 * structure, labels, icons and URLs. Add a section here and the sidebar,
 * active-state highlighting and breadcrumbs all follow.
 */
import {
  AlertTriangle,
  FolderCog,
  LayoutGrid,
  Laptop,
  Shield,
  Sun,
  type LucideIcon,
} from "lucide-react";

export type NavChild = { label: string; href: string };

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** When present the item is a collapsible group. */
  children?: NavChild[];
};

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

export const primaryNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Incidents", href: "/incidents", icon: AlertTriangle },
  { label: "Policies", href: "/policies", icon: Shield },
  {
    label: "Manage",
    href: "/manage",
    icon: FolderCog,
    children: departments.map((d) => ({ label: d.label, href: `/manage/${d.slug}` })),
  },
  { label: "Endpoints", href: "/endpoints", icon: Laptop },
  { label: "Settings", href: "/settings", icon: Sun, children: settingsNav },
];
