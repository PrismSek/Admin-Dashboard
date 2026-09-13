import type { CurrentUser } from "@/features/app-shell/data";

/**
 * Identity block at the top of the sidebar: initials, name and role for the
 * signed-in user. Presentational only — `AppShell` fetches `CurrentUser` on
 * the server and passes it down.
 */
export function CurrentUserSummary({ user }: { user: CurrentUser }) {
  return (
    <div className="flex items-center gap-nav-gap border-b border-nav-divider px-nav-inline py-nav-block">
      <span
        aria-hidden
        className="flex size-icon-button shrink-0 items-center justify-center rounded-full bg-hair text-micro font-semibold text-copy"
      >
        {user.initials}
      </span>
      <div className="min-w-0">
        <p className="truncate text-nav font-medium text-nav-active-ink">{user.name}</p>
        <p className="truncate text-nav-sub text-nav-label">{user.role}</p>
      </div>
    </div>
  );
}
