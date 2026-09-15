import { Lock, Plus } from "lucide-react";
import Link from "next/link";

import { SideDrawer } from "@/components/app/side-drawer";
import { buttonVariants } from "@/components/ui/button";
import {
  getManageUser,
  getManageUserMemberships,
  type ManageMembership,
} from "@/features/manage/users";

/**
 * Group membership drawer (frame 388:8687). Directory groups come from the
 * user's department and are managed by Entra ID — shown with a lock and no
 * control; direct groups were added by hand and carry a Remove. Changes would
 * apply at the next signed resolve (footer note); the mutations wait on the
 * backend, so the controls are presentational for now, like the rest of Manage.
 */
export async function MembershipDrawer({
  userId,
  closeHref,
}: {
  userId: string;
  closeHref: string;
}) {
  const user = await getManageUser(userId);
  if (!user) return null;
  const memberships = await getManageUserMemberships(userId);

  return (
    <SideDrawer
      title="Group membership"
      description={`${user.name} — group membership determines which policies apply to this user and their endpoints.`}
      closeHref={closeHref}
      width="wide"
      footer={
        <>
          <p className="text-meta text-dim">Changes apply at the next signed resolve</p>
          <Link
            href={closeHref}
            className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
          >
            Cancel
          </Link>
        </>
      }
    >
      <p className="px-5 pb-2 pt-4 text-micro font-medium uppercase tracking-wide text-dim">
        Current membership
      </p>
      <ul>
        {memberships.map((membership) => (
          <MembershipRow key={membership.name} membership={membership} />
        ))}
      </ul>
      <div className="border-t border-hair px-5 py-4">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-app font-medium text-brand transition-colors hover:text-brand-hover"
        >
          <Plus aria-hidden className="size-4" />
          Add to a group
        </button>
      </div>
    </SideDrawer>
  );
}

function MembershipRow({ membership }: { membership: ManageMembership }) {
  const directory = membership.source === "directory";
  return (
    <li className="flex items-start justify-between gap-4 border-b border-hair px-5 py-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-app text-strong">{membership.name}</span>
          {directory ? (
            <span className="rounded-sm bg-pill-neutral-bg px-1.5 py-0.5 text-micro text-pill-neutral-fg">
              Directory
            </span>
          ) : (
            <span className="rounded-sm bg-pill-warn-bg px-1.5 py-0.5 text-micro text-pill-warn-fg">
              Direct
            </span>
          )}
        </div>
        <p className="mt-1 text-meta text-subtle">
          {directory
            ? "Managed by Entra ID — change the user's department to alter this"
            : "Added by hand — removable here"}
        </p>
      </div>
      {directory ? (
        <span className="inline-flex shrink-0 items-center gap-1.5 text-meta text-subtle">
          <Lock aria-hidden className="size-3.5" />
          Directory-managed
        </span>
      ) : (
        <button
          type="button"
          className={buttonVariants({ variant: "appDanger", size: "appSm", width: "auto" })}
        >
          Remove
        </button>
      )}
    </li>
  );
}
