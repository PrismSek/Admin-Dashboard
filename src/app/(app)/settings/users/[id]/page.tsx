import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardSection } from "@/components/app/card";
import { ReadOnlyField } from "@/components/app/field";
import { PageBody, PageHeader } from "@/components/app/page-header";
import { Pill } from "@/components/app/pill";
import { buttonVariants } from "@/components/ui/button";
import { getUser } from "@/features/settings/data";

export const metadata: Metadata = { title: "User details" };

const statusTone = { active: "ok", suspended: "neutral", pending: "warn" } as const;
const statusLabel = { active: "Active", suspended: "Suspended", pending: "Pending" } as const;

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) notFound();

  return (
    <PageBody className="max-w-4xl">
      <Link
        href="/settings/users"
        className="inline-flex items-center gap-1.5 text-meta text-dim hover:text-strong"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Users and Access
      </Link>

      <PageHeader
        className="mt-4"
        title={user.name}
        description={user.email}
        action={
          <div className="flex gap-3">
            <Link
              href={`/settings/users?dialog=suspend&user=${user.id}`}
              className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
            >
              Suspend user
            </Link>
            <Link
              href={`/settings/users?dialog=delete&user=${user.id}`}
              className={buttonVariants({ variant: "destructive", size: "app", width: "auto" })}
            >
              Delete user
            </Link>
          </div>
        }
      />

      <div className="mt-8 flex flex-col gap-5">
        <Card>
          <CardSection title="Account" description="Role and current access status.">
            <div className="grid gap-6 sm:grid-cols-2">
              <ReadOnlyField label="Role" value={user.role} />
              <ReadOnlyField
                label="Status"
                value={<Pill tone={statusTone[user.status]}>{statusLabel[user.status]}</Pill>}
              />
              <ReadOnlyField label="Email" value={user.email} />
              <ReadOnlyField label="User ID" value={user.id} />
            </div>
          </CardSection>
        </Card>

        <Card>
          <CardSection
            title="Access history"
            description="Recent sign-in activity for this account."
          >
            {/* Populated from the audit API. Deliberately not faked with
                plausible-looking sign-in records — invented security history is
                worse than an empty state. */}
            <p className="text-meta text-dim">
              Sign-in history appears here once the audit API is connected.
            </p>
          </CardSection>
        </Card>
      </div>
    </PageBody>
  );
}
