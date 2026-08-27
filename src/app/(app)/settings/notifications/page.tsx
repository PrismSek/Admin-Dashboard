import type { Metadata } from "next";

import { Banner } from "@/components/app/banner";
import { Card } from "@/components/app/card";
import { PageBody, PageHeader, SectionHeading } from "@/components/app/page-header";
import { Pill } from "@/components/app/pill";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getAlertCategories, getRecipients } from "@/features/settings/data";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsSettingsPage() {
  const [recipients, categories] = await Promise.all([getRecipients(), getAlertCategories()]);
  const failing = recipients.find((recipient) => recipient.delivery === "failing");

  return (
    <PageBody className="max-w-5xl">
      <PageHeader
        title="Notifications"
        description="Administrative alerts about this organization. Delivered by email to the administrators you select."
        action={
          <Button variant="appPrimary" size="app" width="auto" type="button">
            Save
          </Button>
        }
      />

      {failing ? (
        <Banner
          className="mt-8"
          tone="info"
          icon={false}
          title={`Email to ${failing.email} is failing`}
          description="Six delivery attempts since 2 Aug. Alerts are still reaching other recipients."
          action={
            <Button variant="appSecondary" size="app" width="auto" type="button">
              Review recipient
            </Button>
          }
        />
      ) : null}

      <section className="mt-10">
        <SectionHeading>Recipients</SectionHeading>
        <p className="mt-1.5 text-meta text-dim">
          Active Org Owners and Policy Admins only. At least one recipient is required.
        </p>

        <Card className="mt-4 divide-y divide-hair">
          {recipients.map((recipient) => (
            <div key={recipient.id} className="flex items-center gap-4 px-5 py-4">
              <Checkbox id={recipient.id} defaultChecked={recipient.selected} />
              <label htmlFor={recipient.id} className="min-w-0 flex-1 cursor-pointer">
                <span className="block text-app font-medium text-strong">{recipient.name}</span>
                <span className="mt-0.5 block text-meta text-subtle">
                  {recipient.email} · {recipient.role}
                </span>
              </label>
              {recipient.delivery === "failing" ? (
                <Pill tone="info">Failing</Pill>
              ) : (
                <span className="text-meta text-dim">Delivering</span>
              )}
            </div>
          ))}
        </Card>
      </section>

      <section className="mt-10">
        <SectionHeading>Alert categories</SectionHeading>
        <p className="mt-1.5 text-meta text-dim">
          Critical alerts are always sent. You choose whether to receive the non-critical
          updates in each group.
        </p>

        <Card className="mt-4 divide-y divide-hair">
          {categories.map((category) => (
            <div key={category.id} className="flex items-start justify-between gap-6 px-5 py-5">
              <div className="min-w-0">
                <h3 className="text-app font-semibold text-strong">{category.title}</h3>
                <p className="mt-1 text-meta text-dim">{category.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill tone="info">{category.criticalLabel}</Pill>
                  <Pill tone="info">{category.examples}</Pill>
                </div>
              </div>

              <label className="flex shrink-0 cursor-pointer items-center gap-2.5">
                <Checkbox defaultChecked={category.additionalUpdates} />
                <span className="text-meta text-strong">Additional updates</span>
              </label>
            </div>
          ))}
        </Card>
      </section>

      <p className="mt-6 text-meta text-subtle">
        Email is the only delivery channel in V1. Personal notification preferences are out of
        scope for Profile V1.
      </p>
    </PageBody>
  );
}
