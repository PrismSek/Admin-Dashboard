import { Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Card } from "@/components/app/card";
import { AppField, AppInput } from "@/components/app/field";
import { Modal } from "@/components/app/modal";
import { PageBody } from "@/components/app/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { getCurrentUser, getOrganization } from "@/features/app-shell/data";

export const metadata: Metadata = { title: "Profile" };

/**
 * The user's own profile.
 *
 * Two variants exist in the design: a password account and an SSO account,
 * where the credential card differs. `?variant=sso` selects the SSO version —
 * once auth is wired this should be derived from the session rather than the
 * URL.
 */
export default async function ProfileSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string; dialog?: string }>;
}) {
  const [{ variant, dialog }, user, organization] = await Promise.all([
    searchParams,
    getCurrentUser(),
    getOrganization(),
  ]);

  const isSso = variant === "sso";
  const base = isSso ? "/settings/profile?variant=sso" : "/settings/profile";

  return (
    <PageBody className="max-w-5xl">
      <div className="flex items-start justify-between gap-6">
        <h1 className="text-page-title text-strong">Personal information</h1>
        <Button variant="appPrimary" size="app" width="auto" type="button">
          Save changes
        </Button>
      </div>

      <Card className="mt-6 p-6">
        <div className="flex items-start gap-6">
          <span
            aria-hidden
            className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-halo text-section font-semibold text-brand-accent"
          >
            {user.initials}
          </span>

          <AppField
            id="display-name"
            label="Display name"
            hint="Initials are generated from your display name. Photo uploads are not supported."
            className="max-w-md flex-1"
          >
            <AppInput id="display-name" defaultValue={user.name} />
          </AppField>
        </div>

        <div className="mt-6 grid divide-y divide-hair rounded-app border border-hair sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <ManagedField label="Email" value={user.email} />
          <ManagedField label="Organization" value={organization.name} />
          <ManagedField label="Role" value={user.role} />
        </div>

        <p className="mt-4 text-meta text-dim">
          Email, organization, and role are managed by your administrators.
        </p>
      </Card>

      <h2 className="mt-10 text-page-title text-strong">Account and access</h2>

      <Card className="mt-6 p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h3 className="text-app font-semibold text-strong">
              {isSso ? "Single sign-on" : "PrismSek password"}
            </h3>
            <p className="mt-1 text-meta text-dim">
              {isSso
                ? `You sign in through your organization's identity provider. Your password is managed there, not in PrismSek.`
                : "You sign in with your email and a PrismSek password. Change it whenever you need to."}
            </p>
          </div>

          {isSso ? null : (
            <Link
              href={`${base}${base.includes("?") ? "&" : "?"}dialog=change-password`}
              className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
            >
              Change password
            </Link>
          )}
        </div>
      </Card>

      <p className="mt-4 text-meta text-dim">
        Session management is not part of Profile in V1 — use Sign out in the avatar menu.
      </p>

      <Link
        href={isSso ? "/settings/profile" : "/settings/profile?variant=sso"}
        className="mt-6 inline-block text-meta font-semibold text-brand-accent hover:underline"
      >
        {isSso ? "Preview the password variant" : "Preview the SSO variant"}
      </Link>

      {dialog === "change-password" ? (
        <Modal
          title="Change password"
          description="You will stay signed in on this device. Other sessions are ended."
          closeHref={base}
          footer={
            <>
              <Link
                href={base}
                className={buttonVariants({
                  variant: "appSecondary",
                  size: "app",
                  width: "auto",
                })}
              >
                Cancel
              </Link>
              <Button variant="appPrimary" size="app" width="auto" type="submit">
                Update password
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-5">
            <AppField id="current-password" label="Current password">
              <AppInput id="current-password" type="password" autoComplete="current-password" />
            </AppField>
            <AppField
              id="new-password"
              label="New password"
              hint="Use 8+ characters with a mix of letters, numbers & symbols"
            >
              <AppInput id="new-password" type="password" autoComplete="new-password" />
            </AppField>
            <AppField id="confirm-password" label="Confirm new password">
              <AppInput id="confirm-password" type="password" autoComplete="new-password" />
            </AppField>
          </div>
        </Modal>
      ) : null}
    </PageBody>
  );
}

function ManagedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="text-micro tracking-wide text-subtle uppercase">{label}</p>
        <p className="mt-1 truncate text-app text-strong">{value}</p>
      </div>
      <Pencil aria-hidden className="size-4 shrink-0 text-subtle" />
    </div>
  );
}
