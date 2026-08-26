import { Button, buttonVariants } from "@/components/ui/button";
import { authRoutes, signInContent } from "@/features/auth/content";

/**
 * Third-party marks are inlined rather than pulled from an icon set: Google
 * and GitHub both require their own logo colours, so these must not inherit
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

function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden focusable="false" fill="#181717">
      <path d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.77.4.08.55-.18.55-.4l-.01-1.37c-2.23.5-2.7-1.1-2.7-1.1-.36-.96-.89-1.21-.89-1.21-.73-.51.05-.5.05-.5.8.06 1.23.85 1.23.85.72 1.26 1.88.9 2.34.68.07-.53.28-.9.51-1.1-1.78-.21-3.65-.91-3.65-4.06 0-.9.31-1.63.82-2.2-.08-.21-.36-1.05.08-2.18 0 0 .67-.22 2.2.84a7.4 7.4 0 0 1 4 0c1.53-1.06 2.2-.84 2.2-.84.44 1.13.16 1.97.08 2.18.51.57.82 1.3.82 2.2 0 3.16-1.87 3.85-3.66 4.05.29.25.54.75.54 1.51l-.01 2.24c0 .22.14.48.55.4A8.21 8.21 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z" />
    </svg>
  );
}

/**
 * The alternative sign-in methods below the divider on the sign-in screen:
 * Google and GitHub. A "Continue with SSO" button was removed at the product
 * owner's request (see docs/FIGMA-DEVIATIONS.md) — the SSO handoff screen
 * itself is unchanged. Wire each handler to the corresponding OAuth entry
 * point once the PrismSek auth API is available.
 */
export function ProviderButtons() {
  return (
    <div className="flex flex-col gap-3">
      <a href={authRoutes.googleStart} className={buttonVariants({ variant: "provider" })}>
        <GoogleMark />
        {signInContent.google}
      </a>

      <Button variant="provider" type="button">
        <GitHubMark />
        {signInContent.github}
      </Button>
    </div>
  );
}
