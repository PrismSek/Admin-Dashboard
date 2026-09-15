import type { CurrentUser } from "@/features/app-shell/data";

/**
 * Identity block at the top of the sidebar (Figma "Sidebar" component
 * 635:1239, "user" frame): a 48px avatar with a green online dot, then the
 * signed-in user's name and their role in caps. The Figma comp uses a photo;
 * we render the real user's initials instead so the block reflects the actual
 * session rather than placeholder art.
 *
 * Presentational only — `AppShell` fetches `CurrentUser` on the server and
 * passes it down.
 */
export function CurrentUserSummary({ user }: { user: CurrentUser }) {
  return (
    <div className="flex items-center gap-3 px-nav-inline pb-nav-edge">
      <span className="relative shrink-0">
        <span
          aria-hidden
          className="flex size-nav-avatar items-center justify-center rounded-full bg-nav-avatar-bg text-nav-avatar font-semibold text-nav-name"
        >
          {user.initials}
        </span>
        {/* Online status dot — a decorative presence indicator, ringed to
            read against the avatar (Figma "Status" 12px dot, #34c759). */}
        <span
          aria-hidden
          className="absolute bottom-0 right-0 size-nav-dot rounded-full border-2 border-nav-bg bg-nav-online"
        />
      </span>
      <div className="min-w-0">
        <p className="truncate text-nav-title font-medium text-nav-name">{user.name}</p>
        <p className="truncate text-nav-eyebrow font-semibold uppercase text-nav-role">{user.role}</p>
      </div>
    </div>
  );
}
