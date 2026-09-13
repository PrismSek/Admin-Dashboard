"use client";

import { useState } from "react";
import { useController, useFormContext } from "react-hook-form";

import { AppIcon } from "@/components/icons/AppIcon";
import { FieldError } from "@/components/ui/form-field";
import { PolicyConditionFields } from "@/features/policies/components/PolicyConditionFields";
import { PolicySelect } from "@/features/policies/components/PolicySelect";
import { policyBuilderContent, policyRoutes } from "@/features/policies/content";
import { useKeyedList } from "@/features/policies/hooks/use-keyed-list";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";
import type { PolicyCatalogs } from "@/features/policies/types";

const data = policyBuilderContent.data;

/**
 * Clipboard channel's DESTINATION section — "Class is"
 * (`clipboard.destinationClass`) and "Collection is" (`clipboard.
 * collectionIds`) — Figma `512:421`/`514:1293`/`514:1683`/`516:2171`.
 * Registers only `clipboard.*` (plus the shared `content.*` CONTENT block).
 */
export function ClipboardConditions({ catalogs }: { catalogs: PolicyCatalogs }) {
  const {
    control,
    formState: { errors },
  } = useFormContext<PolicyAuthoringValues>();
  const destinationClassField = useController({ control, name: "clipboard.destinationClass" });
  const collectionField = useController({ control, name: "clipboard.collectionIds" });
  const { keys, append, remove } = useKeyedList(collectionField.field.value, collectionField.field.onChange);
  const [pendingCollectionId, setPendingCollectionId] = useState("");

  const chosenCollections = collectionField.field.value;
  const availableCollections = catalogs.collections.filter((option) => !chosenCollections.includes(option.value));

  return (
    <>
      <PolicyConditionFields findings={catalogs.findings} />

      <section className="mt-6">
        <span className="text-micro font-medium tracking-wide text-subtle">{data.destinationChip}</span>

        <div className="mt-2">
          <PolicySelect
            id="policy-data-clipboard-destination-class"
            label={data.classIs}
            value={destinationClassField.field.value}
            onChange={destinationClassField.field.onChange}
            options={catalogs.destinationClasses}
            error={errors.clipboard?.destinationClass?.message}
          />
          <p className="mt-2 max-w-md text-meta text-dim">{data.destinationHelp}</p>
        </div>

        <div
          role="group"
          aria-label={data.collectionIs}
          aria-describedby={errors.clipboard?.collectionIds ? "policy-data-clipboard-collections-error" : undefined}
          className="mt-4"
        >
          <span className="text-body font-medium text-label">{data.collectionIs}</span>
          <p className="mt-1 text-meta text-dim">{chosenCollections.length === 0 ? data.anyCollection : data.oneOf}</p>

          {chosenCollections.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {chosenCollections.map((collectionId, index) => {
                const collection = catalogs.collections.find((option) => option.value === collectionId);
                const label = collection?.label ?? collectionId;
                return (
                  <li
                    key={keys[index] ?? collectionId}
                    className="flex items-center gap-2 rounded-app border border-hair-strong bg-chrome px-2.5 py-1.5 text-meta text-strong"
                  >
                    <span>{label}</span>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={`${data.removeCollection}: ${label}`}
                      className="text-dim hover:text-strong"
                    >
                      <AppIcon name="close" className="size-app-icon" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {availableCollections.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <PolicySelect
                id="policy-data-clipboard-add-collection"
                label={data.collectionLabel}
                value={pendingCollectionId}
                onChange={setPendingCollectionId}
                options={availableCollections}
              />
              <button
                type="button"
                disabled={!pendingCollectionId}
                onClick={() => {
                  if (!pendingCollectionId) return;
                  append(pendingCollectionId);
                  setPendingCollectionId("");
                }}
                className="inline-flex h-select-control items-center gap-1.5 rounded-app border border-hair-strong px-3 text-meta font-medium text-strong hover:bg-hover disabled:opacity-50"
              >
                <AppIcon name="plus" className="size-app-icon" />
                {data.addCollection}
              </button>
            </div>
          ) : null}

          <a
            href={policyRoutes.manageDomains}
            className="mt-2 inline-block text-meta font-medium text-brand hover:text-brand-hover"
          >
            {data.manageCollections}
          </a>

          <p className="mt-2 max-w-md text-meta text-dim">{data.collectionHelp}</p>

          {errors.clipboard?.collectionIds ? (
            <FieldError id="policy-data-clipboard-collections-error">{errors.clipboard.collectionIds.message}</FieldError>
          ) : null}
        </div>
      </section>
    </>
  );
}
