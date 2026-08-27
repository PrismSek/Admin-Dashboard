import { authRoutes } from "@/features/auth/content";

/**
 * Where the bare root path `/` sends a visitor.
 *
 * A failed Google sign-in lands on the console root with `?signin=failed` (the
 * backend's opaque failure marker) — surface it as the generic sign-in error.
 * Everything else routes into the app rather than to sign-in: the proxy that
 * guards the app decides logged-in (render, refreshing the token if needed) vs
 * signed-out (bounce to sign-in), so the root never reads the session itself —
 * and a logged-in visitor opening the bare URL is never shown the sign-in
 * screen.
 */
export function resolveRootDestination(signin: string | undefined): string {
  return signin === "failed" ? `${authRoutes.signIn}?error=google` : authRoutes.dashboard;
}
