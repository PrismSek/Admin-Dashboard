import type { Metadata } from "next";

import { AuthCenteredLayout } from "@/features/auth/components/auth-centered-layout";
import { AuthOutcomeHeading } from "@/features/auth/components/auth-heading";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { resetPasswordContent } from "@/features/auth/content";

export const metadata: Metadata = { title: resetPasswordContent.title };

/**
 * Reached from a reset email. The token travels in the URL and is validated
 * server-side (via `/api/auth/password/reset`) before the new password is
 * accepted — never trust that arriving at this screen means the visitor is
 * authorised. `searchParams` is a Promise in Next 16 (CODING_STANDARDS §3).
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthCenteredLayout>
      <AuthOutcomeHeading
        title={resetPasswordContent.title}
        body={[resetPasswordContent.subtitle]}
        className="mb-10"
      />
      <ResetPasswordForm token={token} />
    </AuthCenteredLayout>
  );
}
