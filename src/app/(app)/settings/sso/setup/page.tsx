import { Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Card } from "@/components/app/card";
import { AppField, AppInput, ReadOnlyField } from "@/components/app/field";
import { PageBody } from "@/components/app/page-header";
import { Toggle } from "@/components/app/toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { getOrganization } from "@/features/app-shell/data";
import { SsoActivateDialog } from "@/features/settings/components/sso-activate-dialog";
import { getSsoConfig } from "@/features/settings/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Set up SAML single sign-on" };

const STEPS = [
  "PrismSek details",
  "IdP metadata",
  "Connection test",
  "Review and activate",
] as const;

const BASE = "/settings/sso/setup";

/**
 * SAML setup wizard.
 *
 * The current step is `?step=1..4` rather than component state, so each step is
 * server-rendered, the browser Back button works, and a half-finished setup can
 * be resumed from a link — which is exactly what the design's "Your progress is
 * saved" promise implies.
 */
export default async function SsoSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; dialog?: string }>;
}) {
  const [{ step: rawStep, dialog }, sso, org] = await Promise.all([
    searchParams,
    getSsoConfig(),
    getOrganization(),
  ]);
  const step = Math.min(4, Math.max(1, Number(rawStep) || 1));

  return (
    <PageBody className="max-w-5xl">
      <Link
        href="/settings/sso"
        className="text-meta font-medium text-brand-accent hover:underline"
      >
        ‹ Authentication / SSO
      </Link>

      <h1 className="mt-4 text-page-title text-strong">Set up SAML single sign-on</h1>
      <p className="mt-2 text-meta text-dim">
        Your progress is saved. You can leave and resume this setup at any time.
      </p>

      {/* Steps are links, not buttons: completed steps stay reachable. */}
      <ol className="mt-8 grid overflow-hidden rounded-app border border-hair-strong bg-chrome md:grid-cols-4">
        {STEPS.map((label, index) => {
          const number = index + 1;
          const isCurrent = number === step;
          const isDone = number < step;

          return (
            <li key={label} className={cn(index > 0 && "md:border-l md:border-hair-strong")}>
              <Link
                href={`${BASE}?step=${number}`}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex items-center gap-3 px-5 py-4 transition-colors",
                  isCurrent ? "bg-pill-info-bg/50" : "hover:bg-hover",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-[5px] border text-micro font-medium",
                    isDone && "border-state-ok text-state-ok",
                    isCurrent && "border-pill-info-fg text-pill-info-fg",
                    !isDone && !isCurrent && "border-hair-strong text-subtle",
                  )}
                >
                  {number}
                </span>
                <span
                  className={cn(
                    "text-app",
                    isCurrent || isDone ? "font-medium text-strong" : "text-subtle",
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <Card className="mt-5 p-6">
        {step === 1 ? <StepDetails sso={sso} /> : null}
        {step === 2 ? <StepMetadata /> : null}
        {step === 3 ? <StepTest provider={sso.provider} /> : null}
        {step === 4 ? <StepReview sso={sso} /> : null}
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <Link
          href={step === 1 ? "/settings/sso" : `${BASE}?step=${step - 1}`}
          className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
        >
          Back
        </Link>

        {step < 4 ? (
          <Link
            href={`${BASE}?step=${step + 1}`}
            className={buttonVariants({ variant: "appPrimary", size: "app", width: "auto" })}
          >
            Continue
          </Link>
        ) : (
          /* Activating SSO can lock every administrator out if the IdP is
             misconfigured, so it goes through an explicit acknowledgement gate.
             The API behind this must also refuse to activate unless the step-3
             connection test has actually passed. */
          <Link
            href={`${BASE}?step=4&dialog=activate`}
            className={buttonVariants({ variant: "appPrimary", size: "app", width: "auto" })}
          >
            Activate SSO
          </Link>
        )}
      </div>

      {step === 4 && dialog === "activate" ? (
        <SsoActivateDialog
          orgName={org.name}
          provider={sso.provider}
          closeHref={`${BASE}?step=4`}
        />
      ) : null}
    </PageBody>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-app border border-hair bg-hover px-4 py-3">
      <div className="min-w-0">
        <p className="text-meta text-dim">{label}</p>
        <p className="mt-0.5 truncate text-app text-strong">{value}</p>
      </div>
      <button
        type="button"
        className="shrink-0 text-meta font-semibold text-brand-accent hover:underline"
      >
        Copy
      </button>
    </div>
  );
}

function StepDetails({ sso }: { sso: Awaited<ReturnType<typeof getSsoConfig>> }) {
  return (
    <>
      <h2 className="text-section font-medium text-strong">PrismSek service provider details</h2>
      <p className="mt-1 text-meta text-dim">
        Copy these values into your identity provider&rsquo;s SAML application.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <CopyRow label="Entity ID / Identifier" value={sso.entityId} />
        <CopyRow label="ACS URL / Reply URL" value="https://app.prismsec.com/sso/saml/callback" />
        <CopyRow label="Single logout URL" value="https://app.prismsec.com/sso/saml/logout" />
      </div>

      <p className="mt-5 text-meta text-dim">
        Name ID format: <span className="text-strong">Email address</span> · Signature algorithm:{" "}
        <span className="text-strong">RSA-SHA256</span>
      </p>
    </>
  );
}

function StepMetadata() {
  return (
    <>
      <h2 className="text-section font-medium text-strong">Identity provider metadata</h2>
      <p className="mt-1 text-meta text-dim">
        Provide your IdP&rsquo;s metadata URL, or enter the details manually.
      </p>

      <div className="mt-5 flex flex-col gap-5">
        <AppField id="metadata-url" label="Metadata URL">
          <AppInput
            id="metadata-url"
            type="url"
            placeholder="https://northwind.okta.com/app/exk.../sso/saml/metadata"
          />
        </AppField>

        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-hair" />
          <span className="text-micro tracking-wide text-subtle uppercase">Or enter manually</span>
          <span className="h-px flex-1 bg-hair" />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <AppField id="idp-sso-url" label="IdP Single Sign-On URL">
            <AppInput
              id="idp-sso-url"
              type="url"
              placeholder="https://northwind.okta.com/app/sso/saml"
            />
          </AppField>
          <AppField id="idp-entity-id" label="IdP Entity ID">
            <AppInput id="idp-entity-id" placeholder="http://www.okta.com/exk2b7f9" />
          </AppField>
        </div>

        <div>
          <p className="text-meta font-semibold text-strong">X.509 Certificate</p>
          <label
            htmlFor="x509"
            className="mt-1.5 flex cursor-pointer items-center justify-center rounded-app border border-dashed border-hair-strong px-4 py-10 text-meta text-subtle transition-colors hover:bg-hover"
          >
            Drag and drop .pem or .crt file, or click to browse
          </label>
          <input id="x509" type="file" accept=".pem,.crt" className="sr-only" />
        </div>
      </div>
    </>
  );
}

function StepTest({ provider }: { provider: string }) {
  return (
    <>
      <h2 className="text-section font-medium text-strong">Test the connection</h2>
      <p className="mt-1 text-meta text-dim">
        Sign in through Northwind {provider} to confirm PrismSek can validate the SAML response.
      </p>

      <div className="mt-5 flex items-center gap-4 rounded-app border border-hair px-4 py-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-app bg-brand-halo text-brand-accent">
          <Mail aria-hidden className="size-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-app font-semibold text-strong">Not tested yet</p>
          <p className="mt-0.5 text-meta text-dim">
            Run a test sign-in through Northwind {provider}.
          </p>
        </div>
        <Button variant="appPrimary" size="app" width="auto" type="button">
          Run Test
        </Button>
      </div>
    </>
  );
}

function StepReview({ sso }: { sso: Awaited<ReturnType<typeof getSsoConfig>> }) {
  return (
    <>
      <h2 className="text-section font-medium text-strong">Review and activate</h2>
      <p className="mt-1 text-meta text-dim">
        Confirm the configuration before turning on SAML single sign-on.
      </p>

      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        <ReadOnlyField label="Identity provider" value={sso.provider} />
        <ReadOnlyField label="Protocol" value={sso.protocol} />
        <ReadOnlyField
          label="Connection test"
          value={<span className="text-state-ok">Passed</span>}
        />
        <ReadOnlyField label="Certificate expires" value="18 Aug 2027" />
      </div>

      <div className="mt-6 flex items-start justify-between gap-6 border-t border-hair pt-6">
        <div>
          <label htmlFor="enforce" className="text-app font-semibold text-strong">
            Enforce SSO for all members
          </label>
          <p className="mt-1 text-meta text-dim">
            Disables password sign-in once activated. You can change this later.
          </p>
        </div>
        <Toggle id="enforce" defaultChecked={sso.enforceSso} />
      </div>
    </>
  );
}
