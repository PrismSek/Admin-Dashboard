import { Filter, MoreVertical, Plus, RotateCw, Upload } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { FilterBar } from "@/components/app/filter-bar";
import {
  AddAction,
  ListFooter,
  ScopeSelect,
  SquareIconButton,
  Th,
  ToolbarSearch,
} from "@/components/app/list-controls";
import { PageBody, PageHeader } from "@/components/app/page-header";
import { StateMarker } from "@/components/app/pill";
import { EmptyState } from "@/components/app/table";
import { PillTabs } from "@/components/app/tabs";
import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { departments } from "@/features/app-shell/nav";
import { ProtectionCell } from "@/components/app/protection";
import { AddUsersDrawer } from "@/features/manage/components/add-users-drawer";
import { BulkUploadDrawer } from "@/features/manage/components/bulk-upload-drawer";
import { MembershipDrawer } from "@/features/manage/components/membership-drawer";
import { UserRowActions } from "@/features/manage/components/user-row-actions";
import {
  getManageEndpoints,
  getManageUsers,
  memberStatusLabel,
  memberStatusTone,
  type ManageEndpoint,
  type ManageUser,
} from "@/features/manage/users";

export const metadata: Metadata = { title: "Users & Groups" };

const PAGE_SIZE = 20;
const departmentLabel = Object.fromEntries(departments.map((d) => [d.slug, d.label]));

type SearchParams = {
  tab?: string;
  department?: string;
  q?: string;
  page?: string;
  panel?: string;
  membership?: string;
};

export default async function UsersAndGroupsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [users, endpoints] = await Promise.all([getManageUsers(), getManageEndpoints()]);

  const tab = params.tab === "endpoints" ? "endpoints" : "users";
  const department = params.department ?? "all";
  const query = params.q?.trim().toLowerCase() ?? "";

  const filteredUsers = users.filter(
    (user) =>
      (department === "all" || user.department === department) &&
      (!query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)),
  );
  const filteredEndpoints = endpoints.filter(
    (endpoint) =>
      (department === "all" || endpoint.groups.includes(departmentLabel[department])) &&
      (!query ||
        endpoint.name.toLowerCase().includes(query) ||
        endpoint.deviceId.toLowerCase().includes(query) ||
        (endpoint.assignedUser ?? "").toLowerCase().includes(query)),
  );

  const total = tab === "users" ? filteredUsers.length : filteredEndpoints.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(params.page) || 1), pageCount);
  const start = (page - 1) * PAGE_SIZE;
  const visibleUsers = filteredUsers.slice(start, start + PAGE_SIZE);
  const visibleEndpoints = filteredEndpoints.slice(start, start + PAGE_SIZE);

  const hrefWith = (overrides: Partial<SearchParams>) => {
    const next = new URLSearchParams();
    const merged = { tab: params.tab, department: params.department, q: params.q, ...overrides };
    if (merged.tab === "users") merged.tab = undefined;
    if (merged.department === "all") merged.department = undefined;
    for (const [key, value] of Object.entries(merged)) if (value) next.set(key, value);
    const qs = next.toString();
    return qs ? `/manage/users?${qs}` : "/manage/users";
  };

  const departmentOptions = [
    { value: "all", label: "All departments" },
    ...departments.map((d) => ({ value: d.slug, label: d.label })),
  ];

  // The drawers (add / bulk-upload / membership) live in the URL; closing one
  // returns to the same filtered view. hrefWith already drops panel/membership.
  const closeHref = hrefWith({});
  const withParam = (key: string, value: string) =>
    `${closeHref}${closeHref.includes("?") ? "&" : "?"}${key}=${value}`;

  return (
    <PageBody>
      <PageHeader title="Users & Groups" />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <PillTabs
          items={[
            { label: "Users", href: hrefWith({ tab: undefined, page: undefined }), count: users.length, active: tab === "users" },
            { label: "Endpoints", href: hrefWith({ tab: "endpoints", page: undefined }), count: endpoints.length, active: tab === "endpoints" },
          ]}
        />

        <FilterBar
          action="/manage/users"
          trailing={
            <div className="flex items-center gap-4">
              <AddAction href={withParam("panel", "bulk-upload")}>
                <Upload className="size-4" />
                Bulk upload
              </AddAction>
              <AddAction href={withParam("panel", "add")}>
                <Plus className="size-4" />
                Add users
              </AddAction>
            </div>
          }
        >
          {tab === "endpoints" ? <input type="hidden" name="tab" value="endpoints" /> : null}
          <ScopeSelect
            name="department"
            prefix="Department"
            defaultValue={department}
            options={departmentOptions}
          />
          <SquareIconButton label="More filters">
            <Filter />
          </SquareIconButton>
          <SquareIconButton label="Refresh" href={hrefWith({ q: undefined, page: undefined })}>
            <RotateCw />
          </SquareIconButton>
          <ToolbarSearch
            placeholder="Search user, email, role"
            defaultValue={params.q}
            className="w-72"
          />
        </FilterBar>
      </div>

      {tab === "users" && filteredUsers.length === 0 ? (
        <div className="mt-6 rounded-app border border-hair-strong bg-chrome">
          <EmptyState
            title="No users yet"
            description="Add people directly, or deploy the agent — an enrolled machine reports the user signed in on it."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={withParam("panel", "add")}
                  className={buttonVariants({ variant: "appPrimary", size: "app", width: "auto" })}
                >
                  Add users
                </Link>
                <Link
                  href={withParam("panel", "bulk-upload")}
                  className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
                >
                  Bulk upload
                </Link>
              </div>
            }
          />
        </div>
      ) : (
      <div className="mt-6 overflow-hidden rounded-app border border-hair-strong bg-chrome">
        <div className="overflow-x-auto">
          {tab === "users" ? (
            <table className="w-full min-w-[840px] border-collapse text-left">
              <thead>
                <tr className="border-b border-hair bg-canvas">
                  <Th className="w-12">
                    <Checkbox aria-label="Select all users" />
                  </Th>
                  <Th>User</Th>
                  <Th>Role</Th>
                  <Th>Department</Th>
                  <Th>Status</Th>
                  <Th className="w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-hair">
                {visibleUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    membershipHref={withParam("membership", user.id)}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[840px] border-collapse text-left">
              <thead>
                <tr className="border-b border-hair bg-canvas">
                  <Th className="w-12">
                    <Checkbox aria-label="Select all endpoints" />
                  </Th>
                  <Th>Endpoint</Th>
                  <Th>Assigned User</Th>
                  <Th>Protection</Th>
                  <Th>Last Seen</Th>
                  <Th className="w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-hair">
                {visibleEndpoints.map((endpoint) => (
                  <EndpointRow key={endpoint.id} endpoint={endpoint} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        <ListFooter
          from={total ? start + 1 : 0}
          to={Math.min(start + PAGE_SIZE, total)}
          total={total}
          page={page}
          pageCount={pageCount}
          hrefFor={(target) => hrefWith({ page: target > 1 ? String(target) : undefined })}
        />
      </div>
      )}

      {params.panel === "add" ? <AddUsersDrawer closeHref={closeHref} /> : null}
      {params.panel === "bulk-upload" ? <BulkUploadDrawer closeHref={closeHref} /> : null}
      {params.membership ? (
        <MembershipDrawer userId={params.membership} closeHref={closeHref} />
      ) : null}
    </PageBody>
  );
}

function RowKebab({ label }: { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-app text-dim transition-colors hover:bg-hover"
    >
      <MoreVertical aria-hidden className="size-4" />
    </button>
  );
}

function UserRow({ user, membershipHref }: { user: ManageUser; membershipHref: string }) {
  return (
    <tr className="align-middle transition-colors hover:bg-hover">
      <td className="px-5 py-4">
        <Checkbox aria-label={`Select ${user.name}`} />
      </td>
      <td className="px-5 py-4">
        <Link href={`/manage/users/${user.id}`} className="text-app text-strong hover:text-brand">
          {user.name}
        </Link>
        <p className="mt-0.5 text-meta text-subtle">{user.email}</p>
      </td>
      <td className="px-5 py-4 text-app text-copy">{user.role}</td>
      <td className="px-5 py-4 text-app text-copy">{departmentLabel[user.department]}</td>
      <td className="px-5 py-4">
        <StateMarker shape="dot" tone={memberStatusTone[user.status]} label={memberStatusLabel[user.status]} />
      </td>
      <td className="px-5 py-4">
        <UserRowActions
          name={user.name}
          detailHref={`/manage/users/${user.id}`}
          membershipHref={membershipHref}
        />
      </td>
    </tr>
  );
}

function EndpointRow({ endpoint }: { endpoint: ManageEndpoint }) {
  return (
    <tr className="align-middle transition-colors hover:bg-hover">
      <td className="px-5 py-4">
        <Checkbox aria-label={`Select ${endpoint.name}`} />
      </td>
      <td className="px-5 py-4">
        <p className="text-app text-strong">{endpoint.name}</p>
        <p className="mt-0.5 text-meta text-subtle">{endpoint.deviceId}</p>
      </td>
      <td className="px-5 py-4 text-app text-copy">
        {endpoint.assignedUser ?? <span className="text-subtle">No assigned user</span>}
      </td>
      <td className="px-5 py-4">
        <ProtectionCell value={endpoint.protection} />
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-app text-copy">{endpoint.lastSeen}</td>
      <td className="px-5 py-4">
        <RowKebab label={`Actions for ${endpoint.name}`} />
      </td>
    </tr>
  );
}
