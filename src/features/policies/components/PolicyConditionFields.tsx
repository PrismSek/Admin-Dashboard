"use client";

import type { ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";

import { FieldError } from "@/components/ui/form-field";
import {
  AddIconButton,
  RemoveIconButton,
  RowConnector,
  SectionChip,
} from "@/features/policies/components/conditions-ui";
import { PolicySelect } from "@/features/policies/components/PolicySelect";
import { policyBuilderContent } from "@/features/policies/content";
import { useKeyedList } from "@/features/policies/hooks/use-keyed-list";
import type { ConditionRow, PolicyAuthoringValues } from "@/features/policies/schemas";
import { isConditionRowFilled } from "@/features/policies/schemas";
import type { PolicyCatalogOption } from "@/features/policies/types";
import { cn } from "@/lib/utils";

const data = policyBuilderContent.data;

type ConditionCatalogs = {
  findings: readonly PolicyCatalogOption[];
  confidences: readonly PolicyCatalogOption[];
};

/**
 * The CONTENT block at the top of every channel's Conditions card: the "Matches
 * conditions / Any content" toggle and a counter, then the group of condition
 * rows (`allOf` — every row must match). Each row is a `[Finding │ detector │
 * confidence]` pill — the leading "Finding" label is static (content tags are
 * gone), and the detector and confidence are picked from their catalogs.
 * Registers the shared `content.*` fields, so it is rendered once by each
 * channel editor (via `PolicyConditionsSection`).
 */
export function PolicyConditionFields({ findings, confidences }: ConditionCatalogs) {
  const {
    control,
    formState: { errors },
  } = useFormContext<PolicyAuthoringValues>();
  const modeField = useController({ control, name: "content.mode" });
  const allOfField = useController({ control, name: "content.allOf" });

  const isMatch = modeField.field.value === "specific";
  const allOf = allOfField.field.value;
  const filledCount = allOf.filter(isConditionRowFilled).length;

  // A new row opens fully unanswered — nothing is pre-selected, so its
  // confidence is picked alongside its finding.
  const emptyRow = (): ConditionRow => ({ findingType: "", minimumConfidence: "" });

  const allOfError = errors.content?.allOf;
  const allOfErrorId = "policy-data-conditions-error";
  const catalogs: ConditionCatalogs = { findings, confidences };

  return (
    <section>
      <div className="flex flex-wrap items-center gap-3">
        <SectionChip>{data.contentChip}</SectionChip>

        <div
          role="group"
          aria-label={data.conditionsTitle}
          className="inline-flex items-center rounded-app border border-hair-strong bg-hair p-0.5"
        >
          <ModeButton active={isMatch} onClick={() => modeField.field.onChange("specific")}>
            {data.matchesConditions}
          </ModeButton>
          <ModeButton active={!isMatch} onClick={() => modeField.field.onChange("any")}>
            {data.anyContent}
          </ModeButton>
        </div>

        {isMatch ? <span className="text-micro text-subtle">{data.findingCounter(filledCount)}</span> : null}
      </div>

      {isMatch ? (
        <div
          role="group"
          aria-label={data.conditionsListLabel}
          aria-describedby={allOfError ? allOfErrorId : undefined}
          className="mt-3 flex flex-col gap-4"
        >
          <ConditionGroup
            idPrefix="policy-data-allof"
            rows={allOf}
            onChange={allOfField.field.onChange}
            emptyRow={emptyRow}
            catalogs={catalogs}
          />

          {allOfError ? <FieldError id={allOfErrorId}>{allOfError.message}</FieldError> : null}
        </div>
      ) : null}
    </section>
  );
}

/** One segment of the "Matches conditions / Any content" toggle. */
function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-app px-3 py-1 text-meta font-medium transition-colors",
        active ? "bg-brand text-brand-fg" : "text-dim",
      )}
    >
      {children}
    </button>
  );
}

/** The group of condition rows. Owns its own add/remove; never drops below one
 * row (the last "×" is disabled). */
function ConditionGroup({
  idPrefix,
  rows,
  onChange,
  emptyRow,
  catalogs,
}: {
  idPrefix: string;
  rows: readonly ConditionRow[];
  onChange: (next: ConditionRow[]) => void;
  emptyRow: () => ConditionRow;
  catalogs: ConditionCatalogs;
}) {
  const { keys, append, remove } = useKeyedList<ConditionRow>(rows, onChange);

  function setRow(index: number, patch: Partial<ConditionRow>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, index) => {
        const isLast = index === rows.length - 1;
        const describe = catalogs.findings.find((option) => option.value === row.findingType)?.label;
        return (
          <div key={keys[index] ?? index} className="flex flex-wrap items-center gap-2">
            <RowConnector />
            <div
              className={cn(
                "inline-flex h-select-control max-w-full items-center rounded-app border bg-chrome",
                "border-hair-strong focus-within:border-brand-accent",
              )}
            >
              <span className="shrink-0 pl-3 pr-2.5 text-app text-dim">{data.findingLabel}</span>
              <span aria-hidden className="h-4 w-px shrink-0 bg-hair-strong" />
              <PolicySelect
                pill
                bare
                id={`${idPrefix}-finding-${index}`}
                label=""
                ariaLabel={data.findingPlaceholder}
                value={row.findingType}
                onChange={(next) => setRow(index, { findingType: next })}
                options={catalogs.findings}
                placeholder={data.findingPlaceholder}
                searchable
                searchPlaceholder={data.findingPlaceholder}
              />
              <PolicySelect
                pill
                bare
                id={`${idPrefix}-confidence-${index}`}
                label=""
                ariaLabel={data.confidenceLabel}
                value={row.minimumConfidence}
                onChange={(next) => setRow(index, { minimumConfidence: next })}
                options={catalogs.confidences}
                placeholder={policyBuilderContent.chooseOne}
              />
            </div>
            <RemoveIconButton
              label={`${data.removeFinding}${describe ? `: ${describe}` : ""}`}
              onClick={() => remove(index)}
              disabled={rows.length < 2}
            />
            {isLast ? <AddIconButton label={data.addFinding} onClick={() => append(emptyRow())} /> : null}
          </div>
        );
      })}
    </div>
  );
}
