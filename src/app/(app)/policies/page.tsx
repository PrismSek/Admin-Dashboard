import { Download, Plus, RotateCw, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { FilterBar } from "@/components/app/filter-bar";
import { ListFooter, SquareIconButton, Th, ToolbarSearch } from "@/components/app/list-controls";
import { PageBody, PageHeader } from "@/components/app/page-header";
import { Tabs } from "@/components/app/tabs";
import { buttonVariants } from "@/components/ui/button";
import { HealthCell, LifecyclePill } from "@/features/policies/components/policy-cells";
import { getPolicies, getPolicyCounts, type Policy } from "@/features/policies/data";

export const metadata: Metadata = { title: "Policies" };

const PAGE_SIZE = 10;

export default async function PoliciesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const [all, counts] = await Promise.all([getPolicies(), getPolicyCounts()]);

  const tab = params.tab === "draft" ? "draft" : params.tab === "off" ? "off" : "all";
  const query = params.q?.trim().toLowerCase() ?? "";

  const filtered = all.filter(
    (policy) =>
      (tab === "all" || policy.lifecycle === tab) &&
      (!query || policy.name.toLowerCase().includes(query)),
  );

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(params.page) || 1), pageCount);
  const start = (page - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  const hrefWith = (overrides: { tab?: string; q?: string; page?: string }) => {
    const next = new URLSearchParams();
    const merged = { tab: params.tab, q: params.q, ...overrides };
    if (merged.tab === "all") merged.tab = undefined;
    for (const [key, value] of Object.entries(merged)) if (value) next.set(key, value);
    const qs = next.toString();
    return qs ? `/policies?${qs}` : "/policies";
  };

  return (
    <PageBody>
      <PageHeader title="Policies" />

      <Tabs
        className="mt-5"
        mutedCount
        items={[
          { label: "All", href: hrefWith({ tab: undefined, page: undefined }), count: counts.all, active: tab === "all" },
          { label: "Draft", href: hrefWith({ tab: "draft", page: undefined }), count: counts.draft, active: tab === "draft" },
          { label: "Off", href: hrefWith({ tab: "off", page: undefined }), count: counts.off, active: tab === "off" },
        ]}
      />

      <FilterBar
        action="/policies"
        className="mt-5"
        trailing={
          <Link
            href="/policies/new"
            className={buttonVariants({ variant: "appPrimary", size: "app", width: "auto" })}
          >
            <Plus className="size-4" />
            New policy
          </Link>
        }
      >
        {tab !== "all" ? <input type="hidden" name="tab" value={tab} /> : null}
        <SquareIconButton label="Refresh" href={hrefWith({ q: undefined, page: undefined })}>
          <RotateCw />
        </SquareIconButton>
        <SquareIconButton label="Delete selected">
          <Trash2 />
        </SquareIconButton>
        <SquareIconButton label="Export">
          <Download />
        </SquareIconButton>
        <ToolbarSearch
          placeholder="Search policies"
          defaultValue={params.q}
          className="w-full max-w-xl"
        />
      </FilterBar>

      <p className="mt-3 text-right text-meta text-dim">
        Showing {total} of {counts.all} policies
      </p>

      <div className="mt-3 overflow-hidden rounded-app border border-hair-strong bg-chrome">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-hair">
                <Th>Policy name</Th>
                <Th>Lifecycle</Th>
                <Th>Enforcement mode</Th>
                <Th>Deployment health</Th>
                <Th>Owner</Th>
                <Th>Last change</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hair">
              {visible.map((policy) => (
                <PolicyRow key={policy.id} policy={policy} />
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
          perPage={PAGE_SIZE}
        />
      </div>
    </PageBody>
  );
}

function PolicyRow({ policy }: { policy: Policy }) {
  return (
    <tr className="align-middle transition-colors hover:bg-hover">
      <td className="px-5 py-4">
        <span className="text-app font-medium text-strong">{policy.name}</span>
      </td>
      <td className="px-5 py-4">
        <LifecyclePill value={policy.lifecycle} />
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-app text-copy">
        {policy.enforcementMode ?? "—"}
      </td>
      <td className="px-5 py-4">
        <HealthCell value={policy.health} />
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-app text-copy">{policy.owner}</td>
      <td className="whitespace-nowrap px-5 py-4 text-app text-copy">{policy.lastChange}</td>
    </tr>
  );
}
