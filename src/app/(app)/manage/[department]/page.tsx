import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Card } from "@/components/app/card";
import { AppInput } from "@/components/app/field";
import { PageBody, PageHeader } from "@/components/app/page-header";
import { OutlineTag, StateMarker } from "@/components/app/pill";
import { StatTiles } from "@/components/app/stat-tiles";
import { CellStack, TBody, TD, THead, TR, TableFrame } from "@/components/app/table";
import { Tabs } from "@/components/app/tabs";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { departments } from "@/features/app-shell/nav";
import { AddMembersDrawer } from "@/features/manage/components/add-members-drawer";
import { getCandidates, getDepartment, getMembershipActivity } from "@/features/manage/data";
import { protectionLabel } from "@/features/endpoints/data";

/** Pre-renders all six department routes at build time. */
export function generateStaticParams() {
  return departments.map((department) => ({ department: department.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ department: string }>;
}): Promise<Metadata> {
  const { department } = await params;
  const found = await getDepartment(department);
  return { title: found?.label ?? "Manage" };
}

const memberStatusTone = { active: "ok", pending: "warn", suspended: "unknown" } as const;
const memberStatusLabel = { active: "Active", pending: "Pending", suspended: "Suspended" } as const;
const protectionTone = { protected: "ok", attention: "warn", unknown: "unknown" } as const;

export default async function DepartmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ department: string }>;
  searchParams: Promise<{ tab?: string; panel?: string }>;
}) {
  const [{ department: slug }, { tab, panel }] = await Promise.all([params, searchParams]);
  const [department, activity] = await Promise.all([
    getDepartment(slug),
    getMembershipActivity(),
  ]);

  if (!department) notFound();

  const activeTab = tab === "endpoints" ? "endpoints" : "users";
  const base = `/manage/${department.slug}`;
  const tabHref = activeTab === "endpoints" ? `${base}?tab=endpoints` : base;
  const panelKind = panel === "add-endpoints" ? "endpoints" : panel === "add-users" ? "users" : null;
  const candidates = panelKind ? await getCandidates(panelKind) : [];

  return (
    <PageBody>
      <PageHeader
        title={department.label}
        description={department.description}
        action={
          <OutlineTag>{`Directory-derived · ${department.directoryOu}`}</OutlineTag>
        }
      />

      <StatTiles
        className="mt-8"
        stats={[
          {
            label: "Users",
            value: department.userCount,
            detail: `${department.manuallyAdded} manually added`,
          },
          {
            label: "Endpoints",
            value: department.endpointCount,
            detail: `${department.directEndpoints} direct, ${department.inheritedEndpoints} inherited`,
          },
          {
            label: "Policy scope",
            value: department.policyScope,
            detail: department.policyConfig,
          },
          {
            label: "Last reviewed",
            value: department.lastReviewed,
            detail: department.reviewCadence,
          },
        ]}
      />

      <Tabs
        className="mt-8"
        separator="dot"
        items={[
          { label: "Users", href: base, count: department.userCount, active: activeTab === "users" },
          {
            label: "Endpoints",
            href: `${base}?tab=endpoints`,
            count: department.endpointCount,
            active: activeTab === "endpoints",
          },
        ]}
      />

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        <AppInput
          placeholder={activeTab === "users" ? "Filter members" : "Filter endpoints"}
          className="max-w-xs"
          aria-label={activeTab === "users" ? "Filter members" : "Filter endpoints"}
        />
        <Link
          href={`${tabHref}${tabHref.includes("?") ? "&" : "?"}panel=add-${activeTab}`}
          className={buttonVariants({ variant: "appPrimary", size: "app", width: "auto" })}
        >
          {activeTab === "users" ? "Add users" : "Add endpoints"}
        </Link>
      </div>

      <div className="mt-4">
        {activeTab === "users" ? (
          <TableFrame>
            <THead columns={["User", "Role", "Status", "Membership source", "Action"]} />
            <TBody>
              {department.members.map((member) => (
                <TR key={member.id}>
                  <TD>
                    <CellStack
                      primary={member.name}
                      secondary={member.email}
                      emphasis="strong"
                    />
                  </TD>
                  <TD align="middle" className="text-copy">
                    {member.role}
                  </TD>
                  <TD align="middle">
                    <StateMarker
                      tone={memberStatusTone[member.status]}
                      label={memberStatusLabel[member.status]}
                    />
                  </TD>
                  <TD align="middle">
                    <OutlineTag>
                      {member.source === "direct" ? "Direct" : "Directory-derived"}
                    </OutlineTag>
                  </TD>
                  <TD align="middle">
                    <Button variant="appSecondary" size="appSm" width="auto" type="button">
                      {member.source === "direct" ? "Remove" : "Direct"}
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </TableFrame>
        ) : (
          <TableFrame>
            <THead
              columns={["Endpoint", "Assigned user", "Protection", "Membership source", "Action"]}
            />
            <TBody>
              {department.endpoints.map((endpoint) => (
                <TR key={endpoint.id}>
                  <TD>
                    <CellStack
                      primary={endpoint.name}
                      secondary={endpoint.deviceId}
                      emphasis="strong"
                    />
                  </TD>
                  <TD align="middle" className="text-copy">
                    {endpoint.assignedUser ?? "—"}
                  </TD>
                  <TD align="middle">
                    <StateMarker
                      tone={protectionTone[endpoint.protection]}
                      label={protectionLabel[endpoint.protection]}
                    />
                  </TD>
                  <TD align="middle">
                    <OutlineTag>
                      {endpoint.source === "direct" ? "Direct" : "Inherited"}
                    </OutlineTag>
                  </TD>
                  <TD align="middle">
                    <Button variant="appSecondary" size="appSm" width="auto" type="button">
                      {endpoint.source === "direct" ? "Remove" : "Direct"}
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </TableFrame>
        )}
      </div>

      <p className="mt-6 max-w-4xl text-meta text-dim">
        Endpoints reach a group two ways: directly, or inherited from the user assigned to them.
        Inherited membership follows the user — remove the user and the endpoint leaves with
        them. A direct assignment is an override and is labelled as one.
      </p>

      <h2 className="mt-8 text-meta font-medium text-subtle">Recent membership activity</h2>
      <Card className="mt-3 divide-y divide-hair">
        {activity.map((entry) => (
          <div key={entry.title} className="px-5 py-4">
            <p className="text-app text-strong">{entry.title}</p>
            <p className="mt-1 text-meta text-subtle">{entry.detail}</p>
          </div>
        ))}
      </Card>

      {panelKind ? (
        <AddMembersDrawer
          departmentLabel={department.label}
          kind={panelKind}
          candidates={candidates}
          closeHref={tabHref}
        />
      ) : null}
    </PageBody>
  );
}
