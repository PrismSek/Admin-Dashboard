"use client";

import { useId, useState } from "react";
import { useController, useFormContext } from "react-hook-form";

import { AppIcon } from "@/components/icons/AppIcon";
import { FieldError } from "@/components/ui/form-field";
import { policyBuilderContent } from "@/features/policies/content";
import { useKeyedList } from "@/features/policies/hooks/use-keyed-list";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";

const data = policyBuilderContent.data;

type ExceptionFieldName = "removableMedia.exceptionIds" | "print.exceptionIds" | "desktopApps.exceptionIds";

/**
 * The per-channel EXCEPTION picker shared by Removable media (`563:6411`),
 * Print (`563:8722`), and Desktop apps (`563:12255`) — a free-text repeatable
 * list, since no catalog of exception reasons exists (see `content.ts`'s doc
 * comment on `removableExceptionExample` etc.). Clipboard has no
 * `exceptionIds` field and never renders this.
 */
export function PolicyExceptionField({
  name,
  error,
  placeholder,
}: {
  name: ExceptionFieldName;
  error?: string;
  placeholder?: string;
}) {
  const { control } = useFormContext<PolicyAuthoringValues>();
  const { field } = useController({ control, name });
  const { keys, append, remove } = useKeyedList(field.value, field.onChange);
  const [draft, setDraft] = useState("");
  const inputId = useId();
  const errorId = `${inputId}-error`;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <span className="text-micro font-medium tracking-wide text-subtle">{data.exceptionChip}</span>
        <span className="text-body font-medium text-label">{data.letItThroughIf}</span>
      </div>

      {field.value.length === 0 ? (
        <p className="mt-2 text-meta text-dim">{data.noException}</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {field.value.map((reason, index) => (
            <li key={keys[index] ?? reason} className="flex items-center gap-2">
              <span className="flex-1 rounded-app border border-hair-strong bg-chrome px-3 py-1.5 text-meta text-strong">
                {reason}
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`${data.removeException}: ${reason}`}
                className="text-dim hover:text-strong"
              >
                <AppIcon name="close" className="size-app-icon" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex items-center gap-2">
        <label className="sr-only" htmlFor={inputId}>
          {data.addException}
        </label>
        <input
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="h-select-control flex-1 rounded-app border border-hair-strong bg-chrome px-3 text-app text-strong outline-none placeholder:text-subtle focus:border-brand-accent"
        />
        <button
          type="button"
          disabled={draft.trim().length === 0}
          onClick={() => {
            const trimmed = draft.trim();
            if (!trimmed) return;
            append(trimmed);
            setDraft("");
          }}
          className="inline-flex h-select-control shrink-0 items-center gap-1.5 rounded-app border border-hair-strong px-3 text-meta font-medium text-strong hover:bg-hover disabled:opacity-50"
        >
          <AppIcon name="plus" className="size-app-icon" />
          {data.addException}
        </button>
      </div>

      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
