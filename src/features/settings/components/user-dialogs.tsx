import { InviteUserDialog } from "@/features/settings/components/invite-user-dialog";

/**
 * Dialogs opened from the Users and Access list. Only the invite dialog lives
 * here now — suspend, deactivate and delete moved into the user drawer, beside
 * the account they act on. Which dialog is open is read from the URL by the
 * page and passed down; the invite form itself is client-side so it can call the
 * Server Action without leaving the list.
 */
export function UserDialogs({
  dialog,
  orgName,
  closeHref,
}: {
  dialog?: string;
  orgName: string;
  closeHref: string;
}) {
  if (dialog !== "invite") return null;

  return <InviteUserDialog orgName={orgName} closeHref={closeHref} />;
}
