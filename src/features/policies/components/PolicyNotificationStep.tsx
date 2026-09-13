"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { AppInput } from "@/components/app/field";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/form-field";
import { policyBuilderContent, policyBuilderSteps } from "@/features/policies/content";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";
import { cn } from "@/lib/utils";

const notification = policyBuilderContent.notification;

/**
 * "End user Notification" — handle the unknown case (rail step 6).
 *
 * ⚠️ PLAN-vs-FIGMA FLAG (task 10 brief): the real Figma frame for this step
 * (the `notification.channelChip`/`channelLabel`/`triggerChip`/`remediations`
 * copy above) draws a NOTIFICATION-CHANNEL picker ("Tell the team via" → a
 * channel like Slack) plus a WHEN-ISSUE-IS-DETECTED remediation radio group
 * (none / engage-assignee / remove-public-link / apply-label) — not the
 * enabled/title/message trio this component renders. The *approved*
 * `policyAuthoringSchema.notification` field is `{enabled, title, message}`
 * (schemas.ts), and `serializePolicyPreview`'s output shape depends on it, so
 * this step is built against that schema rather than the channel/remediation
 * UI actually drawn in Figma — a plan-mandated stopgap. Reconcile at Task 12:
 * either the schema gains a channel/remediation shape and this step is
 * rebuilt against it, or the plan is amended to match the shipped design.
 * See `.superpowers/sdd/task-10-report.md` for the full note.
 *
 * `enabled` gates `title`/`message` via the native `disabled` attribute set
 * directly on the JSX element (not through `register`'s own `disabled`
 * option) — `register(name, { disabled: true })` would make react-hook-form
 * drop the field from its tracked values, and `shouldUnregister: false` on
 * the builder's form exists specifically so hidden/disabled fields keep
 * their last-typed value. Plain HTML `disabled` only blocks user edits; the
 * DOM node (and its value) stays registered and readable.
 */
export function PolicyNotificationStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<PolicyAuthoringValues>();
  const enabled = useWatch<PolicyAuthoringValues, "notification.enabled">({
    control,
    name: "notification.enabled",
  });

  const titleErrorId = "policy-notification-title-error";
  const messageErrorId = "policy-notification-message-error";

  return (
    <section id="policy-notification" aria-label={policyBuilderSteps[5].title} className="mt-8">
      <h2 className="text-section font-medium text-strong">{notification.title}</h2>
      <p className="mt-1 max-w-md text-meta text-dim">{notification.help}</p>

      <label className="mt-4 flex items-center gap-2.5">
        <Checkbox {...register("notification.enabled")} />
        <span className="text-body font-medium text-label">{notification.enabledLabel}</span>
      </label>

      <div className="mt-4 flex flex-col gap-2">
        <label
          htmlFor="policy-notification-title"
          className={cn("text-body font-medium text-label", !enabled && "text-subtle")}
        >
          {notification.titleLabel}
        </label>
        <AppInput
          id="policy-notification-title"
          {...register("notification.title")}
          disabled={!enabled}
          aria-invalid={Boolean(errors.notification?.title)}
          aria-describedby={errors.notification?.title ? titleErrorId : undefined}
          className={cn(!enabled && "opacity-50")}
        />
        {errors.notification?.title ? (
          <FieldError id={titleErrorId}>{errors.notification.title.message}</FieldError>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <label
          htmlFor="policy-notification-message"
          className={cn("text-body font-medium text-label", !enabled && "text-subtle")}
        >
          {notification.messageLabel}
        </label>
        <textarea
          id="policy-notification-message"
          rows={3}
          {...register("notification.message")}
          disabled={!enabled}
          aria-invalid={Boolean(errors.notification?.message)}
          aria-describedby={errors.notification?.message ? messageErrorId : undefined}
          className={cn(
            "w-full rounded-app border border-hair-strong bg-chrome px-3.5 py-2.5 text-app text-strong outline-none placeholder:text-subtle focus:border-brand-accent",
            !enabled && "opacity-50",
          )}
        />
        {errors.notification?.message ? (
          <FieldError id={messageErrorId}>{errors.notification.message.message}</FieldError>
        ) : null}
      </div>
    </section>
  );
}
