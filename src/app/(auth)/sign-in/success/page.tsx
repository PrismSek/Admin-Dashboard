import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AuthCenteredLayout } from "@/features/auth/components/auth-centered-layout";
import { AuthOutcomeHeading } from "@/features/auth/components/auth-heading";
import { RedirectAfter } from "@/features/auth/components/redirect-after";
import { Spinner } from "@/features/auth/components/spinner";
import { StatusBadge } from "@/features/auth/components/status-badge";
import { authRoutes, signedInContent } from "@/features/auth/content";

export const metadata: Metadata = { title: signedInContent.title };

/**
 * Shown briefly after successful authentication, then forwards to the
 * workspace.
 *
 * The redirect is client-side on purpose: this screen exists to be seen. Once
 * the auth API lands, the Server Action that creates the session should also
 * redirect, so the destination is never reachable just by loading this URL —
 * this becomes the visible confirmation, not the access-control step.
 */
export default function SignedInPage() {
  return (
    <AuthCenteredLayout>
      <RedirectAfter to={authRoutes.home} />

      <StatusBadge tone="success" className="mb-6">
        <Check aria-hidden strokeWidth={2.5} />
      </StatusBadge>

      <AuthOutcomeHeading title={signedInContent.title} body={signedInContent.body} />

      <p role="status" className="mt-6 flex items-center justify-center gap-3 text-body text-ink">
        <Spinner tone="success" />
        {signedInContent.status}
      </p>

      {/* Fallback: the automatic redirect needs JavaScript, and a stalled
          redirect must never leave the user stranded on a dead end. */}
      <Link
        href={authRoutes.home}
        className="mt-8 rounded-sm text-body font-medium text-brand hover:underline"
      >
        {signedInContent.continueManually}
      </Link>
    </AuthCenteredLayout>
  );
}
