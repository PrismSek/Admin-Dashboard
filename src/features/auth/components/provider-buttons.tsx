import { Button, buttonVariants } from "@/components/ui/button";
import { authRoutes, signInContent } from "@/features/auth/content";
import { cn } from "@/lib/utils";

/**
 * Third-party marks are inlined rather than pulled from an icon set: Google
 * and Microsoft both require their own logo colours, so these must not inherit
 * `currentColor` the way our own icons do.
 */
function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.35 0-4.34-1.58-5.05-3.71H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l2.99-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l2.99 2.33C4.66 5.16 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}

function MicrosoftMark() {
  // Official four-square mark: each tile keeps its own brand colour.
  return (
    <svg viewBox="0 0 21 21" aria-hidden focusable="false">
      <path fill="#F25022" d="M1 1h9v9H1z" />
      <path fill="#7FBA00" d="M11 1h9v9h-9z" />
      <path fill="#00A4EF" d="M1 11h9v9H1z" />
      <path fill="#FFB900" d="M11 11h9v9h-9z" />
    </svg>
  );
}

/**
 * The alternative sign-in methods below the divider on the sign-in screen:
 * Google and Microsoft. A "Continue with SSO" button was removed at the product
 * owner's request (see docs/FIGMA-DEVIATIONS.md) — the SSO handoff screen
 * itself is unchanged. Wire each handler to the corresponding OAuth entry
 * point once the PrismSek auth API is available.
 */
export function ProviderButtons() {
  // Figma sets the provider labels at body size (12px), lighter than the 15px
  // primary button — so override the default control text size on these two.
  return (
    <div className="flex flex-col gap-3">
      <a
        href={authRoutes.googleStart}
        className={cn(buttonVariants({ variant: "provider" }), "text-body")}
      >
        <GoogleMark />
        {signInContent.google}
      </a>

      <Button variant="provider" type="button" className="text-body">
        <MicrosoftMark />
        {signInContent.microsoft}
      </Button>
    </div>
  );
}
