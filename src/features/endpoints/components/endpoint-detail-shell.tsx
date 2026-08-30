import { ChevronLeft, Laptop, Monitor, Server } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Tabs } from "@/components/app/tabs";
import { Button } from "@/components/ui/button";
import type { Endpoint } from "@/features/endpoints/data";
import { cn } from "@/lib/utils";

/**
 * Shared header for the endpoint detail tabs (Overview / Security / Deployment),
 * so they cannot drift apart. The header sits on a white band; each tab renders
 * its content on the canvas below.
 */
export function EndpointDetailShell({
  endpoint,
  tab,
  children,
}: {
  endpoint: Endpoint;
  tab: "overview" | "security" | "deployment";
  children: ReactNode;
}) {
  const DeviceIcon =
    endpoint.endpointType === "Server"
      ? Server
      : endpoint.endpointType === "Laptop"
        ? Laptop
        : Monitor;

  return (
    <div>
      <div className="bg-chrome px-12 pt-8">
        <Link
          href="/endpoints"
          className="inline-flex items-center gap-1.5 text-meta text-dim hover:text-strong"
        >
          <ChevronLeft aria-hidden className="size-4" />
          All Endpoints
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-app border border-hair-strong bg-canvas text-dim">
              <DeviceIcon aria-hidden className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-page-title text-strong">{endpoint.name}</h1>
                <StatusPill online={endpoint.online} />
              </div>
              <p className="mt-1 text-meta text-dim">
                {endpoint.deviceId} · {endpoint.endpointType} · {endpoint.os.version}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="appSecondary" size="app" width="auto" type="button">
              Force check-in
            </Button>
            <Link
              href={`/endpoints/${endpoint.id}?dialog=isolate`}
              className="inline-flex h-9 items-center rounded-app border border-brand bg-chrome px-3.5 text-meta font-semibold text-brand transition-colors hover:bg-brand-halo"
            >
              Isolate endpoint
            </Link>
          </div>
        </div>

        <Tabs
          className="mt-6 border-b-0"
          items={[
            { label: "Overview", href: `/endpoints/${endpoint.id}`, active: tab === "overview" },
            { label: "Security", href: `/endpoints/${endpoint.id}/security`, active: tab === "security" },
            { label: "Deployment", href: `/endpoints/${endpoint.id}/deployment`, active: tab === "deployment" },
          ]}
        />
      </div>

      <div className="px-12 py-8">{children}</div>
    </div>
  );
}

function StatusPill({ online }: { online: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-micro font-medium",
        online ? "bg-pill-ok-bg text-pill-ok-fg" : "bg-pill-neutral-bg text-pill-neutral-fg",
      )}
    >
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full", online ? "bg-state-ok" : "bg-state-unknown")}
      />
      {online ? "Active" : "Offline"}
    </span>
  );
}
