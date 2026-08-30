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
import { appCollections, getApplications, type Application } from "@/features/manage/applications";

export const metadata: Metadata = { title: "Applications" };

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; q?: string }>;
}) {
  const params = await searchParams;
  const all = await getApplications();

  const collection = params.collection ?? "all";
  const query = params.q?.trim().toLowerCase() ?? "";
  const rows = all.filter(
    (app) =>
      (collection === "all" || app.collection === collection) &&
      (!query ||
        app.name.toLowerCase().includes(query) ||
        app.publisher.toLowerCase().includes(query)),
  );

  return (
    <PageBody>
      <PageHeader title="Applications" />

      <FilterBar
        action="/manage/applications"
        className="mt-6"
        trailing={
          <div className="flex items-center gap-3">
            <SquareIconButton label="Refresh" href="/manage/applications">
              <RotateCw />
            </SquareIconButton>
            <ToolbarSearch
              placeholder="Search applications, publishers"
              defaultValue={params.q}
              className="w-72"
            />
            <AddAction href="/manage/applications?panel=add">
              <Plus className="size-4" />
              Add applications
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
            ...appCollections.map((entry) => ({ value: entry, label: entry })),
          ]}
        />
        <SquareIconButton label="More filters">
          <Filter />
        </SquareIconButton>
      </FilterBar>

      <div className="mt-4 overflow-hidden rounded-app border border-hair-strong bg-chrome">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left">
            <thead>
              <tr className="border-b border-hair">
                <Th className="w-12">
                  <Checkbox aria-label="Select all applications" />
                </Th>
                <Th>Application</Th>
                <Th>Collection</Th>
                <Th>Disposition</Th>
                <Th>Publisher</Th>
                <Th>Seen On</Th>
                <Th className="w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hair">
              {rows.map((app) => (
                <ApplicationRow key={app.id} app={app} />
              ))}
            </tbody>
          </table>
        </div>

        <ListFooter from={rows.length ? 1 : 0} to={rows.length} total={all.length} />
      </div>
    </PageBody>
  );
}

function ApplicationRow({ app }: { app: Application }) {
  return (
    <tr className="align-middle transition-colors hover:bg-hover">
      <td className="px-5 py-4">
        <Checkbox aria-label={`Select ${app.name}`} />
      </td>
      <td className="px-5 py-4">
        <p className="text-app text-strong">{app.name}</p>
        {app.verified ? (
          <p className="mt-0.5 text-meta text-subtle">Signed publisher verified</p>
        ) : null}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-app text-copy">{app.collection}</td>
      <td className="px-5 py-4">
        <DispositionCell value={app.disposition} />
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-app text-copy">{app.publisher}</td>
      <td className="whitespace-nowrap px-5 py-4">
        <p className="text-app text-strong">{app.seenOn}</p>
        <p className="mt-0.5 text-meta text-subtle">{app.endpointCount} endpoints</p>
      </td>
      <td className="px-5 py-4">
        <button
          type="button"
          aria-label={`Actions for ${app.name}`}
          className="flex size-8 items-center justify-center rounded-app text-dim transition-colors hover:bg-hover"
        >
          <MoreVertical aria-hidden className="size-4" />
        </button>
      </td>
    </tr>
  );
}
