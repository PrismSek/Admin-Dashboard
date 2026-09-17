"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { policyBuilderContent } from "@/features/policies/content";
import { composeReadsAs } from "@/features/policies/reads-as";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";
import type { PolicyCatalogs } from "@/features/policies/types";

/**
 * The live "Reads as —" restatement under the Conditions card (Figma
 * `396:4906`): a plain-language sentence composed from the current form values
 * that updates as the admin edits. Read-only — see `composeReadsAs`.
 */
export function PolicyReadsAs({ catalogs }: { catalogs: PolicyCatalogs }) {
  const { control } = useFormContext<PolicyAuthoringValues>();
  const channel = useWatch({ control, name: "channel" });
  const content = useWatch({ control, name: "content" });
  const targetOp = useWatch({ control, name: "clipboard.targetOp" });
  const targetIds = useWatch({ control, name: "clipboard.targetIds" });
  const deviceClass = useWatch({ control, name: "removableMedia.deviceClass" });
  const printTarget = useWatch({ control, name: "print.target" });
  const appOp = useWatch({ control, name: "desktopApps.appOp" });
  const applicationIds = useWatch({ control, name: "desktopApps.applicationIds" });
  const action = useWatch({ control, name: "enforcement.action" });
  const onUnknown = useWatch({ control, name: "enforcement.onUnknown" });

  const sentence = composeReadsAs(
    {
      channel,
      contentMode: content.mode,
      allOf: content.allOf,
      targetOp,
      targetIds,
      deviceClass,
      printTarget,
      appOp,
      applicationIds,
      action,
      onUnknown,
    },
    catalogs,
  );

  return (
    <p className="mt-3 max-w-xl text-meta text-dim">
      <span className="text-subtle">{policyBuilderContent.data.readsAsPrefix} </span>
      {sentence}
    </p>
  );
}
