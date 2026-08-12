/**
 * Mask the local part of an email for display: `jae.mathew@gmail.com`
 * becomes `j*********@gmail.com`.
 *
 * Applied consistently to every screen that echoes an address back to an
 * unauthenticated visitor, so the UI never confirms a full address to someone
 * who has not proved they own it.
 */
export function maskEmail(email: string): string {
  const atIndex = email.lastIndexOf("@");
  if (atIndex <= 0) return email;

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex);

  if (local.length <= 1) return `${local}${domain}`;
  return `${local[0]}${"*".repeat(local.length - 1)}${domain}`;
}
