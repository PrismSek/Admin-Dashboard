import { ImageIcon } from "lucide-react";
import type { Metadata } from "next";

import { Card, CardSection } from "@/components/app/card";
import { AppField, AppInput, AppSelect } from "@/components/app/field";
import { PageBody, PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { getOrganization } from "@/features/app-shell/data";

export const metadata: Metadata = { title: "Organization" };

const timezones = [
  "UTC (Coordinated Universal Time)",
  "Europe/London",
  "America/New_York",
  "Asia/Kolkata",
];
const languages = ["English (US)", "English (UK)", "Deutsch", "Français"];

export default async function OrganizationSettingsPage() {
  const organization = await getOrganization();

  return (
    <PageBody className="max-w-5xl">
      <PageHeader
        title="Organization"
        description="Organization name, logo, Tenant ID, and tenant-wide time defaults."
      />

      <div className="mt-8 flex flex-col gap-5">
        <Card>
          <CardSection
            title="Identity"
            description={`How ${organization.name} appears across PrismSek`}
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="flex size-24 flex-col items-center justify-center gap-1.5 rounded-app border border-dashed border-hair-strong text-dim transition-colors hover:bg-hover"
                >
                  <ImageIcon aria-hidden className="size-5" />
                  <span className="text-micro">Upload logo</span>
                </button>
                <p className="text-meta text-dim">PNG or SVG, up to 2MB</p>
              </div>

              <AppField
                id="display-name"
                label="Display name"
                hint="Shown in emails, sign-in pages, and reports."
                className="max-w-md"
              >
                <AppInput
                  id="display-name"
                  defaultValue={organization.displayName ?? ""}
                  placeholder="Not set"
                />
              </AppField>

              <AppField id="legal-name" label="Legal entity name" className="max-w-md">
                <AppInput id="legal-name" defaultValue={organization.legalName} />
              </AppField>

              <Button variant="appPrimary" size="app" width="auto" type="button" className="self-start">
                Save Changes
              </Button>
            </div>
          </CardSection>
        </Card>

        <Card>
          <CardSection
            title="Tenant details"
            description="Reference identifiers for support and API integrations"
          >
            <div className="flex items-center justify-between gap-4 rounded-app border border-hair bg-hover px-4 py-3">
              <div className="min-w-0">
                <p className="text-meta text-dim">Tenant ID</p>
                <p className="mt-0.5 truncate text-app text-strong">{organization.tenantId}</p>
              </div>
              <button
                type="button"
                className="shrink-0 text-meta font-medium text-link hover:underline"
              >
                Copy
              </button>
            </div>
          </CardSection>
        </Card>

        <Card>
          <CardSection
            title="Regional defaults"
            description="Applied to new users unless overridden individually"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <AppField id="timezone" label="Default timezone">
                <AppSelect id="timezone" defaultValue={organization.timezone}>
                  {timezones.map((zone) => (
                    <option key={zone}>{zone}</option>
                  ))}
                </AppSelect>
              </AppField>

              <AppField id="language" label="Default language">
                <AppSelect id="language" defaultValue={organization.language}>
                  {languages.map((language) => (
                    <option key={language}>{language}</option>
                  ))}
                </AppSelect>
              </AppField>
            </div>
          </CardSection>
        </Card>

        <Card tone="destructive">
          <CardSection
            tone="destructive"
            title="Danger zone"
            description="Deleting the organization removes all data permanently. This cannot be undone."
          >
            {/* Destructive and irreversible — this must open a typed-confirmation
                dialog before it ever calls the API. */}
            <Button variant="destructive" size="app" width="auto" type="button">
              Delete Organization
            </Button>
          </CardSection>
        </Card>
      </div>
    </PageBody>
  );
}
