import "server-only";

import { type Invitation, type OrgUser } from "@/features/settings/data";
import { roleLabels } from "@/features/settings/roles";
import {
  type ApiInvite,
  type ApiUser,
  type ApiUserRole,
  type ApiUserStatus,
  apiUserSchema,
  listInvitesResponseSchema,
  listUsersResponseSchema,
} from "@/features/settings/schemas";
import { apiErrorStatus, apiFetch } from "@/lib/api-client";

/**
 * Server-only reads for the admin-users surface. Filtering, sorting and paging
 * all happen at the gateway (`GET /v1/users`), so the UI passes the current URL
 * state straight through and trusts the returned `total` for pagination.
 */

export type UserListParams = {
  q?: string;
  role?: string;
  status?: string;
  sort?: string;
  dir?: string;
  page?: number;
};

export type OrgUserPage = {
  users: OrgUser[];
  /** Matches before paging — the count for "X of Y", not this page's length. */
  total: number;
  page: number;
  pageSize: number;
};

/** One page of the tenant's users, filtered and sorted by the gateway. */
export async function listOrgUsers(params: UserListParams = {}): Promise<OrgUserPage> {
  const body = await apiFetch("/v1/users", {
    searchParams: {
      q: params.q,
      role: params.role,
      status: params.status,
      sort: params.sort,
      dir: params.dir,
      page: params.page !== undefined ? String(params.page) : undefined,
    },
  });
  const { users, total, page, pageSize } = listUsersResponseSchema.parse(body);
  return { users: users.map(toOrgUser), total, page, pageSize };
}

/** Project the gateway user onto the UI shape, resolving the role to its label. */
function toOrgUser(user: ApiUser): OrgUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: roleLabels[user.role],
    status: user.status,
  };
}

/** The single-user detail behind the drawer: wire values for controls plus display strings. */
export type OrgUserDetail = {
  id: string;
  name: string;
  email: string;
  role: ApiUserRole;
  roleLabel: string;
  status: ApiUserStatus;
  addedOn: string;
  lastSignIn: string;
};

/** Read one user (`GET /v1/users/{id}`). `null` means no such user in this tenant (404). */
export async function getOrgUser(id: string): Promise<OrgUserDetail | null> {
  let body: unknown;
  try {
    body = await apiFetch(`/v1/users/${id}`);
  } catch (error) {
    if (apiErrorStatus(error) === 404) return null;
    throw error;
  }
  const user = apiUserSchema.parse(body);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    roleLabel: roleLabels[user.role],
    status: user.status,
    addedOn: user.createdAt ? formatDate(user.createdAt) : "—",
    lastSignIn: user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never",
  };
}

export type InvitationListParams = {
  q?: string;
  role?: string;
  status?: string;
  sort?: string;
  dir?: string;
  page?: number;
};

export type InvitationPage = {
  invitations: Invitation[];
  total: number;
  page: number;
  pageSize: number;
};

/** One page of the tenant's invitations, filtered and sorted by the gateway. */
export async function listInvitations(params: InvitationListParams = {}): Promise<InvitationPage> {
  const body = await apiFetch("/v1/invites", {
    searchParams: {
      q: params.q,
      role: params.role,
      status: params.status,
      sort: params.sort,
      dir: params.dir,
      page: params.page !== undefined ? String(params.page) : undefined,
    },
  });
  const { invites, total, page, pageSize } = listInvitesResponseSchema.parse(body);
  return { invitations: invites.map(toInvitation), total, page, pageSize };
}

function toInvitation(invite: ApiInvite): Invitation {
  return {
    id: invite.id,
    email: invite.email,
    role: roleLabels[invite.role],
    status: invite.status,
    sentOn: formatDate(invite.createdAt),
  };
}

/**
 * Render an ISO timestamp as "2 Aug 2026". Formatted in UTC so the string is
 * deterministic on the server and does not shift under the viewer's locale or
 * a server/client timezone mismatch.
 */
function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** As `formatDate` but with a 24-hour time, e.g. "9 Aug 2026, 08:12". */
function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(iso));
}
