import { LayoutDashboard } from "lucide-react";
import type { Metadata } from "next";

import { PageBody, PageHeader } from "@/components/app/page-header";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Dashboard landing page. There is no Dashboard frame in the Figma file yet,
 * so this is an intentional placeholder (owner sign-off 2026-09-14) that keeps
 * the sidebar's Dashboard route from 404-ing. Replace the body with the real
 * overview once the design exists.
 */
export default function DashboardPage() {
  return (
    <PageBody>
      <PageHeader title="Dashboard" />

      <div className="mt-6 flex flex-col items-center justify-center gap-4 rounded-app border border-dashed border-hair-strong bg-chrome px-6 py-20 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-hover text-dim">
          <LayoutDashboard aria-hidden className="size-7" />
        </span>
        <div className="max-w-md">
          <p className="text-app-heading font-normal text-strong">Your overview is coming soon</p>
          <p className="mt-2 text-meta text-dim">
            The dashboard isn&apos;t designed yet. In the meantime, jump to Policies, Issues or
            Manage from the sidebar to get to work.
          </p>
        </div>
      </div>
    </PageBody>
  );
}
