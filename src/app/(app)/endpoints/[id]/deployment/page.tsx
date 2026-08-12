import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StateMarker } from "@/components/app/pill";
import { TBody, TD, THead, TR, TableFrame } from "@/components/app/table";
import { EndpointDetailShell } from "@/features/endpoints/components/endpoint-detail-shell";
import { getDeploymentStages, getEndpoint } from "@/features/endpoints/data";

export const metadata: Metadata = { title: "Endpoint deployment" };

const stateTone = { completed: "ok", active: "ok", "not-required": "unknown" } as const;
const stateLabel = {
  completed: "Completed",
  active: "Active",
  "not-required": "Not required",
} as const;

export default async function EndpointDeploymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [endpoint, stages] = await Promise.all([getEndpoint(id), getDeploymentStages()]);

  if (!endpoint) notFound();

  return (
    <EndpointDetailShell endpoint={endpoint} tab="deployment">
      <TableFrame>
        <THead columns={["Stage", "State", "Evidence", "Freshness"]} />
        <TBody>
          {stages.map((stage) => (
            <TR key={stage.stage}>
              <TD align="middle">
                <span className="flex items-center gap-2">
                  <ChevronDown aria-hidden className="size-4 shrink-0 text-subtle" />
                  {stage.stage}
                </span>
              </TD>
              <TD align="middle">
                <StateMarker tone={stateTone[stage.state]} label={stateLabel[stage.state]} />
              </TD>
              <TD align="middle" className="text-dim">
                {stage.evidence}
              </TD>
              <TD align="middle" className="whitespace-nowrap text-subtle">
                {stage.freshness}
              </TD>
            </TR>
          ))}
        </TBody>
      </TableFrame>

      <p className="mt-5 text-meta text-dim">
        Stages hold a stable lifecycle order and do not reorder when states change. No
        deployment mutation is exposed in V1.
      </p>
    </EndpointDetailShell>
  );
}
