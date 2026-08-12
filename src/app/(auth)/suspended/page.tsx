import { TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { AuthCenteredLayout } from "@/features/auth/components/auth-centered-layout";
import { AuthOutcomeHeading } from "@/features/auth/components/auth-heading";
import { StatusBadge } from "@/features/auth/components/status-badge";
import { authRoutes, suspendedContent } from "@/features/auth/content";

export const metadata: Metadata = { title: suspendedContent.title };

/**
 * Placeholders until the API supplies them. Both are sensitive: the design
 * notes this screen is only reachable after the account has been validated,
 * so neither the organisation name nor the reference code leaks to an
 * arbitrary visitor. Keep that property when wiring the API.
 */
const FALLBACK_ORG = "your organization";
const FALLBACK_REFERENCE = "SUS-0000";

export default async function SuspendedPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; ref?: string }>;
}) {
  const { org, ref } = await searchParams;

  return (
    <AuthCenteredLayout>
      <StatusBadge tone="brand" className="mb-8">
        <TriangleAlert aria-hidden />
      </StatusBadge>

      <AuthOutcomeHeading
        title={suspendedContent.title}
        body={
          <>
            <span className="block">{suspendedContent.body(org ?? FALLBACK_ORG)}</span>
            <span className="mt-4 block">
              {suspendedContent.contactPrefix}{" "}
              <span className="font-semibold text-brand">{suspendedContent.orgOwner}</span>{" "}
              {suspendedContent.contactSuffix}
            </span>
          </>
        }
      />

      <div className="mt-10 flex w-full flex-col gap-3">
        <a
          href={`mailto:?subject=${encodeURIComponent("PrismSek access suspended")}`}
          className={buttonVariants({ variant: "primary" })}
        >
          {suspendedContent.submit}
        </a>
        <Link href={authRoutes.signIn} className={buttonVariants({ variant: "secondary" })}>
          {suspendedContent.backToSignIn}
        </Link>
      </div>

      <p className="mt-8 text-center text-fine text-subtle-alt">
        {suspendedContent.reference(ref ?? FALLBACK_REFERENCE)}
      </p>
    </AuthCenteredLayout>
  );
}
