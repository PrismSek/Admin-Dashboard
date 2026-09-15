import type { Metadata } from "next";

import { FilterBar } from "@/components/app/filter-bar";
import { ListFooter, ScopeSelect, Th, ToolbarSearch } from "@/components/app/list-controls";
import { PageBody, PageHeader } from "@/components/app/page-header";
import { StatTiles } from "@/components/app/stat-tiles";
import { DeployWizard } from "@/features/deployment/components/deploy-wizard";
import {
  getAgentRelease,
  getCampaigns,
  getDeployStats,
  getUnprotected,
  stateLabel,
} from "@/features/deployment/data";

export const metadata: Metadata = { title: "Deployment" };

export default async function DeploymentPage() {
  const [agent, stats, campaigns, unprotected] = await Promise.all([
    getAgentRelease(),
    getDeployStats(),
    getCampaigns(),
    getUnprotected(),
  ]);

  return (
    <PageBody>
      <PageHeader title="Deployment" action={<DeployWizard />} />

      {/* Current agent release banner */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-app border border-hair-strong bg-chrome px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-app font-medium text-strong">{agent.version}</span>
          <span className="rounded-sm border border-badge-green-line bg-badge-green-bg px-1.5 py-0.5 text-fine font-medium text-badge-green-fg">
            {agent.channel}
          </span>
          <span className="text-meta text-subtle-alt">{agent.released}</span>
        </div>
        <div className="flex items-center gap-5">
          <button type="button" className="text-meta font-medium text-copy transition-colors hover:text-strong">
            Download agent
          </button>
          <button type="button" className="text-meta font-medium text-copy transition-colors hover:text-strong">
            Release notes
          </button>
        </div>
      </div>

      <FilterBar
        action="/manage/deployment"
        className="mt-6"
        trailing={<ToolbarSearch className="w-64" placeholder="Search campaigns…" />}
      >
        <ScopeSelect
          name="scope"
          prefix="Scope"
          defaultValue="all"
          options={[
            { value: "all", label: "All campaigns" },
            { value: "active", label: "Active" },
            { value: "expired", label: "Expired" },
          ]}
        />
      </FilterBar>

      <StatTiles
        className="mt-6 grid-cols-2 lg:grid-cols-5"
        stats={stats.map((stat) => ({ label: stat.label, value: stat.value }))}
      />

      <div className="mt-6 overflow-hidden rounded-app border border-hair-strong bg-chrome">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-hair">
                <Th>Campaign</Th>
                <Th>Recipients</Th>
                <Th>Rollout progress</Th>
                <Th>Link expires</Th>
                <Th>Created</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hair">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="align-middle transition-colors hover:bg-hover">
                  <td className="px-5 py-4">
                    <p className="text-app text-strong">{campaign.name}</p>
                    <p className="mt-0.5 text-meta text-subtle">{campaign.detail}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-app text-strong">{campaign.recipients}</td>
                  <td className="px-5 py-4 text-meta text-dim">{campaign.progressNote}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-app text-strong">{campaign.expires}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-app text-copy">{campaign.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ListFooter from={1} to={campaigns.length} total={campaigns.length} />
      </div>

      {/* Not yet protected */}
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-section font-medium text-strong">Not yet protected</h2>
            <p className="mt-1 text-meta text-subtle">18 of 50 employees across all active campaigns</p>
          </div>
          <button type="button" className="text-meta font-medium text-copy transition-colors hover:text-strong">
            Send a reminder to all 18
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-app border border-hair-strong bg-chrome">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-hair">
                  <Th>Employee</Th>
                  <Th>Department</Th>
                  <Th>Campaign</Th>
                  <Th>State</Th>
                  <Th>What is happening</Th>
                  <Th className="w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-hair">
                {unprotected.map((person) => (
                  <tr key={person.id} className="align-middle transition-colors hover:bg-hover">
                    <td className="px-5 py-4">
                      <p className="text-app text-strong">{person.name}</p>
                      <p className="mt-0.5 text-meta text-subtle">{person.email}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-app text-copy">{person.department}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-app text-copy">{person.campaign}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-app text-label">{stateLabel[person.state]}</td>
                    <td className="px-5 py-4 text-meta text-dim">{person.note}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        className="text-meta font-medium text-copy transition-colors hover:text-strong"
                      >
                        Resend
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageBody>
  );
}
