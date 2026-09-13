import { AppShell } from "@/features/app-shell/components/AppShell";
import { getCurrentUser } from "@/features/app-shell/data";

/**
 * Shell for every signed-in screen. A Server Component — the current user is
 * fetched on the server so no identity data round-trips through the client.
 * Once auth exists this is also where the session check belongs, ahead of
 * `proxy.ts` route protection.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return <AppShell user={user}>{children}</AppShell>;
}
