import type { ReactNode } from "react";

import { AuthArtwork } from "@/features/auth/components/auth-artwork";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { PrismSekLogo } from "@/features/auth/components/prismsek-logo";

/**
 * Two-column auth shell: form column on the left, decorative artwork on the
 * right. Used by the screens that ask for input — sign in, password, sign up.
 *
 * Below `lg` the artwork is dropped and the form centres, so the same screens
 * work on a phone without a second set of components.
 */
export function AuthSplitLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto flex w-full max-w-auth-column flex-col">
          <PrismSekLogo className="mb-10" />
          {children}
          <AuthFooter className="mt-14" />
        </div>
      </div>

      <AuthArtwork className="hidden lg:block" />
    </div>
  );
}
