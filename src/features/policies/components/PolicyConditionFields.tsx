"use client";

import { useState } from "react";
import { useController, useFormContext } from "react-hook-form";

import { AppIcon } from "@/components/icons/AppIcon";
import { FieldError } from "@/components/ui/form-field";
import { PolicySelect } from "@/features/policies/components/PolicySelect";
import { policyBuilderContent } from "@/features/policies/content";
import { useKeyedList } from "@/features/policies/hooks/use-keyed-list";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";
import type { PolicyCatalogOption } from "@/features/policies/types";
import { cn } from "@/lib/utils";

const data = policyBuilderContent.data;

/**
 * The CONTENT section every channel's Data step shows identically —
 * "Matches conditions" / "Any content" plus the repeatable finding list
 * (Figma's `CONTENT` chip family: e.g. `512:421` clipboard, `563:3248`
 * removable media, `563:6975` print, `563:9286` desktop apps). Registers the
 * shared `content.mode` / `content.findingIds` fields — not a per-channel
 * namespace — so it is rendered once by each channel editor rather than
 * being channel-specific itself.
 */
export function PolicyConditionFields({ findings }: { findings: readonly PolicyCatalogOption[] }) {
  const {
    control,
    formState: { errors },
  } = useFormContext<PolicyAuthoringValues>();
  const modeField = useController({ control, name: "content.mode" });
  const findingsField = useController({ control, name: "content.findingIds" });
  const { keys, append, remove } = useKeyedList(findingsField.field.value, findingsField.field.onChange);
  const [pendingFindingId, setPendingFindingId] = useState("");

  const chosen = findingsField.field.value;
  const available = findings.filter((option) => !chosen.includes(option.value));
  const findingsErrorId = "policy-data-findings-error";

  return (
    <section>
      <h2 className="text-section font-medium text-strong">{data.conditionsTitle}</h2>
      <p className="mt-1 max-w-xl text-meta text-dim">{data.conditionsHelp}</p>

      <div className="mt-4 flex items-center gap-3">
        <span className="text-micro font-medium tracking-wide text-subtle">{data.contentChip}</span>
        <div
          role="group"
          aria-label={data.conditionsTitle}
          className="inline-flex overflow-hidden rounded-app border border-hair-strong"
        >
          <button
            type="button"
            aria-pressed={modeField.field.value === "specific"}
            onClick={() => modeField.field.onChange("specific")}
            className={cn(
              "px-3 py-1.5 text-meta font-medium",
              modeField.field.value === "specific" ? "bg-active text-strong" : "bg-chrome text-dim",
            )}
          >
            {data.matchesConditions}
          </button>
          <button
            type="button"
            aria-pressed={modeField.field.value === "any"}
            onClick={() => modeField.field.onChange("any")}
            className={cn(
              "px-3 py-1.5 text-meta font-medium",
              modeField.field.value === "any" ? "bg-active text-strong" : "bg-chrome text-dim",
            )}
          >
            {data.anyContent}
          </button>
        </div>
      </div>

      {modeField.field.value === "specific" ? (
        <div className="mt-3 flex flex-col gap-3">
          {chosen.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {chosen.map((findingId, index) => {
                const finding = findings.find((option) => option.value === findingId);
                const label = finding?.label ?? findingId;
                return (
                  <li
                    key={keys[index] ?? findingId}
                    className="flex items-center gap-2 rounded-app border border-hair-strong bg-chrome px-2.5 py-1.5 text-meta text-strong"
                  >
                    <span className="text-micro font-medium text-subtle">{data.findingLabel}</span>
                    <span>{label}</span>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={`${data.removeFinding}: ${label}`}
                      className="text-dim hover:text-strong"
                    >
                      <AppIcon name="close" className="size-app-icon" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {available.length > 0 ? (
            <div className="flex flex-wrap items-end gap-2">
              <PolicySelect
                id="policy-data-add-finding"
                label={data.findingLabel}
                value={pendingFindingId}
                onChange={setPendingFindingId}
                options={available}
              />
              <button
                type="button"
                disabled={!pendingFindingId}
                onClick={() => {
                  if (!pendingFindingId) return;
                  append(pendingFindingId);
                  setPendingFindingId("");
                }}
                className="inline-flex h-select-control items-center gap-1.5 rounded-app border border-hair-strong px-3 text-meta font-medium text-strong hover:bg-hover disabled:opacity-50"
              >
                <AppIcon name="plus" className="size-app-icon" />
                {data.addFinding}
              </button>
            </div>
          ) : null}

          {errors.content?.findingIds ? (
            <FieldError id={findingsErrorId}>{errors.content.findingIds.message}</FieldError>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
