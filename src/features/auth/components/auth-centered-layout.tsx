import type { ReactNode } from "react";

import { AuthFooter } from "@/features/auth/components/auth-footer";
import { PrismSekLogo } from "@/features/auth/components/prismsek-logo";
import { cn } from "@/lib/utils";

/**
 * Single-column, centred auth shell used by the outcome screens — invitation,
 * SSO handoff, set password, suspended, and the success confirmations.
 *
 * `width` widens the column for the invitation screen, which lays out a
 * detail list rather than a narrow form.
 */
export function AuthCenteredLayout({
  children,
  width = "narrow",
}: {
  children: ReactNode;
  width?: "narrow" | "wide";
}) {
  return (
    <div className="auth-scale flex min-h-dvh flex-col items-center justify-between gap-12 px-6 py-12 sm:py-16">
      <div
        className={cn(
          "flex w-full flex-1 flex-col items-center justify-center",
          width === "wide" ? "max-w-2xl" : "max-w-md",
        )}
      >
        <PrismSekLogo className="mb-12" />
        <div className="flex w-full flex-col items-center">{children}</div>
      </div>

      <AuthFooter />
    </div>
  );
}
