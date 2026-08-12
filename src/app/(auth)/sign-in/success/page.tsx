import { Check } from "lucide-react";
import type { Metadata } from "next";

import { AuthCenteredLayout } from "@/features/auth/components/auth-centered-layout";
import { AuthOutcomeHeading } from "@/features/auth/components/auth-heading";
import { Spinner } from "@/features/auth/components/spinner";
import { StatusBadge } from "@/features/auth/components/status-badge";
import { signedInContent } from "@/features/auth/content";

export const metadata: Metadata = { title: signedInContent.title };

/**
 * Shown briefly after successful authentication while the session is
 * established. The redirect to the workspace is intentionally not implemented
 * here — it belongs in the Server Action that creates the session, so it
 * cannot be skipped by loading this URL directly.
 */
export default function SignedInPage() {
  return (
    <AuthCenteredLayout>
      <StatusBadge tone="success" className="mb-6">
        <Check aria-hidden strokeWidth={2.5} />
      </StatusBadge>

      <AuthOutcomeHeading title={signedInContent.title} body={signedInContent.body} />

      <p role="status" className="mt-6 flex items-center justify-center gap-3 text-body text-ink">
        <Spinner tone="success" />
        {signedInContent.status}
      </p>
    </AuthCenteredLayout>
  );
}
