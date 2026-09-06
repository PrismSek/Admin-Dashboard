import type { Metadata } from "next";

import { AcceptInvitationForm } from "@/features/auth/components/accept-invitation-form";
import { AuthCenteredLayout } from "@/features/auth/components/auth-centered-layout";
import { AuthOutcomeHeading } from "@/features/auth/components/auth-heading";
import { acceptInvitationContent } from "@/features/auth/content";

export const metadata: Metadata = { title: acceptInvitationContent.title };

/**
 * Reached from an invitation email. The token travels in the URL and is the only
 * credential: it is validated server-side (via `/api/auth/invitation/accept`)
 * when the invitee submits their name and password — arriving at this screen
 * never means the visitor is authorised. `searchParams` is a Promise in Next 16
 * (CODING_STANDARDS §3).
 *
 * The gateway has no "look up an invitation by token" endpoint, so the invite
 * details (organisation, inviter, role) cannot be shown here without handing an
 * unauthenticated visitor tenant information — the page collects what accept
 * needs and nothing more.
 */
export default async function InvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthCenteredLayout>
      <AuthOutcomeHeading
        title={acceptInvitationContent.title}
        body={[acceptInvitationContent.subtitle]}
        className="mb-10"
      />
      <AcceptInvitationForm token={token} />
    </AuthCenteredLayout>
  );
}
