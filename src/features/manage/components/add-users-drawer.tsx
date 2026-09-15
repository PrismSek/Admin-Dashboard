import Link from "next/link";

import { SideDrawer } from "@/components/app/side-drawer";
import { buttonVariants } from "@/components/ui/button";
import { getDepartmentSummaries } from "@/features/manage/users";

/**
 * Add users drawer, step one (frame 388:22621): adding users widens one
 * department's policy scope, so the flow starts by choosing which department.
 * Opened by `?panel=add`. Counts are derived from the fixtures; the department
 * rows are presentational until the backend accepts the next step.
 */
export async function AddUsersDrawer({ closeHref }: { closeHref: string }) {
  const departments = await getDepartmentSummaries();

  return (
    <SideDrawer
      title="Choose a department"
      description="Adding users changes one department's policy scope. Pick which one."
      closeHref={closeHref}
      width="wide"
      footer={
        <>
          <p className="text-meta text-dim">Pick a department to continue</p>
          <Link
            href={closeHref}
            className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
          >
            Cancel
          </Link>
        </>
      }
    >
      <ul className="py-1">
        {departments.map((department) => (
          <li key={department.slug}>
            <button
              type="button"
              className="flex w-full items-center gap-3 border-b border-hair px-5 py-3.5 text-left transition-colors hover:bg-hover"
            >
              <span
                aria-hidden
                className="mt-0.5 size-4 shrink-0 rounded-full border border-hair-strong"
              />
              <span className="min-w-0">
                <span className="block text-app text-strong">{department.label}</span>
                <span className="mt-0.5 block text-meta text-subtle">
                  {department.users} user{department.users === 1 ? "" : "s"} · {department.endpoints}{" "}
                  endpoint{department.endpoints === 1 ? "" : "s"}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </SideDrawer>
  );
}
