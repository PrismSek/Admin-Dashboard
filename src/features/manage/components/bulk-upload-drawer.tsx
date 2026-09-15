import { Download, UploadCloud } from "lucide-react";
import Link from "next/link";

import { SideDrawer } from "@/components/app/side-drawer";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * Bulk upload drawer (frame 388:5144): download the Excel template, then drop
 * the completed file back. Opened by `?panel=bulk-upload`. The upload itself
 * waits on the backend, so the drop zone is presentational for now.
 */
export function BulkUploadDrawer({ closeHref }: { closeHref: string }) {
  return (
    <SideDrawer
      title="Bulk upload"
      description="Create groups and assign users and endpoints in bulk using an Excel template."
      closeHref={closeHref}
      footer={
        <div className="flex w-full justify-end gap-3">
          <Link
            href={closeHref}
            className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
          >
            Cancel
          </Link>
          <Button variant="appPrimary" size="app" width="auto" type="button">
            Continue
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 px-5 py-5">
        <section className="flex flex-col gap-2.5">
          <p className="text-micro font-medium uppercase tracking-wide text-dim">1 · Template</p>
          <button
            type="button"
            className={buttonVariants({
              variant: "appSecondary",
              size: "app",
              width: "auto",
              className: "self-start",
            })}
          >
            <Download aria-hidden className="size-4" />
            Download Excel template
          </button>
          <p className="text-meta text-subtle">
            Use the provided template to add multiple groups, users and endpoint assignments at
            once.
          </p>
        </section>

        <section className="flex flex-col gap-2.5">
          <p className="text-micro font-medium uppercase tracking-wide text-dim">
            2 · Upload completed template
          </p>
          <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-hair-strong bg-canvas px-5 py-7 text-center">
            <UploadCloud aria-hidden className="size-6 text-subtle" />
            <p className="text-meta text-copy">Drag and drop your Excel file here</p>
            <p className="text-meta text-subtle">or</p>
            <button
              type="button"
              className={buttonVariants({ variant: "appSecondary", size: "appSm", width: "auto" })}
            >
              Choose file
            </button>
          </div>
          <p className="text-meta text-subtle">.xlsx files only</p>
        </section>
      </div>
    </SideDrawer>
  );
}
