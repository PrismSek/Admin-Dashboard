import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { FilterBar, FilterSearch, FilterSelect } from "@/components/app/filter-bar";
import { PageBody, PageHeader } from "@/components/app/page-header";
import { Pagination } from "@/components/app/pagination";
import { Pill } from "@/components/app/pill";
import { CellStack, EmptyState, TBody, TD, THead, TR, TableFrame } from "@/components/app/table";
import { Tabs } from "@/components/app/tabs";
import { buttonVariants } from "@/components/ui/button";
import { getOrganization } from "@/features/app-shell/data";
import { getOrgUser, listInvitations, listOrgUsers } from "@/features/settings/api";
import { InvitationActions } from "@/features/settings/components/invitation-actions";
import { UserDialogs } from "@/features/settings/components/user-dialogs";
import { UserDrawer } from "@/features/settings/components/user-drawer";
import { type Invitation, type OrgUser } from "@/features/settings/data";
import { roleLabels, roleValues } from "@/features/settings/roles";
import { apiInviteStatusSchema, apiUserRoleSchema, apiUserStatusSchema } from "@/features/settings/schemas";

export const metadata: Metadata = { title: "Users and Access" };

const PAGE_SIZE = 25;

const statusTone = { active: "ok", suspended: "neutral", pending: "pending", deactivated: "neutral" } as const;
const statusLabel = {
  active: "Active",
  suspended: "Suspended",
  pending: "Pending",
  deactivated: "Deactivated",
} as const;

const invitationStatusTone = {
  pending: "pending",
  accepted: "ok",
  revoked: "info",
  expired: "neutral",
} as const;
const invitationStatusLabel = {
  pending: "Pending",
  accepted: "Accepted",
  revoked: "Revoked",
  expired: "Expired",
} as const;

type SearchParams = {
  tab?: string;
  q?: string;
  role?: string;
  status?: string;
  page?: string;
  dialog?: string;
  user?: string;
};

/**
 * Server Component. Filtering, tab selection and pagination all come from the
 * URL and are applied on the server, so the rendered HTML already reflects the
 * query and the view is shareable.
 */
export default async function UsersAndAccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const tab = params.tab === "invitations" ? "invitations" : "users";
  const query = params.q?.trim() ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  // URL filters are parsed with the gateway's own enums (§6): an unknown value
  // means "no filter" rather than a query the gateway would reject. The raw
  // strings are kept only to seed the <select>'s current selection.
  const roleFilter = params.role ?? "all";
  const statusFilter = params.status ?? "all";
  const roleResult = apiUserRoleSchema.safeParse(params.role);
  const role = roleResult.success ? roleResult.data : undefined;
  const statusResult = apiUserStatusSchema.safeParse(params.status);
  const status = statusResult.success ? statusResult.data : undefined;
  const hasUserFilter = query !== "" || role !== undefined || status !== undefined;

  // Users and invitations share the `status` param but have distinct status
  // enums, so each tab parses it with its own schema.
  const inviteStatusResult = apiInviteStatusSchema.safeParse(params.status);
  const inviteStatus = inviteStatusResult.success ? inviteStatusResult.data : undefined;
  const hasInviteFilter = query !== "" || role !== undefined || inviteStatus !== undefined;

  const organization = await getOrganization();

  // The user drawer is opened by `?user=<id>` over the list; fetch that user
  // server-side so the panel is server-rendered and the link is shareable.
  const drawerUser = params.user ? await getOrgUser(params.user) : null;

  // Users tab: the gateway filters, sorts and pages. Fetch the visible page, and
  // (only when a filter narrows it) a second unfiltered count for the tab badge,
  // which always reflects the whole tenant.
  const usersResult =
    tab === "users" ? await listOrgUsers({ q: query || undefined, role, status, page }) : null;
  const orgUsersTotal =
    usersResult && !hasUserFilter ? usersResult.total : (await listOrgUsers({})).total;

  const usersPage = usersResult?.page ?? page;
  const usersTotal = usersResult?.total ?? 0;
  const usersPageCount = usersResult
    ? Math.max(1, Math.ceil(usersResult.total / usersResult.pageSize))
    : 1;
  const visibleUsers = usersResult?.users ?? [];

  // Invitations tab: the gateway filters, sorts and pages, mirroring the users tab.
  const invitesResult =
    tab === "invitations"
      ? await listInvitations({ q: query || undefined, role, status: inviteStatus, page })
      : null;
  const orgInvitesTotal =
    invitesResult && !hasInviteFilter ? invitesResult.total : (await listInvitations({})).total;

  const invitesPage = invitesResult?.page ?? page;
  const invitesTotal = invitesResult?.total ?? 0;
  const invitesPageCount = invitesResult
    ? Math.max(1, Math.ceil(invitesResult.total / invitesResult.pageSize))
    : 1;
  const visibleInvitations = invitesResult?.invitations ?? [];

  const hrefWith = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { ...params, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value && key !== "dialog" && key !== "user") next.set(key, value);
    }
    const qs = next.toString();
    return qs ? `/settings/users?${qs}` : "/settings/users";
  };

  const roleOptions = [
    { value: "all", label: "All" },
    ...roleValues.map((value) => ({ value, label: roleLabels[value] })),
  ];

  // The list URL with this user's drawer open, keeping the current filters.
  const hrefForUser = (id: string) => {
    const base = hrefWith({});
    return `${base}${base.includes("?") ? "&" : "?"}user=${id}`;
  };

  return (
    <PageBody>
      <PageHeader
        title="Users and Access"
        description={`People in ${organization.name}, their roles, and outstanding invitations.`}
        action={
          <Link
            href={hrefWith({}) + (hrefWith({}).includes("?") ? "&" : "?") + "dialog=invite"}
            className={buttonVariants({ variant: "appPrimary", size: "app", width: "auto" })}
          >
            Invite user
          </Link>
        }
      />

      <Tabs
        className="mt-8"
        items={[
          { label: "Users", href: hrefWith({ tab: undefined, page: undefined }), count: orgUsersTotal, active: tab === "users" },
          { label: "Invitations", href: hrefWith({ tab: "invitations", page: undefined }), count: orgInvitesTotal, active: tab === "invitations" },
        ]}
      />

      {tab === "users" ? (
        <>
          <FilterBar action="/settings/users" className="mt-6">
            <input type="hidden" name="tab" value="users" />
            <FilterSearch
              defaultValue={params.q}
              placeholder="Search name or email"
              className="max-w-md"
            />
            <FilterSelect name="role" label="All roles" defaultValue={roleFilter} options={roleOptions} />
            <FilterSelect
              name="status"
              label="All statuses"
              defaultValue={statusFilter}
              options={[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "suspended", label: "Suspended" },
                { value: "deactivated", label: "Deactivated" },
              ]}
            />
          </FilterBar>

          <div className="mt-6">
            {visibleUsers.length === 0 ? (
              <TableFrame>
                <THead case="caps" columns={["Name / email", "Role", "Status", ""]} />
                <TBody>
                  <tr>
                    <td colSpan={4}>
                      <EmptyState
                        title="No users match these filters"
                        description="Clear the search or filters to see everyone in this organization."
                      />
                    </td>
                  </tr>
                </TBody>
              </TableFrame>
            ) : (
              <TableFrame>
                <THead case="caps" columns={["Name / email ↑", "Role", "Status", ""]} />
                <TBody>
                  {visibleUsers.map((user) => (
                    <UserRow key={user.id} user={user} href={hrefForUser(user.id)} />
                  ))}
                </TBody>
              </TableFrame>
            )}
          </div>

          <ListFooter
            visibleCount={visibleUsers.length}
            total={usersTotal}
            noun="users"
            page={usersPage}
            pageCount={usersPageCount}
            hrefFor={(target) => hrefWith({ page: String(target) })}
          />
        </>
      ) : (
        <>
          <FilterBar action="/settings/users" className="mt-6">
            <input type="hidden" name="tab" value="invitations" />
            <FilterSearch defaultValue={params.q} placeholder="Search email" className="max-w-md" />
            <FilterSelect name="role" label="All roles" defaultValue={roleFilter} options={roleOptions} />
            <FilterSelect
              name="status"
              label="All statuses"
              defaultValue={statusFilter}
              options={[
                { value: "all", label: "All" },
                { value: "pending", label: "Pending" },
                { value: "accepted", label: "Accepted" },
                { value: "revoked", label: "Revoked" },
                { value: "expired", label: "Expired" },
              ]}
            />
          </FilterBar>

          <div className="mt-6">
            {visibleInvitations.length === 0 ? (
              <TableFrame>
                <THead case="caps" columns={["Email", "Role", "Status", "Sent", ""]} />
                <TBody>
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        title="No invitations match these filters"
                        description="Clear the search or filters to see every outstanding invitation."
                      />
                    </td>
                  </tr>
                </TBody>
              </TableFrame>
            ) : (
              <TableFrame>
                <THead case="caps" columns={["Email", "Role", "Status", "Sent", ""]} />
                <TBody>
                  {visibleInvitations.map((invitation) => (
                    <InvitationRow key={invitation.id} invitation={invitation} />
                  ))}
                </TBody>
              </TableFrame>
            )}
          </div>

          <ListFooter
            visibleCount={visibleInvitations.length}
            total={invitesTotal}
            noun="invitations"
            page={invitesPage}
            pageCount={invitesPageCount}
            hrefFor={(target) => hrefWith({ page: String(target) })}
          />
        </>
      )}

      <UserDialogs dialog={params.dialog} orgName={organization.name} closeHref={hrefWith({})} />

      {drawerUser ? <UserDrawer user={drawerUser} closeHref={hrefWith({})} /> : null}
    </PageBody>
  );
}

function ListFooter({
  visibleCount,
  total,
  noun,
  page,
  pageCount,
  hrefFor,
}: {
  visibleCount: number;
  total: number;
  noun: string;
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
      <p className="text-meta text-dim">
        Showing{" "}
        <span className="font-semibold text-brand-accent">
          {visibleCount} of {total}
        </span>{" "}
        {noun} · {PAGE_SIZE} per page
      </p>
      <Pagination page={page} pageCount={pageCount} hrefFor={hrefFor} />
    </div>
  );
}

function UserRow({ user, href }: { user: OrgUser; href: string }) {
  return (
    <TR>
      <TD>
        <CellStack primary={user.name} secondary={user.email} />
      </TD>
      <TD align="middle">{user.role}</TD>
      <TD align="middle">
        <Pill tone={statusTone[user.status]}>{statusLabel[user.status]}</Pill>
      </TD>
      <TD align="middle" className="w-12 text-right">
        <Link
          href={href}
          aria-label={`View ${user.name}`}
          className="inline-flex text-subtle hover:text-copy"
        >
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      </TD>
    </TR>
  );
}

function InvitationRow({ invitation }: { invitation: Invitation }) {
  return (
    <TR>
      <TD>
        <CellStack primary={invitation.email} emphasis="strong" />
      </TD>
      <TD align="middle">{invitation.role}</TD>
      <TD align="middle">
        <Pill tone={invitationStatusTone[invitation.status]}>
          {invitationStatusLabel[invitation.status]}
        </Pill>
      </TD>
      <TD align="middle">{invitation.sentOn}</TD>
      <TD align="middle" className="w-40 text-right">
        <InvitationActions id={invitation.id} status={invitation.status} />
      </TD>
    </TR>
  );
}
