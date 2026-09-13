"use client";

import { useWatch } from "react-hook-form";

import { ClipboardConditions } from "@/features/policies/components/ClipboardConditions";
import { DesktopAppConditions } from "@/features/policies/components/DesktopAppConditions";
import { PrintConditions } from "@/features/policies/components/PrintConditions";
import { RemovableMediaConditions } from "@/features/policies/components/RemovableMediaConditions";
import { policyBuilderSteps } from "@/features/policies/content";
import { unreachableChannel } from "@/features/policies/serialize-policy";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";
import type { PolicyCatalogs } from "@/features/policies/types";

/**
 * "Data" — define trigger actions (Figma's four channel-specific Data
 * frames: Clipboard `512:421` family, Removable media `563:3248` family,
 * Print `563:6975` family, Desktop apps `563:9286` family). Exactly one
 * channel's editor renders at a time; the other three channels' rule
 * objects stay populated in the form (`shouldUnregister: false` on the
 * builder's `useForm`) so switching `channel` back and forth never drops an
 * admin's edits — see `PolicyBuilder.test.tsx`'s retention test.
 */
export function PolicyDataStep({ catalogs }: { catalogs: PolicyCatalogs }) {
  const channel = useWatch<PolicyAuthoringValues, "channel">({ name: "channel" });

  return (
    <section id="policy-data" aria-label={policyBuilderSteps[3].title} className="mt-6">
      <PolicyDataChannelEditor channel={channel} catalogs={catalogs} />
    </section>
  );
}

function PolicyDataChannelEditor({
  channel,
  catalogs,
}: {
  channel: PolicyAuthoringValues["channel"];
  catalogs: PolicyCatalogs;
}) {
  switch (channel) {
    case "clipboard":
      return <ClipboardConditions catalogs={catalogs} />;
    case "removable-media":
      return <RemovableMediaConditions catalogs={catalogs} />;
    case "print":
      return <PrintConditions catalogs={catalogs} />;
    case "desktop-apps":
      return <DesktopAppConditions catalogs={catalogs} />;
    default:
      return unreachableChannel(channel);
  }
}
