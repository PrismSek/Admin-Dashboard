import { Bell, Building2, ChevronRight, Mail, Shield, TriangleAlert, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Card } from "@/components/app/card";
import { PageBody, PageHeader, SectionHeading } from "@/components/app/page-header";
import { Pill } from "@/components/app/pill";
import { getOrganization } from "@/features/app-shell/data";
import {
  getAttentionItems,
  getSettingsCategories,
  type AttentionItem,
  type SettingsCategory,
} from "@/features/settings/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Settings Overview" };

const attentionIcons = { sso: TriangleAlert, invite: Mail, bell: Bell } as const;
const categoryIcons = { building: Building2, users: Users, shield: Shield, bell: Bell } as const;

/**
 * Server Component. Organization, attention items and categories are all
 * fetched on the server and streamed as HTML — no client data fetching.
 */
export default async function SettingsOverviewPage() {
  const [organization, attention, categories] = await Promise.all([
    getOrganization(),
    getAttentionItems(),
    getSettingsCategories(),
  ]);

  return (
    <PageBody>
      <PageHeader
        title="Settings Overview"
        description={`Manage ${organization.name} — organization identity, people, authentication, and administrative alerts.`}
      />

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <SectionHeading>Needs attention</SectionHeading>
          <Link href="/settings/notifications" className="text-meta text-link hover:underline">
            View all ({attention.length + 3})
          </Link>
        </div>

        <Card className="mt-4 divide-y divide-hair">
          {attention.map((item) => (
            <AttentionRow key={item.id} item={item} />
          ))}
        </Card>
      </section>

      <section className="mt-10">
        <SectionHeading>Settings categories</SectionHeading>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {categories.map((category) => (
            <CategoryCard key={category.href} category={category} />
          ))}
        </div>
      </section>
    </PageBody>
  );
}

function AttentionRow({ item }: { item: AttentionItem }) {
  const Icon = attentionIcons[item.icon];

  return (
    <div className="flex items-start gap-4 p-5">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-app [&_svg]:size-[18px]",
          item.tag.tone === "warn" && "bg-pill-warn-bg text-pill-warn-fg",
          item.tag.tone === "info" && "bg-pill-info-bg text-pill-info-fg",
          item.tag.tone === "neutral" && "bg-pill-neutral-bg text-pill-neutral-fg",
        )}
      >
        <Icon aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-app font-semibold text-strong">{item.title}</p>
          <Pill tone={item.tag.tone === "neutral" ? "neutral" : item.tag.tone}>
            {item.tag.label}
          </Pill>
        </div>
        <p className="mt-1 text-meta text-dim">{item.description}</p>
      </div>

      <Link
        href={item.href}
        className={cn(
          "flex shrink-0 items-center gap-1 text-meta font-semibold hover:underline",
          item.emphasis === "brand" ? "text-brand-accent" : "text-link",
        )}
      >
        {item.actionLabel}
        <ChevronRight aria-hidden className="size-4" />
      </Link>
    </div>
  );
}

function CategoryCard({ category }: { category: SettingsCategory }) {
  const Icon = categoryIcons[category.icon];

  return (
    <Card className="flex flex-col p-6">
      <Icon aria-hidden className="size-5 text-copy" />
      <h3 className="mt-4 text-section font-medium text-strong">{category.title}</h3>
      <p className="mt-1.5 text-meta text-dim">{category.description}</p>
      <p
        className={cn(
          "mt-4 text-meta",
          category.statusTone === "ok" ? "text-state-ok" : "text-dim",
        )}
      >
        {category.status}
      </p>
      <Link
        href={category.href}
        className="mt-6 inline-flex items-center gap-1 text-meta font-semibold text-brand-accent hover:underline"
      >
        Open
        <ChevronRight aria-hidden className="size-4" />
      </Link>
    </Card>
  );
}
