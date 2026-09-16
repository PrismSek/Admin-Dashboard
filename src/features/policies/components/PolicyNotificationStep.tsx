"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";

import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { RowConnector, SectionChip } from "@/features/policies/components/conditions-ui";
import { PolicySelect } from "@/features/policies/components/PolicySelect";
import { policyBuilderContent, policyBuilderSteps } from "@/features/policies/content";
import { composeNotificationReadsAs } from "@/features/policies/reads-as";
import type { PolicyAuthoringValues } from "@/features/policies/schemas";
import { cn } from "@/lib/utils";

const notification = policyBuilderContent.notification;

/**
 * "End-user notification" (rail step 6) — rebuilt to the artifact's design and
 * logic: a delivery-channel pill ("Tell the team via" → none / Slack / Teams /
 * Email / Endpoint) and a "When issue is detected" remediation radio group
 * (None / Engage assignee / Remove public link / Apply label), each card
 * carrying the integrations it touches. A live "Reads as —" line restates the
 * choice. Backed by the schema's `notification: { channel, remediation }`.
 */
export function PolicyNotificationStep() {
  const { control } = useFormContext<PolicyAuthoringValues>();

  const channel = useWatch<PolicyAuthoringValues, "notification.channel">({ control, name: "notification.channel" });
  const remediation = useWatch<PolicyAuthoringValues, "notification.remediation">({
    control,
    name: "notification.remediation",
  });
  const reasonCode = useWatch<PolicyAuthoringValues, "enforcement.reasonCode">({ control, name: "enforcement.reasonCode" });

  const channelNote = notification.channels.find((option) => option.value === channel)?.note ?? "";
  const sentence = composeNotificationReadsAs({ remediation, channel, reasonCode: reasonCode ?? "" });

  return (
    <section id="policy-notification" aria-label={policyBuilderSteps[5].title} className="mt-8">
      <h2 className="text-section font-medium text-strong">{notification.title}</h2>
      <p className="mt-1 max-w-md text-meta text-dim">{notification.help}</p>

      <div className="mt-4 flex flex-col gap-5 rounded-card border border-hair-strong bg-chrome p-4">
        <div className="flex flex-col items-start gap-3">
          <SectionChip>{notification.channelChip}</SectionChip>
          <div className="flex items-start gap-2">
            <RowConnector />
            <div className="flex min-w-0 flex-col gap-2">
              <Controller
                name="notification.channel"
                control={control}
                render={({ field }) => (
                  <PolicySelect
                    pill
                    id="policy-notification-channel"
                    label={notification.channelLabel}
                    value={field.value}
                    onChange={field.onChange}
                    options={notification.channels}
                  />
                )}
              />
              <p className="max-w-md text-meta text-dim">{channelNote}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3">
          <SectionChip>{notification.triggerChip}</SectionChip>
          <Controller
            name="notification.remediation"
            control={control}
            render={({ field }) => (
              <div role="radiogroup" aria-label={notification.remediationGroupLabel} className="flex w-full flex-col gap-2">
                {notification.remediations.map((option) => (
                  <RemediationCard
                    key={option.value}
                    icon={option.icon}
                    label={option.label}
                    description={option.description}
                    badges={option.badges}
                    selected={field.value === option.value}
                    onSelect={() => field.onChange(option.value)}
                  />
                ))}
              </div>
            )}
          />
        </div>
      </div>

      <p className="mt-3 max-w-2xl text-meta text-dim">
        <span className="text-subtle">{notification.readsAsPrefix}</span> {sentence}
      </p>
    </section>
  );
}

/** One "When issue is detected" remediation choice: a radio, then a bordered
 * card (brand outline when selected) holding the glyph, label + description, and
 * the integrations it touches. */
function RemediationCard({
  icon,
  label,
  description,
  badges,
  selected,
  onSelect,
}: {
  icon: AppIconName;
  label: string;
  description: string;
  badges: readonly string[];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="radio"
        name="policy-notification-remediation"
        aria-label={label}
        checked={selected}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-full border peer-focus-visible:ring-2 peer-focus-visible:ring-brand-accent",
          selected ? "border-brand" : "border-hair-strong",
        )}
      >
        {selected ? <span className="size-2 rounded-full bg-brand" /> : null}
      </span>
      <span
        className={cn(
          "flex flex-1 items-center gap-3.5 rounded-card border bg-chrome px-3.5 py-3",
          selected ? "border-brand" : "border-hair-strong",
        )}
      >
        <AppIcon name={icon} className={cn("size-5 shrink-0", selected ? "text-brand" : "text-dim")} />
        <span className="flex min-w-0 flex-col">
          <span className="text-app text-strong">{label}</span>
          <span className="text-meta text-dim">{description}</span>
        </span>
        {badges.length > 0 ? (
          <span className="ml-auto flex flex-wrap justify-end gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center rounded-app border border-hair-strong bg-chrome px-2 py-0.5 text-micro text-copy"
              >
                {badge}
              </span>
            ))}
          </span>
        ) : null}
      </span>
    </label>
  );
}
