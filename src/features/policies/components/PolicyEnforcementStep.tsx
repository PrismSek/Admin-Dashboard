"use client";

import type { ComponentProps, ReactNode } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { FieldError } from "@/components/ui/form-field";
import { RowConnector, SectionChip } from "@/features/policies/components/conditions-ui";
import { PolicySelect } from "@/features/policies/components/PolicySelect";
import { policyBuilderContent, policyBuilderSteps } from "@/features/policies/content";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";
import type { PolicyCatalogOption } from "@/features/policies/types";
import { cn } from "@/lib/utils";

const enforcement = policyBuilderContent.enforcement;

/** Every real channel draws an "escape hatch" exception (its own escape option),
 * so the Enforcement card is uniform across channels. Only the unselected ""
 * placeholder has none. */
function exceptionConfigFor(channel: PolicyAuthoringValues["channel"]) {
  return channel === "clipboard" ||
    channel === "removable-media" ||
    channel === "print" ||
    channel === "desktop-apps"
    ? enforcement.exceptionsByChannel[channel]
    : undefined;
}

/**
 * "Enforcement & Message" (rail step 5) — rebuilt to the artifact's single card
 * of connector rows: ACTION (with the action's inline description), the
 * required "IF WE CAN'T TELL" fallback (unanswered by default, Required until
 * chosen), a channel-specific EXCEPTION escape hatch (shown when the action
 * interrupts the person), and the MESSAGE block (shown when the action OR that
 * fallback interrupts — anything other than "Audit only").
 */
export function PolicyEnforcementStep({ actions }: { actions: readonly PolicyCatalogOption[] }) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<PolicyAuthoringValues>();

  const action = useWatch<PolicyAuthoringValues, "enforcement.action">({ control, name: "enforcement.action" });
  const onUnknown = useWatch<PolicyAuthoringValues, "enforcement.onUnknown">({ control, name: "enforcement.onUnknown" });
  const channel = useWatch<PolicyAuthoringValues, "channel">({ control, name: "channel" });
  const storedException = useWatch<PolicyAuthoringValues, "enforcement.exception">({
    control,
    name: "enforcement.exception",
  });

  const answered = onUnknown !== "";
  const interrupts = action !== "AuditOnly";
  // The fallback interrupts the person too when "if we can't tell" is a
  // warn/block — they still see a message — so the MESSAGE block is shown for
  // either. The EXCEPTION escape hatch stays tied to the primary action only.
  const onUnknownInterrupts = onUnknown !== "" && onUnknown !== "AuditOnly";
  const showMessage = interrupts || onUnknownInterrupts;

  // The fallback reuses the action catalog, except its audit option is marked as
  // the engine default ("Audit only - engine default") to set it apart from the
  // primary ACTION's plain "Audit only".
  const fallbackOptions = actions.map((option) =>
    option.value === "AuditOnly" ? { ...option, label: enforcement.auditOnlyEngineDefault } : option,
  );

  const exceptionConfig = exceptionConfigFor(channel);
  const showException = Boolean(exceptionConfig) && interrupts;
  const exceptionOptions: PolicyCatalogOption[] = exceptionConfig
    ? [
        { value: "none", label: enforcement.noException },
        { value: exceptionConfig.value, label: exceptionConfig.label },
      ]
    : [];
  const exceptionValue = exceptionOptions.some((option) => option.value === storedException) ? storedException : "none";

  // A single live region for the whole step — several fields can be invalid at
  // once, so this summarises the current set on each change.
  const validationSummary = [
    errors.enforcement?.onUnknown?.message,
    errors.enforcement?.reasonCode?.message,
    errors.enforcement?.message?.message,
  ]
    .filter((message): message is string => Boolean(message))
    .join(" ");

  return (
    <section id="policy-enforcement" aria-label={policyBuilderSteps[4].title} className="mt-8 border-t border-hair-strong pt-8">
      <h2 className="text-section font-medium text-strong">{enforcement.title}</h2>
      <p className="mt-1 max-w-md text-meta text-dim">{enforcement.help}</p>

      <p aria-live="polite" className="sr-only">
        {validationSummary}
      </p>

      <div className="mt-4 flex flex-col gap-5 rounded-card border border-hair-strong bg-chrome p-4">
        {/* ACTION */}
        <EnforcementRow chip={enforcement.actionChip}>
          <Controller
            name="enforcement.action"
            control={control}
            render={({ field }) => (
              <PolicySelect
                pill
                id="policy-enforcement-action"
                label={enforcement.doThis}
                value={field.value}
                onChange={field.onChange}
                options={actions}
              />
            )}
          />
        </EnforcementRow>

        {/* IF WE CAN'T TELL — required fallback */}
        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2">
            <SectionChip>{enforcement.ifCantTellChip}</SectionChip>
            <span
              className={cn(
                "inline-flex items-center rounded-app border px-1.5 py-0.5 text-micro font-medium tracking-wide",
                answered
                  ? "border-hair-strong text-dim"
                  : "uppercase border-brand bg-brand-halo text-brand",
              )}
            >
              {answered ? enforcement.answered : enforcement.required}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <RowConnector />
            <div className="flex min-w-0 flex-col gap-2">
              <Controller
                name="enforcement.onUnknown"
                control={control}
                render={({ field }) => (
                  <PolicySelect
                    pill
                    id="policy-enforcement-onUnknown"
                    label={enforcement.doThisInstead}
                    value={field.value}
                    onChange={field.onChange}
                    options={fallbackOptions}
                    placeholder={enforcement.chooseOne}
                    error={errors.enforcement?.onUnknown?.message}
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* EXCEPTION — channel-specific escape hatch, only when the action interrupts */}
        {showException ? (
          <EnforcementRow chip={enforcement.exceptionChip}>
            <Controller
              name="enforcement.exception"
              control={control}
              render={({ field }) => (
                <PolicySelect
                  pill
                  id="policy-enforcement-exception"
                  label={enforcement.letItThroughIf}
                  value={exceptionValue}
                  onChange={field.onChange}
                  options={exceptionOptions}
                />
              )}
            />
          </EnforcementRow>
        ) : null}

        {/* MESSAGE — whenever the person is interrupted, by the action or the fallback */}
        {showMessage ? (
          <div className="flex flex-col items-start gap-3">
            <SectionChip>{enforcement.messageChip}</SectionChip>
            <PillTextInput
              id="policy-enforcement-reasonCode"
              label={enforcement.reasonCode}
              placeholder={enforcement.reasonCodePlaceholder}
              error={errors.enforcement?.reasonCode?.message}
              inputProps={register("enforcement.reasonCode")}
            />
            <PillTextInput
              id="policy-enforcement-message"
              label={enforcement.theySee}
              placeholder={enforcement.theySeePlaceholder}
              wide
              error={errors.enforcement?.message?.message}
              inputProps={register("enforcement.message")}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** A chip + connector + control row inside the Enforcement card. */
function EnforcementRow({ chip, children }: { chip: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <SectionChip>{chip}</SectionChip>
      <div className="flex items-start gap-2">
        <RowConnector />
        <div className="flex min-w-0 flex-col gap-2">{children}</div>
      </div>
    </div>
  );
}

/** A pill-shaped labelled text field — the MESSAGE block's `[Reason code │ … ]`
 * / `[They see │ … ]` rows. */
function PillTextInput({
  id,
  label,
  placeholder,
  wide,
  error,
  inputProps,
}: {
  id: string;
  label: string;
  placeholder?: string;
  wide?: boolean;
  error?: string;
  inputProps: ComponentProps<"input">;
}) {
  const errorId = `${id}-error`;
  return (
    <div className={cn("flex items-start gap-2", wide && "w-full")}>
      <RowConnector />
      <div className={cn("flex min-w-0 flex-col gap-1.5", wide && "w-full")}>
        <div
          className={cn(
            "inline-flex h-select-control items-center rounded-app border bg-chrome",
            wide && "w-full",
            error ? "border-danger" : "border-hair-strong",
          )}
        >
          <label htmlFor={id} className="shrink-0 pl-3 pr-2.5 text-app text-dim">
            {label}
          </label>
          <span aria-hidden className="h-4 w-px shrink-0 bg-hair-strong" />
          <input
            id={id}
            placeholder={placeholder}
            {...inputProps}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="min-w-0 flex-1 bg-transparent px-3 text-app text-strong outline-none placeholder:text-subtle"
          />
        </div>
        {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      </div>
    </div>
  );
}
