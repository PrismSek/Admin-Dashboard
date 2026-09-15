import Link from "next/link";

import { AppSelect } from "@/components/app/field";
import { SideDrawer } from "@/components/app/side-drawer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { domainCollections } from "@/features/manage/domains";

const DISPOSITIONS = ["Allowed", "Blocked", "Monitored"] as const;

/**
 * Add domains drawer (frame 388:17792): choose a collection and disposition,
 * paste one domain per line, and PrismSek parses them before anything is
 * enforced. Opened by `?panel=add`. The parse + write wait on the backend, so
 * the form is presentational for now, like the rest of Manage.
 */
export function AddDomainsDrawer({ closeHref }: { closeHref: string }) {
  return (
    <SideDrawer
      title="Add domains"
      description="One domain per line. Prefix with *. to include subdomains, or leave the toggle on and PrismSek does it for you."
      closeHref={closeHref}
      width="wide"
      footer={
        <>
          <p className="text-meta text-copy">0 valid</p>
          <div className="flex gap-3">
            <Link
              href={closeHref}
              className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
            >
              Cancel
            </Link>
            <Button variant="appPrimary" size="app" width="auto" type="button">
              Add domains
            </Button>
          </div>
        </>
      }
    >
      <div className="flex flex-col gap-5 px-5 py-5">
        <label className="flex flex-col gap-2">
          <span className="text-micro font-medium uppercase tracking-wide text-dim">
            Add to collection
          </span>
          <AppSelect defaultValue={domainCollections[0]}>
            {domainCollections.map((collection) => (
              <option key={collection} value={collection}>
                {collection}
              </option>
            ))}
          </AppSelect>
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-micro font-medium uppercase tracking-wide text-dim">
            Disposition
          </span>
          <div
            role="radiogroup"
            aria-label="Disposition"
            className="grid grid-cols-3 overflow-hidden rounded-app border border-hair-strong"
          >
            {DISPOSITIONS.map((disposition, index) => {
              const active = index === 0;
              return (
                <button
                  key={disposition}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={cn(
                    "py-2 text-meta transition-colors",
                    index > 0 && "border-l border-hair-strong",
                    active ? "bg-brand text-brand-fg" : "text-dim hover:bg-hover",
                  )}
                >
                  {disposition}
                </button>
              );
            })}
          </div>
        </div>

        <textarea
          rows={4}
          defaultValue={""}
          placeholder={"*.dropbox.com\nwetransfer.com\nmega.nz"}
          className="w-full resize-none rounded-app border border-hair-strong bg-chrome px-3.5 py-3 text-app text-strong outline-none placeholder:text-subtle focus:border-brand-accent"
        />

        <label className="flex items-center gap-2.5">
          <Checkbox defaultChecked aria-label="Treat bare domains as domain + subdomains" />
          <span className="text-app text-copy">Treat bare domains as domain + subdomains</span>
        </label>

        <div className="border-t border-hair pt-4">
          <p className="text-micro font-medium uppercase tracking-wide text-dim">
            Parsed · 0 of 0 will be added
          </p>
          <p className="mt-2 text-app text-subtle">
            Nothing to add yet. Paste or type domains above — one per line.
          </p>
        </div>

        <p className="text-meta text-subtle">
          Nothing is enforced until the next signed configuration resolve. The change is written to
          the audit trail first.
        </p>
      </div>
    </SideDrawer>
  );
}
