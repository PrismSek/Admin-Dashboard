import { ArrowLeft, ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { getManageUser, memberStatusLabel, type MemberStatus } from "@/features/manage/users";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const user = await getManageUser((await params).id);
  return { title: user ? user.name : "User" };
}

/**
 * Manage → Users & Groups detail (frame 388:7355). A full-page route, like the
 * sibling endpoint detail — the frame carries a breadcrumb and back control,
 * not a drawer over the list. The header sits on a white band; the User
 * information card renders on the canvas below.
 */
export default async function ManageUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getManageUser(id);
  if (!user) notFound();

  const endpointsHref = `/endpoints?q=${encodeURIComponent(user.email)}`;

  return (
    <div>
      <div className="bg-chrome px-12 pt-8 pb-6">
        <Link
          href="/manage/users"
          className="inline-flex items-center gap-1.5 text-meta text-dim hover:text-strong"
        >
          <ChevronLeft aria-hidden className="size-4" />
          Users &amp; Groups
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/manage/users"
              aria-label="Back to Users & Groups"
              className="flex size-12 shrink-0 items-center justify-center rounded-app border border-hair-strong bg-canvas text-dim transition-colors hover:bg-hover"
            >
              <ArrowLeft aria-hidden className="size-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-page-title font-normal text-strong">{user.name}</h1>
                <StatusPill status={user.status} />
              </div>
              <p className="mt-1 text-meta text-dim">
                {user.email} · {user.role}
              </p>
            </div>
          </div>

          {user.status === "active" ? (
            <button
              type="button"
              className={buttonVariants({ variant: "appDanger", size: "app", width: "auto" })}
            >
              Suspend account
            </button>
          ) : null}
        </div>
      </div>

      <div className="px-12 py-8">
        <section className="overflow-hidden rounded-card border border-hair-strong bg-chrome">
          <h2 className="border-b border-hair px-5 py-4 text-section font-medium text-strong">
            User information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <dl className="md:border-r md:border-hair">
              <InfoRow label="Full name" value={user.name} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Role" value={user.role} />
              <InfoRow label="Department" value={user.departmentLabel} />
            </dl>
            <dl>
              <InfoRow label="Account status" value={memberStatusLabel[user.status]} />
              <InfoRow label="Groups" value={user.groups.join(", ")} />
              <InfoRow label="Directory source" value={user.directorySource} />
              <InfoRow
                label="Assigned endpoints"
                value={
                  user.assignedEndpoints > 0 ? (
                    <Link href={endpointsHref} className="text-brand hover:text-brand-hover">
                      {user.assignedEndpoints} endpoint{user.assignedEndpoints === 1 ? "" : "s"} —
                      view endpoints
                    </Link>
                  ) : (
                    <span className="text-dim">No endpoints</span>
                  )
                }
              />
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline gap-4 px-5 py-3">
      <dt className="w-40 shrink-0 text-meta text-dim">{label}</dt>
      <dd className="min-w-0 text-app text-strong">{value}</dd>
    </div>
  );
}

const statusPill: Record<MemberStatus, { className: string; dot: string }> = {
  active: { className: "bg-pill-ok-bg text-pill-ok-fg", dot: "bg-state-ok" },
  invited: { className: "bg-pill-warn-bg text-pill-warn-fg", dot: "bg-state-warn" },
  suspended: { className: "bg-pill-neutral-bg text-pill-neutral-fg", dot: "bg-state-unknown" },
};

function StatusPill({ status }: { status: MemberStatus }) {
  const tone = statusPill[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-micro font-medium",
        tone.className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", tone.dot)} />
      {memberStatusLabel[status]}
    </span>
  );
}
