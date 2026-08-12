import type { Metadata } from "next";

import { Banner } from "@/components/app/banner";
import { Card, CardSection } from "@/components/app/card";
import { ReadOnlyField } from "@/components/app/field";
import { PageBody, PageHeader } from "@/components/app/page-header";
import { Pill } from "@/components/app/pill";
import { Toggle, ToggleRow } from "@/components/app/toggle";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { getOrganization } from "@/features/app-shell/data";
import { getSsoConfig } from "@/features/settings/data";

export const metadata: Metadata = { title: "Authentication / SSO" };

export default async function SsoSettingsPage() {
  const [organization, sso] = await Promise.all([getOrganization(), getSsoConfig()]);

  return (
    <PageBody className="max-w-5xl">
      <PageHeader
        title="Authentication / SSO"
        description={`Configure authentication methods and single sign-on for ${organization.name}.`}
      />

      <div className="mt-8 flex flex-col gap-5">
        <Card className="divide-y divide-hair">
          <ToggleRow
            id="password-sign-in"
            title="Password sign-in"
            description="Allow users to sign in with email and password."
            defaultChecked={sso.passwordSignInEnabled}
            className="p-6"
          />
          <ToggleRow
            id="require-mfa"
            title="Require multi-factor authentication"
            description="Applies to all members without an active SSO session."
            defaultChecked={sso.mfaRequired}
            className="p-6"
          />
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-6 p-6 pb-0">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-section font-medium text-strong">Single sign-on</h2>
                {sso.connected ? <Pill tone="ok">Connected</Pill> : <Pill>Not connected</Pill>}
              </div>
              <p className="mt-1 text-meta text-dim">
                {`${organization.name.split(" ")[0]} ${sso.provider} · ${sso.protocol}`}
              </p>
            </div>
            <Link
              href="/settings/sso/setup"
              className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
            >
              Edit configuration
            </Link>
          </div>

          <div className="p-6">
            <Banner
              tone="warn"
              title={`Signing certificate expires in ${sso.certificateDaysLeft} days (${sso.certificateExpiresOn}). Sign-in will fail for everyone once it expires.`}
            />

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <ReadOnlyField label="Identity provider" value={sso.provider} />
              <ReadOnlyField label="Protocol" value={sso.protocol} />
              <ReadOnlyField label="Entity ID" value={sso.entityId} />
              <ReadOnlyField label="ACS URL" value={sso.acsUrl} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="appPrimary" size="app" width="auto" type="button">
                Renew Certificate
              </Button>
              <Button variant="appSecondary" size="app" width="auto" type="button">
                Test Connection
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <CardSection
            title="Enforce SSO for all members"
            description={`When enabled, password sign-in is disabled and everyone must authenticate through ${organization.name.split(" ")[0]} ${sso.provider}.`}
          >
            {/* Enabling this can lock every administrator out if the IdP is
                misconfigured — the API call must verify a working test
                connection first. */}
            <div className="flex items-center gap-3">
              <Toggle id="enforce-sso" defaultChecked={sso.enforceSso} />
              <label htmlFor="enforce-sso" className="text-app text-strong">
                {sso.enforceSso ? "Enabled" : "Disabled"}
              </label>
            </div>
          </CardSection>
        </Card>
      </div>
    </PageBody>
  );
}
