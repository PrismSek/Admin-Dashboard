import type { Metadata } from "next";

import { AuthSplitLayout } from "@/features/auth/components/auth-split-layout";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { forgotPasswordContent } from "@/features/auth/content";

export const metadata: Metadata = { title: forgotPasswordContent.title };

/** Screen added to close the gap in the Figma flow — see docs/FIGMA-DEVIATIONS.md. */
export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthSplitLayout>
      <ForgotPasswordForm defaultEmail={email ?? ""} />
    </AuthSplitLayout>
  );
}
