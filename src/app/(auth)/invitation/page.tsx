import { ArrowRight, Building2, CalendarDays, Clock, Mail, ShieldCheck, User } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { AuthCenteredLayout } from "@/features/auth/components/auth-centered-layout";
import { StatusBadge } from "@/features/auth/components/status-badge";
import { authRoutes, invitationContent } from "@/features/auth/content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Invitation" };

/**
 * Placeholder invitation. Replace with a server-side lookup of the invite
 * token: the details below identify a real person and organisation, so they
 * must come from a validated token rather than from the URL.
 */
const invitation = {
  organization: "Acme Corporation",
  invitedByName: "Sarah Johnson",
  invitedByEmail: "sarah.johnson@acmecorp.com",
  role: "Security Analyst",
  sentOn: "May 21, 2024",
  expiresOn: "June 4, 2024",
  expiresIn: "in 14 days",
};

function DetailRow({
  icon,
  label,
  children,
  action,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <li className="flex items-start gap-4 py-3">
      <span className="mt-1 shrink-0 text-subtle-alt [&_svg]:size-5">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-help text-subtle-alt">{label}</p>
        <p className="mt-0.5 text-body text-ink-strong">{children}</p>
      </div>
      {action}
    </li>
  );
}

export default function InvitationPage() {
  return (
    <AuthCenteredLayout width="wide">
      <StatusBadge tone="brand" className="mb-8">
        <Mail aria-hidden />
      </StatusBadge>

      {/* The design shows no visible title here, but the page still needs one
          for document structure and screen readers. */}
      <h1 className="sr-only">Invitation to join PrismSek</h1>
      <p className="mb-4 text-center text-body text-prose">
        {invitationContent.body.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>

      <ul className="flex w-full flex-col gap-2">
        <DetailRow icon={<Building2 aria-hidden />} label={invitationContent.organizationLabel}>
          {invitation.organization}
        </DetailRow>

        <DetailRow icon={<User aria-hidden />} label={invitationContent.invitedByLabel}>
          {invitation.invitedByName}{" "}
          <span className="text-subtle-alt">({invitation.invitedByEmail})</span>
        </DetailRow>

        <DetailRow icon={<ShieldCheck aria-hidden />} label={invitationContent.roleLabel}>
          {invitation.role}
        </DetailRow>

        <DetailRow icon={<CalendarDays aria-hidden />} label={invitationContent.sentLabel}>
          {invitation.sentOn}
        </DetailRow>

        <DetailRow icon={<Clock aria-hidden />} label={invitationContent.expiresLabel}>
          {invitation.expiresOn} <span className="text-brand">({invitation.expiresIn})</span>
        </DetailRow>
      </ul>

      <div className="mt-10 grid w-full gap-3 sm:grid-cols-2">
        <Button variant="secondary" type="button">
          {invitationContent.decline}
        </Button>
        <Link
          href={authRoutes.resetPassword}
          className={cn(buttonVariants({ variant: "primary" }))}
        >
          {invitationContent.accept}
          <ArrowRight aria-hidden />
        </Link>
      </div>

      <p className="mt-8 max-w-md text-center text-body text-muted">
        {invitationContent.mistakePrefix}{" "}
        <Link href="/support" className="rounded-sm text-brand hover:underline">
          {invitationContent.contactSupport}
        </Link>
      </p>
    </AuthCenteredLayout>
  );
}
