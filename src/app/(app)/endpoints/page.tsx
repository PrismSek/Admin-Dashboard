import type { Metadata } from "next";
import Link from "next/link";

import { FilterBar, FilterSearch, FilterSelect } from "@/components/app/filter-bar";
import { PageBody, PageHeader } from "@/components/app/page-header";
import { Pagination } from "@/components/app/pagination";
import { StateMarker } from "@/components/app/pill";
import { StatTiles } from "@/components/app/stat-tiles";
import { CellStack, EmptyState, TBody, TD, THead, TR, TableFrame } from "@/components/app/table";
import { Button } from "@/components/ui/button";
import { getOrganization } from "@/features/app-shell/data";
import {
  deploymentLabel,
  getEndpointCounts,
  getEndpoints,
  protectionLabel,
  type Endpoint,
} from "@/features/endpoints/data";

export const metadata: Metadata = { title: "Endpoints" };

const PAGE_SIZE = 25;

const protectionTone = {
  protected: "ok",
  attention: "warn",
  unknown: "unknown",
} as const;

type SearchParams = { q?: string; protection?: string; seen?: string; page?: string };

export default async function EndpointsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [organization, endpoints, counts] = await Promise.all([
    getOrganization(),
    getEndpoints(),
    getEndpointCounts(),
  ]);

  const query = params.q?.trim().toLowerCase() ?? "";
  const protection = params.protection ?? "all";

  const filtered = endpoints.filter((endpoint) => {
    const matchesQuery =
      !query ||
      endpoint.name.toLowerCase().includes(query) ||
      endpoint.deviceId.toLowerCase().includes(query) ||
      (endpoint.assignedUser?.toLowerCase().includes(query) ?? false);
    const matchesProtection = protection === "all" || endpoint.protection === protection;
    return matchesQuery && matchesProtection;
  });

  const page = Math.max(1, Number(params.page) || 1);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hrefFor = (target: number) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...params, page: String(target) })) {
      if (value) next.set(key, value);
    }
    return `/endpoints?${next.toString()}`;
  };

  return (
    <PageBody>
      <PageHeader
        title="Endpoints"
        description={`Monitor device protection, deployment health, and presence across ${organization.name}.`}
        /* The fleet list is read-only in V1 — endpoints join a group from the
           Manage section, not from here. */
        action={<span className="text-meta text-dim">Read-only fleet workspace</span>}
      />

      <StatTiles
        className="mt-8"
        stats={[
          { label: "Protected", value: counts.protected },
          { label: "Attention", value: counts.attention },
          { label: "Unknown", value: counts.unknown },
          { label: "Total endpoints", value: counts.total },
        ]}
        note="Fleet-wide counts · evidence as of 14:32 UTC · same tenant and permission scope as the list"
      />

      <FilterBar action="/endpoints" className="mt-6">
        <FilterSearch
          defaultValue={params.q}
          placeholder="Search endpoint name, device identifier, or assigned user"
        />
        <FilterSelect
          name="protection"
          label="Protection"
          defaultValue={protection}
          options={[
            { value: "all", label: "All" },
            { value: "protected", label: "Protected" },
            { value: "attention", label: "Attention" },
            { value: "unknown", label: "Unknown" },
          ]}
        />
        <FilterSelect
          name="seen"
          label="Last seen"
          defaultValue={params.seen ?? "any"}
          options={[
            { value: "any", label: "Any" },
            { value: "24h", label: "Last 24 hours" },
            { value: "7d", label: "Last 7 days" },
            { value: "30d", label: "Last 30 days" },
          ]}
        />
        <Button variant="appSecondary" size="app" width="auto" type="button">
          More filters
        </Button>
      </FilterBar>

      <p className="mt-4 text-right text-meta text-dim">
        Showing 1–{visible.length} of {filtered.length} matching endpoints
      </p>

      <div className="mt-2">
        <TableFrame>
          <THead
            columns={[
              "Endpoint",
              "Assigned user",
              "Protection",
              "Supporting evidence",
              "Deployment",
              "Last seen",
              "Presence check",
            ]}
          />
          <TBody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    title="No endpoints match these filters"
                    description="Adjust the search or protection filter. This is not an error — the fleet may simply have nothing in this state."
                  />
                </td>
              </tr>
            ) : (
              visible.map((endpoint) => <EndpointRow key={endpoint.id} endpoint={endpoint} />)
            )}
          </TBody>
        </TableFrame>
      </div>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-6">
        <p className="max-w-2xl text-meta text-dim">
          Unknown means authoritative protection evidence could not be established — it is never
          rendered as Protected or Healthy. Every endpoint in this tenant is within the current
          role&rsquo;s scope.
        </p>
        <Pagination page={page} pageCount={pageCount} hrefFor={hrefFor} labels="words" />
      </div>
    </PageBody>
  );
}

function EndpointRow({ endpoint }: { endpoint: Endpoint }) {
  return (
    <TR>
      <TD>
        <Link href={`/endpoints/${endpoint.id}`} className="hover:underline">
          <CellStack
            primary={<span className="whitespace-nowrap">{endpoint.name}</span>}
            secondary={endpoint.deviceId}
            emphasis="strong"
          />
        </Link>
      </TD>
      <TD align="middle" className="text-copy">
        {endpoint.assignedUser ?? "—"}
      </TD>
      <TD align="middle">
        <StateMarker
          tone={protectionTone[endpoint.protection]}
          label={protectionLabel[endpoint.protection]}
          shape="dot"
        />
      </TD>
      <TD>
        <CellStack primary={endpoint.evidence} secondary={endpoint.evidenceDetail} />
      </TD>
      <TD>
        <CellStack
          primary={deploymentLabel[endpoint.deployment]}
          secondary={endpoint.agentVersion}
        />
      </TD>
      <TD align="middle" className="whitespace-nowrap text-copy">
        {endpoint.lastSeen}
      </TD>
      <TD>
        <Button variant="appSecondary" size="appSm" width="auto" type="button">
          Ping
        </Button>
        <p className="mt-1.5 max-w-[7rem] text-meta text-subtle">Not checked this session</p>
      </TD>
    </TR>
  );
}
