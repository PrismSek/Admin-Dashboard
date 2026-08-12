import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Card } from "@/components/app/card";
import { EndpointDetailShell } from "@/features/endpoints/components/endpoint-detail-shell";
import { getBrowserCoverage, getEndpoint } from "@/features/endpoints/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Endpoint overview" };

export default async function EndpointOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [endpoint, browsers] = await Promise.all([getEndpoint(id), getBrowserCoverage()]);

  if (!endpoint) notFound();

  const rows = [
    {
      label: "Protection",
      value: "Protected",
      tone: "ok" as const,
      evidence: endpoint.evidence,
      freshness: endpoint.lastSeen,
    },
    {
      label: "Deployment",
      value: "Current",
      evidence: `${endpoint.agentVersion} · up to date`,
      freshness: endpoint.lastSeen,
    },
    {
      label: "Connectivity",
      value: "Reporting",
      evidence: "Signed channel active",
      freshness: endpoint.lastSeen,
    },
    {
      label: "Assignment",
      value: endpoint.assignedUser?.split("@")[0] ?? "Unassigned",
      evidence: "Directory association for this endpoint",
      freshness: "10 Aug 09:00",
    },
    {
      label: "Endpoint identity",
      value: endpoint.deviceId,
      evidence: "Tenant-bound device identity",
      freshness: "09 Aug 06:21",
    },
  ];

  const uncovered = browsers.flatMap((b) => b.profiles).filter((p) => !p.covered).length;

  return (
    <EndpointDetailShell endpoint={endpoint} tab="overview">
      <Card className="divide-y divide-hair">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid items-center gap-4 px-6 py-4 md:grid-cols-[10rem_10rem_1fr_auto]"
          >
            <p className="text-meta text-dim">{row.label}</p>
            <p
              className={cn(
                "text-app font-medium",
                row.tone === "ok" ? "text-state-ok" : "text-strong",
              )}
            >
              {row.value}
            </p>
            <p className="text-meta text-dim">{row.evidence}</p>
            <p className="text-meta text-subtle md:text-right">{row.freshness}</p>
          </div>
        ))}
      </Card>

      <h2 className="mt-8 text-app font-semibold text-strong">
        {browsers.length} of {browsers.length} supported browsers actively covered · {uncovered}{" "}
        profile not covered
      </h2>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {browsers.map((browser) => (
          <Card key={browser.browser} className="p-5">
            <p className="text-app font-medium text-copy">{browser.browser}</p>
            <p className="mt-3 text-app font-medium text-state-ok">{browser.status}</p>
            <p className="mt-1.5 text-meta text-dim">{browser.summary}</p>
            <p className="mt-2 text-meta text-subtle">{browser.version}</p>

            <div className="mt-4 border-t border-hair pt-4">
              <p className="text-meta text-dim">
                Profiles · {browser.profiles.length}{" "}
                {browser.profiles.length === 1 ? "profile" : "profiles"}
              </p>
              <ul className="mt-2 flex flex-col gap-2.5">
                {browser.profiles.map((profile) => (
                  <li key={profile.name}>
                    <p className="flex items-center gap-2 text-meta text-strong">
                      <span
                        aria-hidden
                        className={cn(
                          "size-2.5 shrink-0 rounded-[2px]",
                          profile.covered
                            ? "bg-state-ok"
                            : "border border-hair-strong bg-transparent",
                        )}
                      />
                      <span className="font-medium">{profile.name}</span>
                      <span className="text-dim">
                        — {profile.covered ? "Covered" : "Not covered"}
                      </span>
                    </p>
                    <p className="mt-0.5 pl-4.5 text-meta text-subtle">{profile.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </EndpointDetailShell>
  );
}
