import { redirect } from "next/navigation";

import { authRoutes } from "@/features/auth/content";

/**
 * The dashboard itself is not built yet, so the root sends visitors to sign in.
 * Once authenticated routes exist this should instead check the session and
 * redirect to either the dashboard or sign-in.
 */
export default function HomePage() {
  redirect(authRoutes.signIn);
}
