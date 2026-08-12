import type { Metadata } from "next";

import { AuthSplitLayout } from "@/features/auth/components/auth-split-layout";
import { SignInEmailForm } from "@/features/auth/components/sign-in-email-form";
import { signInContent } from "@/features/auth/content";

export const metadata: Metadata = { title: signInContent.title };

export default function SignInPage() {
  return (
    <AuthSplitLayout>
      <SignInEmailForm />
    </AuthSplitLayout>
  );
}
