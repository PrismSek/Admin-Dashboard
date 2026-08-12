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
import { getInvitations, getUsers, roles, type OrgUser } from "@/features/settings/data";

export const metadata: Metadata = { title: "Users and Access" };

const PAGE_SIZE = 25;

const statusTone = { active: "ok", suspended: "neutral", pending: "warn" } as const;
const statusLabel = { active: "Active", suspended: "Suspended", pending: "Pending" } as const;

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

  const filtered = allUsers.filter((user) => {
    const matchesQuery =
      !query ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesQuery && matchesRole && matchesStatus;
  });

  const page = Math.max(1, Number(params.page) || 1);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hrefWith = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { ...params, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value && key !== "dialog" && key !== "user") next.set(key, value);
    }
    const qs = next.toString();
    return qs ? `/settings/users?${qs}` : "/settings/users";
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
            <FilterSelect
              name="role"
              label="All roles"
              defaultValue={roleFilter}
              options={[
                { value: "all", label: "All" },
                ...roles.map((role) => ({ value: role, label: role })),
              ]}
            />
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
            {visible.length === 0 ? (
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
                  {visible.map((user) => (
                    <UserRow key={user.id} user={user} />
                  ))}
                </TBody>
              </TableFrame>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <p className="text-meta text-dim">
              Showing{" "}
              <span className="font-semibold text-brand-accent">
                {visible.length} of {filtered.length}
              </span>{" "}
              users · {PAGE_SIZE} per page
            </p>
            <Pagination
              page={page}
              pageCount={pageCount}
              hrefFor={(target) => hrefWith({ page: String(target) })}
            />
          </div>
        </>
      ) : (
        <div className="mt-6">
          <TableFrame>
            <THead columns={["Invitee", "Role", "Invited by", "Sent", "Expires"]} />
            <TBody>
              {invitations.map((invitation) => (
                <TR key={invitation.id}>
                  <TD>
                    <CellStack primary={invitation.email} emphasis="strong" />
                  </TD>
                  <TD align="middle">{invitation.role}</TD>
                  <TD align="middle">{invitation.invitedBy}</TD>
                  <TD align="middle">{invitation.sentOn}</TD>
                  <TD align="middle">
                    <span className="flex items-center gap-2">
                      {invitation.expiresOn}
                      {invitation.expiringSoon ? <Pill tone="warn">Expiring soon</Pill> : null}
                    </span>
                  </TD>
                </TR>
              ))}
            </TBody>
          </TableFrame>
        </div>
      )}

      <UserDialogs
        dialog={params.dialog}
        userId={params.user}
        users={allUsers}
        closeHref={hrefWith({})}
      />
    </PageBody>
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
