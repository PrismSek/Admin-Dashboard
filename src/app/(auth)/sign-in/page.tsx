import type { Metadata } from "next";

import { AuthSplitLayout } from "@/features/auth/components/auth-split-layout";
import { SignInEmailForm } from "@/features/auth/components/sign-in-email-form";
import { signInContent } from "@/features/auth/content";

export const metadata: Metadata = { title: signInContent.title };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <AuthSplitLayout>
      <SignInEmailForm error={error === "google" ? signInContent.googleError : undefined} />
    </AuthSplitLayout>
  );
}
