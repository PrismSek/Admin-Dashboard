import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { AuthCenteredLayout } from "@/features/auth/components/auth-centered-layout";
import { AuthOutcomeHeading } from "@/features/auth/components/auth-heading";
import { StatusLine } from "@/features/auth/components/spinner";
import { StatusBadge } from "@/features/auth/components/status-badge";
import { authRoutes, ssoContent } from "@/features/auth/content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Single sign-on" };

/** Placeholder IdP name until the identity lookup API supplies the real one. */
const FALLBACK_PROVIDER = "Northwind";

export default async function SsoRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string }>;
}) {
  const { provider } = await searchParams;
  const providerName = provider ?? FALLBACK_PROVIDER;

  return (
    <AuthCenteredLayout>
      <StatusBadge tone="brand" className="mb-8">
        <ShieldCheck aria-hidden />
      </StatusBadge>

      <AuthOutcomeHeading title={ssoContent.title(providerName)} body={[ssoContent.body]} />

      <StatusLine label={ssoContent.status} />

      <p className="mt-10 text-body text-muted">{ssoContent.stalledPrompt}</p>

      <div className="mt-4 flex w-full flex-col gap-3">
        {/* Points at the IdP's authorize endpoint once SSO is configured. */}
        <Link href={authRoutes.signedIn} className={buttonVariants({ variant: "primary" })}>
          {ssoContent.submit}
        </Link>
        <Link href={authRoutes.signIn} className={cn(buttonVariants({ variant: "secondary" }))}>
          {ssoContent.useDifferentEmail}
        </Link>
      </div>
    </AuthCenteredLayout>
  );
}
