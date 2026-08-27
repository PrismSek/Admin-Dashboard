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
import { UserDialogs } from "@/features/settings/components/user-dialogs";
import { getInvitations, getUsers, roles, type Invitation, type OrgUser } from "@/features/settings/data";

export const metadata: Metadata = { title: "Users and Access" };

const PAGE_SIZE = 25;

const statusTone = { active: "ok", suspended: "neutral", pending: "pending" } as const;
const statusLabel = { active: "Active", suspended: "Suspended", pending: "Pending" } as const;

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
  const [organization, allUsers, invitations] = await Promise.all([
    getOrganization(),
    getUsers(),
    getInvitations(),
  ]);

  const tab = params.tab === "invitations" ? "invitations" : "users";
  const query = params.q?.trim().toLowerCase() ?? "";
  const roleFilter = params.role ?? "all";
  const statusFilter = params.status ?? "all";

  const filteredUsers = allUsers.filter((user) => {
    const matchesQuery =
      !query ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesQuery && matchesRole && matchesStatus;
  });

  const filteredInvitations = invitations.filter((invitation) => {
    const matchesQuery = !query || invitation.email.toLowerCase().includes(query);
    const matchesRole = roleFilter === "all" || invitation.role === roleFilter;
    const matchesStatus = statusFilter === "all" || invitation.status === statusFilter;
    return matchesQuery && matchesRole && matchesStatus;
  });

  const total = tab === "users" ? filteredUsers.length : filteredInvitations.length;
  const page = Math.max(1, Number(params.page) || 1);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visibleUsers = filteredUsers.slice(start, start + PAGE_SIZE);
  const visibleInvitations = filteredInvitations.slice(start, start + PAGE_SIZE);

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
    ...roles.map((role) => ({ value: role, label: role })),
  ];

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
          { label: "Users", href: hrefWith({ tab: undefined, page: undefined }), count: allUsers.length, active: tab === "users" },
          { label: "Invitations", href: hrefWith({ tab: "invitations", page: undefined }), count: invitations.length, active: tab === "invitations" },
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
                    <UserRow key={user.id} user={user} />
                  ))}
                </TBody>
              </TableFrame>
            )}
          </div>

          <ListFooter
            visibleCount={visibleUsers.length}
            total={filteredUsers.length}
            noun="users"
            page={page}
            pageCount={pageCount}
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
            total={filteredInvitations.length}
            noun="invitations"
            page={page}
            pageCount={pageCount}
            hrefFor={(target) => hrefWith({ page: String(target) })}
          />
        </>
      )}

      <UserDialogs
        dialog={params.dialog}
        userId={params.user}
        users={allUsers}
        orgName={organization.name}
        closeHref={hrefWith({})}
      />
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

function UserRow({ user }: { user: OrgUser }) {
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
          href={`/settings/users/${user.id}`}
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
      <TD align="middle" className="w-12 text-right">
        <ChevronRight aria-hidden className="ml-auto inline-flex size-4 text-subtle" />
      </TD>
    </TR>
  );
}
