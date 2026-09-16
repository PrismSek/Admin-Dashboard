"use client";

import type { ReactNode } from "react";

import { ConditionsCard } from "@/features/policies/components/conditions-ui";
import { PolicyConditionFields } from "@/features/policies/components/PolicyConditionFields";
import { PolicyReadsAs } from "@/features/policies/components/PolicyReadsAs";
import { policyBuilderContent } from "@/features/policies/content";
import type { PolicyCatalogs } from "@/features/policies/types";

const data = policyBuilderContent.data;

/**
 * The "Conditions" section shown for every state of the Data step (Figma
 * `396:4829`): the heading and help text, then one bordered card holding the
 * shared, channel-independent CONTENT block (`PolicyConditionFields`) above the
 * channel-specific destination block passed as `children` (DESTINATION for
 * clipboard, DEVICE / PRINTER / APP for the others), then the live "Reads as —"
 * restatement. `children` is omitted before a channel is selected — the section
 * still renders so it is never hidden by default; only the destination waits on
 * the channel.
 */
export function PolicyConditionsSection({
  catalogs,
  children,
}: {
  catalogs: PolicyCatalogs;
  children?: ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2 className="text-section font-medium text-strong">{data.conditionsTitle}</h2>
      <p className="mt-1 max-w-xl text-meta text-dim">{data.conditionsHelp}</p>

      <ConditionsCard>
        <PolicyConditionFields findings={catalogs.findings} confidences={catalogs.confidences} />
        {children}
      </ConditionsCard>

      <PolicyReadsAs catalogs={catalogs} />
    </section>
  );
}
