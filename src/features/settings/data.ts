import "server-only";

/**
 * Settings data. Server-only fixtures matching the Figma content; swap each
 * body for a call through `lib/api-client.ts` when the API exists. User reads
 * now go through `features/settings/api.ts`; the rest are still fixtures.
 * Role values and labels live in `roles.ts` so the client drawer can share them.
 */

export type UserStatus = "active" | "suspended" | "pending" | "deactivated";

export type OrgUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
};

export type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

export type Invitation = {
  id: string;
  email: string;
  role: string;
  status: InvitationStatus;
  sentOn: string;
};

export type AttentionItem = {
  id: string;
  icon: "sso" | "invite" | "bell";
  title: string;
  tag: { label: string; tone: "warn" | "info" | "neutral" };
  description: string;
  actionLabel: string;
  href: string;
  emphasis: "brand" | "link";
};

export type SettingsCategory = {
  title: string;
  description: string;
  status: string;
  statusTone: "dim" | "ok";
  href: string;
  icon: "building" | "users" | "shield" | "bell";
};

export type SsoConfig = {
  connected: boolean;
  provider: string;
  protocol: string;
  entityId: string;
  acsUrl: string;
  certificateExpiresOn: string;
  certificateDaysLeft: number;
  passwordSignInEnabled: boolean;
  mfaRequired: boolean;
  enforceSso: boolean;
};

export type Recipient = {
  id: string;
  name: string;
  email: string;
  role: string;
  selected: boolean;
  delivery: "delivering" | "failing";
};

export type AlertCategory = {
  id: string;
  title: string;
  description: string;
  criticalLabel: string;
  examples: string;
  additionalUpdates: boolean;
};

export async function getAttentionItems(): Promise<AttentionItem[]> {
  return [
    {
      id: "a1",
      icon: "sso",
      title: "SAML signing certificate expires in 12 days",
      tag: { label: "Time-sensitive", tone: "warn" },
      description: "Sign-in will fail for everyone once it expires. Northwind Okta · expires 18 Aug 2026.",
      actionLabel: "Review SSO",
      href: "/settings/sso",
      emphasis: "brand",
    },
    {
      id: "a2",
      icon: "invite",
      title: "2 invitations expire within 48 hours",
      tag: { label: "Time-sensitive", tone: "info" },
      description: "Neither invitee has accepted. Resending issues a new link.",
      actionLabel: "Open invitations",
      href: "/settings/users?tab=invitations",
      emphasis: "link",
    },
    {
      id: "a3",
      icon: "bell",
      title: "No recipient for Organization administration alerts",
      tag: { label: "Required setup", tone: "neutral" },
      description: "Changes to organization identity and defaults are not being reported to anyone.",
      actionLabel: "Choose recipients",
      href: "/settings/notifications",
      emphasis: "link",
    },
  ];
}

export async function getSettingsCategories(): Promise<SettingsCategory[]> {
  return [
    {
      title: "Organization",
      description: "Organization name, logo, Tenant ID, and tenant-wide time defaults.",
      status: "Display name not set · UTC default",
      statusTone: "dim",
      href: "/settings/organization",
      icon: "building",
    },
    {
      title: "Users and Access",
      description: "People, roles, invitations, and account status.",
      status: "9 active · 1 suspended · 2 pending invites",
      statusTone: "dim",
      href: "/settings/users",
      icon: "users",
    },
    {
      title: "Authentication / SSO",
      description: "Configure authentication methods and single sign-on.",
      status: "SSO connected · SAML",
      statusTone: "ok",
      href: "/settings/sso",
      icon: "shield",
    },
    {
      title: "Notifications",
      description: "Manage security alerts and notification preferences.",
      status: "1 required setup",
      statusTone: "dim",
      href: "/settings/notifications",
      icon: "bell",
    },
  ];
}

export async function getSsoConfig(): Promise<SsoConfig> {
  return {
    connected: true,
    provider: "Okta",
    protocol: "SAML 2.0",
    entityId: "urn:prismsec:northwind",
    acsUrl: "/sso/saml/callback",
    certificateExpiresOn: "18 Aug 2026",
    certificateDaysLeft: 12,
    passwordSignInEnabled: true,
    mfaRequired: false,
    enforceSso: false,
  };
}

export async function getRecipients(): Promise<Recipient[]> {
  return [
    { id: "r1", name: "Amara Osei", email: "amara.osei@northwind.example", role: "Org Owner", selected: true, delivery: "delivering" },
    { id: "r2", name: "Devan Rao", email: "devan.rao@northwind.example", role: "Policy Admin", selected: true, delivery: "delivering" },
    { id: "r3", name: "Hannah Beck", email: "h.beck@northwind.example", role: "Policy Admin", selected: false, delivery: "failing" },
  ];
}

export async function getAlertCategories(): Promise<AlertCategory[]> {
  return [
    {
      id: "c1",
      title: "Authentication and SSO",
      description: "Certificate expiry, SSO activation or failure, sign-in policy changes",
      criticalLabel: "Critical · always on",
      examples: "SSO broken · certificate expiring",
      additionalUpdates: true,
    },
    {
      id: "c2",
      title: "Users and access",
      description: "Role changes, suspensions, invitations, personal-data deletion",
      criticalLabel: "Critical · always on",
      examples: "Org Owner changed · data deleted",
      additionalUpdates: true,
    },
    {
      id: "c3",
      title: "Organization administration",
      description: "Organization identity and tenant-wide default changes",
      criticalLabel: "Critical · always on",
      examples: "Organization identity changed",
      additionalUpdates: false,
    },
  ];
}
