import { redirect } from "next/navigation";

import { resolveRootDestination } from "@/features/auth/root-redirect";

/**
 * The dashboard is not built yet, so the root forwards to sign-in. A failed
 * Google sign-in returns here as `?signin=failed`; surface it as a generic
 * sign-in error. Once authenticated routes exist this should also check the
 * session and choose dashboard vs sign-in.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ signin?: string }>;
}) {
  const { signin } = await searchParams;
  redirect(resolveRootDestination(signin));
}
