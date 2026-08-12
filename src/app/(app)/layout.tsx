import { SideNav } from "@/features/app-shell/components/side-nav";
import { TopBar } from "@/features/app-shell/components/top-bar";
import { getCurrentUser } from "@/features/app-shell/data";

/**
 * Shell for every signed-in screen: fixed top bar, sidebar, scrolling content.
 *
 * A Server Component — the current user is fetched on the server so no
 * identity data round-trips through the client. Once auth exists this is also
 * where the session check belongs, ahead of `proxy.ts` route protection.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <TopBar initials={user.initials} />
      <div className="flex min-h-0 flex-1">
        <SideNav />
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
