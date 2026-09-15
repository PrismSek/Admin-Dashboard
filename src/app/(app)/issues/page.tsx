import { Rocket } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { FilterBar } from "@/components/app/filter-bar";
import { ListFooter, ScopeSelect, SquareIconButton, Th, ToolbarSearch } from "@/components/app/list-controls";
import { PageBody, PageHeader } from "@/components/app/page-header";
import { StatTiles } from "@/components/app/stat-tiles";
import { Tabs } from "@/components/app/tabs";
import { AppIcon } from "@/components/icons/AppIcon";
import { buttonVariants } from "@/components/ui/button";
import { IncidentDrawer } from "@/features/issues/components/incident-drawer";
import { SeverityLabel } from "@/features/issues/components/severity";
import {
  getIncident,
  getIncidents,
  getIncidentStats,
  getTotalIncidents,
  type Incident,
  type IncidentStatus,
} from "@/features/issues/data";

export const metadata: Metadata = { title: "Issues" };

const statusLabel: Record<IncidentStatus, string> = {
  new: "New",
  investigating: "Investigating",
  resolved: "Resolved",
};

type IssuesSearchParams = {
  view?: string;
  status?: string;
  severity?: string;
  q?: string;
  case?: string;
};

export default async function IssuesPage({
  searchParams,
}: {
  searchParams: Promise<IssuesSearchParams>;
}) {
  const params = await searchParams;
  const discovery = params.view === "discovery";

  const tabs = (
    <Tabs
      className="mb-6"
      items={[
        { label: "Exfiltration", href: "/issues", active: !discovery },
        { label: "Discovery & classification", href: "/issues?view=discovery", active: discovery },
      ]}
    />
  );

  if (discovery) {
    return (
      <PageBody>
        {tabs}
        <PageHeader title="Discovery & classification" />
        <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-app border border-dashed border-hair-strong bg-chrome px-6 py-20 text-center">
          <p className="text-app-heading font-normal text-strong">Not designed yet</p>
          <p className="max-w-md text-meta text-dim">
            Discovery &amp; classification doesn&apos;t have a Figma frame yet. Exfiltration incidents
            are on the other tab.
          </p>
        </div>
      </PageBody>
    );
  }

  const [all, stats, total] = await Promise.all([
    getIncidents(),
    getIncidentStats(),
    getTotalIncidents(),
  ]);

  const status = params.status ?? "any";
  const severity = params.severity ?? "any";
  const query = params.q?.trim().toLowerCase() ?? "";
  const rows = all.filter(
    (incident) =>
      (status === "any" || incident.status === status) &&
      (severity === "any" || incident.severity === severity) &&
      (!query ||
        `${incident.policy} ${incident.person} ${incident.device} ${incident.rule}`
          .toLowerCase()
          .includes(query)),
  );

  const openIncident = params.case ? await getIncident(params.case) : null;
  const closeHref = hrefWithout(params);
  const openIndex = openIncident ? all.findIndex((incident) => incident.id === openIncident.id) : -1;
  const prevHref = openIndex > 0 ? hrefWithCase(params, all[openIndex - 1].id) : undefined;
  const nextHref =
    openIndex >= 0 && openIndex < all.length - 1 ? hrefWithCase(params, all[openIndex + 1].id) : undefined;

  return (
    <PageBody>
      {tabs}
      <PageHeader title="Exfiltration" />

      <StatTiles
        className="mt-6 grid-cols-2 lg:grid-cols-4"
        stats={stats.map((stat) => ({
          label: stat.label,
          value: (
            <>
              {stat.value}
              {stat.suffix ? <span className="ml-1 text-app text-subtle">{stat.suffix}</span> : null}
            </>
          ),
          detail: stat.detail,
        }))}
      />

      <FilterBar
        action="/issues"
        className="mt-6"
        trailing={<p className="whitespace-nowrap text-meta text-dim">{total} incidents</p>}
      >
        <ScopeSelect
          name="status"
          prefix="Status"
          defaultValue={status}
          options={[
            { value: "any", label: "Any" },
            { value: "new", label: "New" },
            { value: "investigating", label: "Investigating" },
            { value: "resolved", label: "Resolved" },
          ]}
        />
        <ScopeSelect
          name="severity"
          prefix="Severity"
          defaultValue={severity}
          options={[
            { value: "any", label: "Any" },
            { value: "critical", label: "Critical" },
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" },
          ]}
        />
        <SquareIconButton label="Refresh" href="/issues">
          <AppIcon name="refresh" />
        </SquareIconButton>
        <SquareIconButton label="Export">
          <AppIcon name="export" />
        </SquareIconButton>
        <ToolbarSearch
          className="min-w-64 flex-1"
          placeholder="Search by policy, person, device or rule"
          defaultValue={params.q}
        />
      </FilterBar>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-4 overflow-hidden rounded-app border border-hair-strong bg-chrome">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-hair">
                  <Th>Policy</Th>
                  <Th>Severity</Th>
                  <Th>Person &amp; device</Th>
                  <Th>Outcome</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hair">
                {rows.map((incident) => (
                  <IncidentRow key={incident.id} incident={incident} href={hrefWithCase(params, incident.id)} />
                ))}
              </tbody>
            </table>
          </div>

          <ListFooter from={1} to={rows.length} total={total} page={1} pageCount={3} perPage={10} />
        </div>
      )}

      {openIncident ? (
        <IncidentDrawer
          incident={openIncident}
          closeHref={closeHref}
          prevHref={prevHref}
          nextHref={nextHref}
        />
      ) : null}
    </PageBody>
  );
}

function IncidentRow({ incident, href }: { incident: Incident; href: string }) {
  return (
    <tr className="relative align-middle transition-colors hover:bg-hover">
      <td className="px-5 py-4">
        <Link href={href} className="after:absolute after:inset-0 after:content-['']">
          <span className="block text-app text-strong">{incident.policy}</span>
          <span className="mt-0.5 block text-meta text-subtle">Rule {incident.rule}</span>
        </Link>
      </td>
      <td className="px-5 py-4">
        <SeverityLabel severity={incident.severity} />
      </td>
      <td className="px-5 py-4">
        <span className="block text-app text-strong">{incident.person}</span>
        <span className="mt-0.5 block text-meta text-subtle">{incident.device}</span>
      </td>
      <td className="px-5 py-4">
        <span className="block text-app text-strong">{incident.outcome}</span>
        <span className="mt-0.5 block text-meta text-subtle">{incident.outcomeNote}</span>
      </td>
      <td className="px-5 py-4">
        <span className="block text-app text-strong">{statusLabel[incident.status]}</span>
        <span className="mt-0.5 block text-meta text-subtle">{incident.date}</span>
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="mt-4 flex min-h-[28rem] flex-col items-center justify-center gap-4 rounded-app border border-hair-strong bg-chrome px-6 text-center">
      <div className="max-w-md">
        <p className="text-app-heading font-normal text-strong">Nothing is being monitored yet</p>
        <p className="mt-2 text-meta text-dim">
          Issues appear here when a policy is triggered on an enrolled machine. No agent has checked
          in, so nothing is being watched.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/manage/deployment" className={buttonVariants({ variant: "appPrimary", size: "app", width: "auto", className: "gap-2" })}>
          <Rocket aria-hidden className="size-4" />
          Deploy agent
        </Link>
        <Link href="/policies" className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}>
          View policies
        </Link>
      </div>
    </div>
  );
}

/** Preserve the current filters, swap only the open case. */
function hrefWithCase(params: IssuesSearchParams, caseId: string) {
  const query = buildQuery(params, { case: caseId });
  return query ? `/issues?${query}` : "/issues";
}

/** Preserve the current filters, drop the open case (drawer close target). */
function hrefWithout(params: IssuesSearchParams) {
  const query = buildQuery(params, { case: undefined });
  return query ? `/issues?${query}` : "/issues";
}

function buildQuery(params: IssuesSearchParams, overrides: Partial<IssuesSearchParams>) {
  const merged = { ...params, ...overrides };
  const search = new URLSearchParams();
  for (const key of ["view", "status", "severity", "q", "case"] as const) {
    const value = merged[key];
    if (value) search.set(key, value);
  }
  return search.toString();
}
