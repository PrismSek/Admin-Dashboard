import { Filter, MoreVertical, Plus, RotateCw } from "lucide-react";
import type { Metadata } from "next";

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
import { Checkbox } from "@/components/ui/checkbox";
import { DispositionCell } from "@/features/manage/components/disposition-cell";
import {
  domainCollections,
  getDomains,
  matchScopeLabel,
  type DomainEntry,
} from "@/features/manage/domains";

export const metadata: Metadata = { title: "Domains" };

export default async function DomainsPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; q?: string }>;
}) {
  const params = await searchParams;
  const all = await getDomains();

  const collection = params.collection ?? "all";
  const query = params.q?.trim().toLowerCase() ?? "";
  const rows = all.filter(
    (entry) =>
      (collection === "all" || entry.collection === collection) &&
      (!query || entry.domain.toLowerCase().includes(query)),
  );

  return (
    <PageBody>
      <PageHeader title="Domains" />

      <FilterBar
        action="/manage/domains"
        className="mt-6"
        trailing={
          <div className="flex items-center gap-3">
            <SquareIconButton label="Refresh" href="/manage/domains">
              <RotateCw />
            </SquareIconButton>
            <ToolbarSearch
              placeholder="Search domains"
              defaultValue={params.q}
              className="w-64"
            />
            <AddAction href="/manage/domains?panel=add">
              <Plus className="size-4" />
              Add domains
            </AddAction>
          </div>
        }
      >
        <ScopeSelect
          name="collection"
          prefix="Collection"
          defaultValue={collection}
          options={[
            { value: "all", label: "All collections" },
            ...domainCollections.map((entry) => ({ value: entry, label: entry })),
          ]}
        />
        <SquareIconButton label="More filters">
          <Filter />
        </SquareIconButton>
      </FilterBar>

      <div className="mt-4 overflow-hidden rounded-app border border-hair-strong bg-chrome">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-hair">
                <Th className="w-12">
                  <Checkbox aria-label="Select all domains" />
                </Th>
                <Th>Domain</Th>
                <Th>Collection</Th>
                <Th>Disposition</Th>
                <Th>Match Scope</Th>
                <Th>Added By</Th>
                <Th className="w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hair">
              {rows.map((entry) => (
                <DomainRow key={entry.id} entry={entry} />
              ))}
            </tbody>
          </table>
        </div>

        <ListFooter from={rows.length ? 1 : 0} to={rows.length} total={all.length} />
      </div>
    </PageBody>
  );
}

function DomainRow({ entry }: { entry: DomainEntry }) {
  return (
    <tr className="align-middle transition-colors hover:bg-hover">
      <td className="px-5 py-4">
        <Checkbox aria-label={`Select ${entry.domain}`} />
      </td>
      <td className="px-5 py-4">
        <p className="text-app text-strong">{entry.domain}</p>
        {entry.note ? <p className="mt-0.5 text-meta text-subtle">{entry.note}</p> : null}
      </td>
      <td className="px-5 py-4 text-app text-copy">{entry.collection}</td>
      <td className="px-5 py-4">
        <DispositionCell value={entry.disposition} />
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-app text-copy">
        {matchScopeLabel[entry.matchScope]}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-app text-copy">{entry.addedBy}</td>
      <td className="px-5 py-4">
        <button
          type="button"
          aria-label={`Actions for ${entry.domain}`}
          className="flex size-8 items-center justify-center rounded-app text-dim transition-colors hover:bg-hover"
        >
          <MoreVertical aria-hidden className="size-4" />
        </button>
      </td>
    </tr>
  );
}
