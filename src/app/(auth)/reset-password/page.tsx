import type { Metadata } from "next";

import { AuthCenteredLayout } from "@/features/auth/components/auth-centered-layout";
import { AuthOutcomeHeading } from "@/features/auth/components/auth-heading";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { resetPasswordContent } from "@/features/auth/content";

export const metadata: Metadata = { title: resetPasswordContent.title };

/**
 * Reached from a reset or invitation email. The token in the URL must be
 * validated server-side before the new password is accepted — never trust that
 * arriving at this screen means the visitor is authorised.
 */
export default function ResetPasswordPage() {
  return (
    <AuthCenteredLayout>
      <AuthOutcomeHeading
        title={resetPasswordContent.title}
        body={[resetPasswordContent.subtitle]}
        className="mb-10"
      />
      <ResetPasswordForm />
    </AuthCenteredLayout>
  );
}
