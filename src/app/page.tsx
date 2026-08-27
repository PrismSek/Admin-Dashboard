import { redirect } from "next/navigation";

import { resolveRootDestination } from "@/features/auth/root-redirect";

/**
 * The root routes into the app rather than to sign-in: `resolveRootDestination`
 * forwards to the dashboard, where the proxy gates logged-in (render) vs
 * signed-out (bounce to sign-in). So a logged-in visitor who opens the bare URL
 * lands in the app, never the sign-in screen. The one exception is a failed
 * Google sign-in, which returns here as `?signin=failed` and is surfaced as a
 * generic sign-in error.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ signin?: string }>;
}) {
  const { signin } = await searchParams;
  redirect(resolveRootDestination(signin));
}
