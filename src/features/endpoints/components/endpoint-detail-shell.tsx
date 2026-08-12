import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { PageBody } from "@/components/app/page-header";
import { Tabs } from "@/components/app/tabs";
import type { Endpoint } from "@/features/endpoints/data";

/**
 * Shared header for the endpoint detail tabs, so Overview and Deployment
 * cannot drift apart.
 */
export function EndpointDetailShell({
  endpoint,
  tab,
  children,
}: {
  endpoint: Endpoint;
  tab: "overview" | "deployment";
  children: ReactNode;
}) {
  return (
    <PageBody>
      <Link
        href="/endpoints"
        className="inline-flex items-center gap-1.5 text-meta text-dim hover:text-strong"
      >
        <ChevronLeft aria-hidden className="size-4" />
        Back to endpoints
      </Link>

      <div className="mt-4">
        <h1 className="text-page-title text-strong">{endpoint.name}</h1>
        <p className="mt-1 text-app text-subtle">{endpoint.deviceId}</p>
      </div>

      <Tabs
        className="mt-6"
        items={[
          {
            label: "Overview",
            href: `/endpoints/${endpoint.id}`,
            active: tab === "overview",
          },
          {
            label: "Deployment",
            href: `/endpoints/${endpoint.id}/deployment`,
            active: tab === "deployment",
          },
        ]}
      />

      <div className="mt-6">{children}</div>
    </PageBody>
  );
}
