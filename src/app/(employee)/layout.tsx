import type { ReactNode } from "react";

import { AuthArtwork } from "@/features/auth/components/auth-artwork";

/**
 * Chrome for the public employee onboarding flow (Figma 2030:*) — a light page
 * with the decorative planet artwork bleeding off the right edge and the screen
 * card set to the left, matching the design. Reuses `AuthArtwork` so the
 * composition stays identical to the auth screens. Deliberately outside the
 * signed-in app shell (no sidebar) and public: `proxy.ts` does not gate
 * `/employee/*` because end users reach it from an invitation link.
 */
export default function EmployeeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center overflow-hidden bg-page">
      <AuthArtwork className="absolute inset-y-0 right-[-6rem] hidden w-[56%] lg:block" />
      <main className="relative w-full px-6 py-12 lg:pl-[14%] lg:pr-0">
        <div className="mx-auto w-full max-w-[25rem] lg:mx-0">{children}</div>
      </main>
    </div>
  );
}
