import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Card } from "@/components/app/card";
import { EndpointDetailShell } from "@/features/endpoints/components/endpoint-detail-shell";
import { getBrowserCoverage, getEndpoint } from "@/features/endpoints/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Endpoint security" };

export default async function EndpointSecurityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [endpoint, browsers] = await Promise.all([getEndpoint(id), getBrowserCoverage()]);

  if (!endpoint) notFound();

  const uncovered = browsers.flatMap((b) => b.profiles).filter((p) => !p.covered).length;

  return (
    <EndpointDetailShell endpoint={endpoint} tab="security">
      <h2 className="text-app font-semibold text-strong">
        {browsers.length} of {browsers.length} supported browsers actively covered
        {uncovered > 0 ? ` · ${uncovered} profile not covered` : ""}
      </h2>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {browsers.map((browser) => (
          <Card key={browser.browser} className="p-5">
            <p className="text-app font-medium text-copy">{browser.browser}</p>
            <p className="mt-3 text-app font-medium text-state-ok">{browser.status}</p>
            <p className="mt-1.5 text-meta text-dim">{browser.summary}</p>
            <p className="mt-2 text-meta text-subtle">{browser.version}</p>

            <div className="mt-4 border-t border-hair pt-4">
              <p className="text-meta text-dim">
                Profiles · {browser.profiles.length}{" "}
                {browser.profiles.length === 1 ? "profile" : "profiles"}
              </p>
              <ul className="mt-2 flex flex-col gap-2.5">
                {browser.profiles.map((profile) => (
                  <li key={profile.name}>
                    <p className="flex items-center gap-2 text-meta text-strong">
                      <span
                        aria-hidden
                        className={cn(
                          "size-2.5 shrink-0 rounded-[2px]",
                          profile.covered ? "bg-state-ok" : "border border-hair-strong bg-transparent",
                        )}
                      />
                      <span className="font-medium">{profile.name}</span>
                      <span className="text-dim">— {profile.covered ? "Covered" : "Not covered"}</span>
                    </p>
                    <p className="mt-0.5 pl-4.5 text-meta text-subtle">{profile.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </EndpointDetailShell>
  );
}
