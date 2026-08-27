import Link from "next/link";

import { AppField, AppInput, AppSelect } from "@/components/app/field";
import { Modal } from "@/components/app/modal";
import { Button, buttonVariants } from "@/components/ui/button";
import { roles, type OrgUser } from "@/features/settings/data";

/**
 * Dialogs opened from the Users and Access screen: invite, suspend, delete.
 *
 * Which dialog is open is read from the URL by the page (a Server Component)
 * and passed down, so the dialog's contents are server-rendered and the URL is
 * shareable. Only the <dialog> shell itself is client-side.
 */
export function UserDialogs({
  dialog,
  userId,
  users,
  orgName,
  closeHref,
}: {
  dialog?: string;
  userId?: string;
  users: OrgUser[];
  orgName: string;
  closeHref: string;
}) {
  if (dialog === "invite") {
    return (
      <Modal
        title="Invite a user"
        description={`They'll receive an email to join ${orgName} on PrismSek.`}
        closeHref={closeHref}
        footer={
          <>
            <Link
              href={closeHref}
              className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
            >
              Cancel
            </Link>
            <Button variant="appPrimary" size="app" width="auto" type="submit">
              Send invitation
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <AppField id="invite-email" label="Email address">
            <AppInput id="invite-email" type="email" placeholder="name@company.com" />
          </AppField>

          <AppField id="invite-role" label="Role">
            <AppSelect id="invite-role" defaultValue="Analyst">
              {roles.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </AppSelect>
          </AppField>
        </div>
      </Modal>
    );
  }

  const target = users.find((user) => user.id === userId);
  if (!target) return null;

  if (dialog === "suspend") {
    return (
      <Modal
        title={`Suspend ${target.name}?`}
        closeHref={closeHref}
        footer={
          <>
            <Link
              href={closeHref}
              className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
            >
              Cancel
            </Link>
            <Button variant="appPrimary" size="app" width="auto" type="submit">
              Suspend user
            </Button>
          </>
        }
      >
        <p className="text-meta text-dim">
          {target.name} ({target.email}) will be signed out of every session immediately and
          will not be able to sign in again until an administrator restores access. Their data,
          policies and audit history are kept.
        </p>
      </Modal>
    );
  }

  if (dialog === "delete") {
    return (
      <Modal
        title={`Delete ${target.name}?`}
        closeHref={closeHref}
        footer={
          <>
            <Link
              href={closeHref}
              className={buttonVariants({ variant: "appSecondary", size: "app", width: "auto" })}
            >
              Cancel
            </Link>
            {/* Irreversible. The API call behind this must require the typed
                confirmation below to match, and must be audit-logged. */}
            <Button variant="destructive" size="app" width="auto" type="submit">
              Delete permanently
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <p className="text-meta text-dim">
            This permanently removes {target.name} and their personal data. Audit records of
            actions they took are retained. This cannot be undone.
          </p>
          <AppField
            id="delete-confirm"
            label="Type the user's email to confirm"
            hint={target.email}
          >
            <AppInput id="delete-confirm" placeholder={target.email} />
          </AppField>
        </div>
      </Modal>
    );
  }

  return null;
}
