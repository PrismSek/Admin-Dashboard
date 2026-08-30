import { Filter, RotateCw, Shield, ShieldAlert, ShieldCheck, WifiOff } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { FilterBar } from "@/components/app/filter-bar";
import { ListFooter, ScopeSelect, SquareIconButton, Th, ToolbarSearch } from "@/components/app/list-controls";
import { PageBody, PageHeader } from "@/components/app/page-header";
import { ProtectionCell } from "@/components/app/protection";
import { BrowserMarks, OsGlyph } from "@/features/endpoints/components/glyphs";
import { getEndpointCounts, getEndpoints, type Endpoint } from "@/features/endpoints/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "All Endpoints" };

const PAGE_SIZE = 20;

const scopes = [
  { value: "all", label: "All managed endpoints", match: () => true },
  { value: "protected", label: "Protected", match: (e: Endpoint) => e.protection === "protected" },
  { value: "attention", label: "Needs attention", match: (e: Endpoint) => e.protection === "attention" },
  { value: "unknown", label: "Unprotected / Unknown", match: (e: Endpoint) => e.protection === "unknown" },
  { value: "offline", label: "Offline", match: (e: Endpoint) => !e.online },
] as const;

export default async function EndpointsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const [all, counts] = await Promise.all([getEndpoints(), getEndpointCounts()]);

  const scope = scopes.find((s) => s.value === params.scope) ?? scopes[0];
  const query = params.q?.trim().toLowerCase() ?? "";
  const rows = all.filter(
    (endpoint) =>
      scope.match(endpoint) &&
      (!query ||
        endpoint.name.toLowerCase().includes(query) ||
        endpoint.deviceId.toLowerCase().includes(query) ||
        (endpoint.assignedUser ?? "").toLowerCase().includes(query)),
  );

  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(params.page) || 1), pageCount);
  const start = (page - 1) * PAGE_SIZE;
  const visible = rows.slice(start, start + PAGE_SIZE);

  const hrefWith = (overrides: { scope?: string; q?: string; page?: string }) => {
    const next = new URLSearchParams();
    const merged = { scope: params.scope, q: params.q, ...overrides };
    if (merged.scope === "all") merged.scope = undefined;
    for (const [key, value] of Object.entries(merged)) if (value) next.set(key, value);
    const qs = next.toString();
    return qs ? `/endpoints?${qs}` : "/endpoints";
  };

  return (
    <PageBody>
      <PageHeader title="All Endpoints" />

      <FilterBar
        action="/endpoints"
        className="mt-6"
        trailing={
          <div className="flex items-center gap-3">
            <SquareIconButton label="Refresh" href={hrefWith({ q: undefined, page: undefined })}>
              <RotateCw />
            </SquareIconButton>
            <ToolbarSearch placeholder="Search endpoints, Id.." defaultValue={params.q} className="w-72" />
          </div>
        }
      >
        <ScopeSelect
          name="scope"
          prefix="Scope"
          defaultValue={scope.value}
          options={scopes.map((s) => ({ value: s.value, label: s.label }))}
        />
        <SquareIconButton label="More filters">
          <Filter />
        </SquareIconButton>
      </FilterBar>

      <div className="mt-6 grid grid-cols-2 divide-x divide-hair-strong overflow-hidden rounded-app border border-hair-strong bg-chrome sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Total endpoints" value={counts.total} />
        <StatTile label="Protected" value={counts.protected} icon={<ShieldCheck className="size-4 text-allow" />} />
        <StatTile label="Attention" value={counts.attention} icon={<ShieldAlert className="size-4 text-block" />} />
        <StatTile label="Unprotected / Unknown" value={counts.unknown} icon={<Shield className="size-4 text-monitor" />} />
        <StatTile label="Offline" value={counts.offline} icon={<WifiOff className="size-4 text-subtle-alt" />} />
      </div>

      <div className="mt-6 overflow-hidden rounded-app border border-hair-strong bg-chrome">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left">
            <thead>
              <tr className="border-b border-hair">
                <Th>Endpoint</Th>
                <Th>Assigned user</Th>
                <Th>Operating system</Th>
                <Th>Browser coverage</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hair">
              {visible.map((endpoint) => (
                <EndpointRow key={endpoint.id} endpoint={endpoint} />
              ))}
            </tbody>
          </table>
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
    </PageBody>
  );
}

function StatTile({ label, value, icon }: { label: string; value: number; icon?: ReactNode }) {
  return (
    <div className="px-5 py-4">
      <p className="flex items-center gap-1.5 text-meta text-dim">
        {icon}
        {label}
      </p>
      <p className="mt-1.5 text-page-title font-normal text-strong">{value}</p>
    </div>
  );
}

function EndpointRow({ endpoint }: { endpoint: Endpoint }) {
  return (
    <tr className="align-middle transition-colors hover:bg-hover">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <ProtectionCell value={endpoint.protection} labelled={false} />
          <div className="min-w-0">
            <Link href={`/endpoints/${endpoint.id}`} className="text-app text-strong hover:text-brand">
              {endpoint.name}
            </Link>
            <p className="mt-0.5 text-meta text-subtle">
              {endpoint.deviceId} · {endpoint.lastSeen}
            </p>
          </div>
        </div>
      </td>
      <td className={cn("px-5 py-4 text-app", endpoint.assignedUser ? "text-copy" : "text-subtle")}>
        {endpoint.assignedUser ?? "No assigned user"}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2.5">
          <OsGlyph family={endpoint.os.family} />
          <div className="min-w-0">
            <p className="text-app text-strong">{endpoint.os.name}</p>
            <p className="mt-0.5 text-meta text-subtle">Agent {endpoint.os.agentVersion}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <BrowserMarks active={endpoint.protection !== "unknown"} extra={endpoint.extraBrowsers} />
      </td>
    </tr>
  );
}
