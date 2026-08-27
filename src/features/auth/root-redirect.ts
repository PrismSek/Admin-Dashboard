import { authRoutes } from "@/features/auth/content";

/**
 * A failed Google sign-in lands on the console root with `?signin=failed`
 * (see the backend's opaque failure marker). Map it to the generic sign-in
 * error; everything else goes to plain sign-in.
 */
export function resolveRootDestination(signin: string | undefined): string {
  return signin === "failed" ? `${authRoutes.signIn}?error=google` : authRoutes.signIn;
}
