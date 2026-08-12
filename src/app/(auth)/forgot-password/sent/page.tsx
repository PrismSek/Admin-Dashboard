import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { AuthCenteredLayout } from "@/features/auth/components/auth-centered-layout";
import { AuthOutcomeHeading } from "@/features/auth/components/auth-heading";
import { StatusBadge } from "@/features/auth/components/status-badge";
import { authRoutes, checkEmailContent } from "@/features/auth/content";
import { maskEmail } from "@/features/auth/utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: checkEmailContent.title };

export default async function ResetLinkSentPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthCenteredLayout>
      <StatusBadge tone="success" className="mb-6">
        <Check aria-hidden strokeWidth={2.5} />
      </StatusBadge>

      <AuthOutcomeHeading
        title={checkEmailContent.title}
        body={
          <>
            <span className="block">{checkEmailContent.body}</span>
            {email ? (
              <span className="mt-1 block font-medium text-ink-strong">{maskEmail(email)}</span>
            ) : null}
          </>
        }
      />

      <Link
        href={authRoutes.signIn}
        className={cn(buttonVariants({ variant: "primary" }), "mt-8")}
      >
        {checkEmailContent.submit}
      </Link>

      <p className="mt-6 text-body text-muted">
        {checkEmailContent.noEmailPrefix}{" "}
        <button type="button" className="rounded-sm font-medium text-brand hover:underline">
          {checkEmailContent.resend}
        </button>
      </p>
    </AuthCenteredLayout>
  );
}
