import Link from "next/link";

import { AppSelect } from "@/components/app/field";
import { ToolbarSearch } from "@/components/app/list-controls";
import { SideDrawer } from "@/components/app/side-drawer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { appCollections, getApplications, type Application } from "@/features/manage/applications";

/**
 * Add applications drawer (frame 388:15313): applications can only be added from
 * software already observed in the fleet, so this is a picker over the seen
 * inventory rather than a free-text form. Opened by `?panel=add`. Selection and
 * write wait on the backend, so the rows are presentational for now.
 */
export async function AddApplicationsDrawer({ closeHref }: { closeHref: string }) {
  const applications = await getApplications();

  return (
    <SideDrawer
      title="Add applications"
      description="Pick from software already observed in the fleet. Adding an application that has never been seen is not possible in V1."
      closeHref={closeHref}
      width="wide"
      footer={
        <>
          <p className="text-meta text-copy">0 selected</p>
          <div className="flex gap-3">
            <Link
              href={closeHref}
              className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
            >
              Cancel
            </Link>
            <Button variant="appPrimary" size="app" width="auto" type="button">
              Add
            </Button>
          </div>
        </>
      }
    >
      <div className="flex flex-col gap-4 px-5 py-5">
        <ToolbarSearch placeholder="Search observed applications" />
        <label className="flex flex-col gap-2">
          <span className="text-micro font-medium uppercase tracking-wide text-dim">
            Classify into collection
          </span>
          <AppSelect defaultValue={appCollections[0]}>
            {appCollections.map((collection) => (
              <option key={collection} value={collection}>
                {collection}
              </option>
            ))}
          </AppSelect>
        </label>
      </div>

      <ul className="border-t border-hair">
        {applications.map((application) => (
          <AppOption key={application.id} application={application} />
        ))}
      </ul>
    </SideDrawer>
  );
}

function AppOption({ application }: { application: Application }) {
  return (
    <li>
      <label className="flex items-center gap-3 border-b border-hair px-5 py-3 transition-colors hover:bg-hover">
        <Checkbox aria-label={`Select ${application.name}`} />
        <span className="min-w-0 flex-1">
          <span className="block text-app text-strong">{application.name}</span>
          <span className="mt-0.5 block text-meta text-subtle">{application.publisher}</span>
        </span>
        <span className="shrink-0 text-app text-state-ok">Seen on {application.endpointCount}</span>
      </label>
    </li>
  );
}
