import { Copy, Info, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Modal } from "@/components/app/modal";
import { Button, buttonVariants } from "@/components/ui/button";
import { EndpointDetailShell } from "@/features/endpoints/components/endpoint-detail-shell";
import {
  getEndpoint,
  getRecentActivity,
  type ActivityEvent,
  type Endpoint,
} from "@/features/endpoints/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Endpoint overview" };

const reporting: Record<Endpoint["protection"], { label: string; tone: string }> = {
  protected: { label: "Reporting normally", tone: "bg-state-ok" },
  attention: { label: "Reporting with warnings", tone: "bg-state-warn" },
  unknown: { label: "Not reporting", tone: "bg-state-unknown" },
};

export default async function EndpointOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dialog?: string }>;
}) {
  const [{ id }, { dialog }] = await Promise.all([params, searchParams]);
  const [endpoint, activity] = await Promise.all([getEndpoint(id), getRecentActivity(id)]);

  if (!endpoint) notFound();

  const report = reporting[endpoint.protection];

  return (
    <EndpointDetailShell endpoint={endpoint} tab="overview">
      <div className="grid gap-5 lg:grid-cols-3">
        <DetailCard title="System">
          <Row label="Endpoint type" value={endpoint.endpointType} />
          <Row label="Operating system" value={endpoint.os.version} />
          <Row label="Agent version" value={endpoint.os.agentVersion} />
          <Row
            label="Device identifier"
            value={
              <span className="inline-flex items-center gap-2">
                {endpoint.deviceId}
                <button
                  type="button"
                  aria-label="Copy device identifier"
                  className="text-subtle transition-colors hover:text-copy"
                >
                  <Copy aria-hidden className="size-4" />
                </button>
              </span>
            }
          />
        </DetailCard>

        <DetailCard title="Management">
          <Row
            label="Assigned user"
            value={
              endpoint.assignedUser ? (
                <span className="text-brand">{endpoint.assignedUser}</span>
              ) : (
                <span className="text-subtle">Unassigned</span>
              )
            }
          />
          <Row label="Groups" value={endpoint.groups.join(", ")} />
          <Row label="Directory domain" value={endpoint.directoryDomain} />
          <Row label="Deployment state" value={<Dotted tone="bg-state-ok" label={endpoint.deploymentState} />} />
        </DetailCard>

        <DetailCard title="Connectivity">
          <Row label="Last seen" value={endpoint.lastSeen} />
          <Row label="Reporting state" value={<Dotted tone={report.tone} label={report.label} />} />
          <Row label="IP address" value={endpoint.ipAddress} />
          <Row label="Channel" value={endpoint.channel} />
        </DetailCard>
      </div>

      <div className="mt-5 rounded-card border border-hair-strong bg-chrome p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-app-heading font-normal text-strong">Recent activity</h2>
          <Link href="#" className="text-meta font-medium text-brand hover:text-brand-hover">
            View all activity
          </Link>
        </div>
        <ul className="mt-4 flex flex-col">
          {activity.map((event) => (
            <ActivityRow key={event.title} event={event} />
          ))}
        </ul>
      </div>

      {dialog === "isolate" ? (
        <Modal
          title={`Isolate ${endpoint.name}?`}
          description="The endpoint stays powered on, but its network access is cut to everything except PrismSek. In-progress transfers are stopped. You can release it at any time."
          closeHref={`/endpoints/${endpoint.id}`}
          footer={
            <>
              <Link
                href={`/endpoints/${endpoint.id}`}
                className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
              >
                Cancel
              </Link>
              <Button variant="appPrimary" size="app" width="auto" type="button">
                Isolate endpoint
              </Button>
            </>
          }
        />
      ) : null}
    </EndpointDetailShell>
  );
}

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-card border border-hair-strong bg-chrome">
      <p className="border-b border-hair px-6 py-4 text-meta text-dim">{title}</p>
      <dl className="flex flex-col gap-3.5 px-6 py-5">{children}</dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <dt className="w-36 shrink-0 text-meta text-dim">{label}</dt>
      <dd className="min-w-0 text-app text-strong">{value}</dd>
    </div>
  );
}

function Dotted({ tone, label }: { tone: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className={cn("size-1.5 rounded-full", tone)} />
      {label}
    </span>
  );
}

function ActivityRow({ event }: { event: ActivityEvent }) {
  const Icon = event.kind === "protection" ? ShieldCheck : Info;
  return (
    <li className="flex items-start gap-3 border-t border-hair py-4 first:border-t-0 first:pt-0">
      <Icon
        aria-hidden
        className={cn(
          "mt-0.5 size-4 shrink-0",
          event.kind === "protection" ? "text-state-ok" : "text-subtle-alt",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-app text-strong">{event.title}</p>
        <p className="mt-0.5 text-meta text-dim">{event.detail}</p>
      </div>
      <p className="shrink-0 text-meta text-subtle">{event.time}</p>
    </li>
  );
}
