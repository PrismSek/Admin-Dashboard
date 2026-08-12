import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthSplitLayout } from "@/features/auth/components/auth-split-layout";
import { PasswordForm } from "@/features/auth/components/password-form";
import { authRoutes, passwordContent } from "@/features/auth/content";

export const metadata: Metadata = { title: passwordContent.title };

/**
 * `params` and `searchParams` are Promises in Next 16 — synchronous access was
 * removed. See docs/CODING_STANDARDS.md §3.
 *
 * `?error=invalid` renders the invalid-credentials state from the design so it
 * is reachable without a backend.
 */
export default async function PasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; error?: string }>;
}) {
  const { email, error } = await searchParams;

  // Reaching this step without an identifier means the flow was entered
  // out of order; send the visitor back to step one.
  if (!email) redirect(authRoutes.signIn);

  return (
    <AuthSplitLayout>
      <PasswordForm
        email={email}
        initialError={error === "invalid" ? passwordContent.invalidCredentials : undefined}
      />
    </AuthSplitLayout>
  );
}
