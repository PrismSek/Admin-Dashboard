import { ArrowRight, MailX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { AuthCenteredLayout } from "@/features/auth/components/auth-centered-layout";
import { AuthOutcomeHeading } from "@/features/auth/components/auth-heading";
import { StatusBadge } from "@/features/auth/components/status-badge";
import { authRoutes, invitationExpiredContent } from "@/features/auth/content";

export const metadata: Metadata = { title: invitationExpiredContent.title };

export default function InvitationExpiredPage() {
  return (
    <AuthCenteredLayout>
      <StatusBadge tone="brand" className="mb-8">
        <MailX aria-hidden />
      </StatusBadge>

      <AuthOutcomeHeading
        title={invitationExpiredContent.title}
        body={invitationExpiredContent.body}
      />

      <div className="mt-10 flex w-full flex-col gap-3">
        {/* Requests a fresh invite from the inviting admin once wired up. */}
        <Button type="button">
          {invitationExpiredContent.submit}
          <ArrowRight aria-hidden />
        </Button>

        <Link href={authRoutes.signIn} className={buttonVariants({ variant: "secondary" })}>
          {invitationExpiredContent.backToSignIn}
        </Link>
      </div>

      <Link
        href="/support"
        className="mt-8 rounded-sm text-body font-medium text-brand hover:underline"
      >
        {invitationExpiredContent.contactAdmin}
      </Link>
    </AuthCenteredLayout>
  );
}
