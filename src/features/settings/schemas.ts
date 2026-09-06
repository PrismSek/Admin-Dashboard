import { z } from "zod";

/**
 * The admin-users gateway contract (the `admin-users` tag of the OpenAPI spec).
 * Every response is re-parsed with these at the boundary so a backend shape
 * change fails loudly here rather than as `undefined` in the UI (CODING_STANDARDS §6).
 */

export const apiUserRoleSchema = z.enum(["org_owner", "policy_admin", "analyst", "auditor"]);
export type ApiUserRole = z.infer<typeof apiUserRoleSchema>;

export const apiUserStatusSchema = z.enum(["pending", "active", "suspended", "deactivated"]);
export type ApiUserStatus = z.infer<typeof apiUserStatusSchema>;

export const apiUserSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  email: z.string(),
  name: z.string(),
  role: apiUserRoleSchema,
  status: apiUserStatusSchema,
  // Present on the list response but not load-bearing for the current UI.
  authMethod: z.enum(["native", "sso"]).optional(),
  createdAt: z.string().optional(),
  lastLoginAt: z.string().nullish(),
});
export type ApiUser = z.infer<typeof apiUserSchema>;

export const listUsersResponseSchema = z.object({
  users: z.array(apiUserSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
});

export const apiInviteStatusSchema = z.enum(["pending", "accepted", "revoked", "expired"]);
export type ApiInviteStatus = z.infer<typeof apiInviteStatusSchema>;

export const apiInviteSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: apiUserRoleSchema,
  status: apiInviteStatusSchema,
  invitedBy: z.string().optional(),
  createdAt: z.string(),
  expiresAt: z.string().optional(),
});
export type ApiInvite = z.infer<typeof apiInviteSchema>;

export const listInvitesResponseSchema = z.object({
  invites: z.array(apiInviteSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
});

/**
 * Request body for `POST /v1/invites`. Re-validated server-side before the call
 * (§8): the gateway also enforces the subset-role rule, but a malformed email or
 * unknown role should never leave the admin dashboard.
 */
export const createInviteRequestSchema = z.object({
  email: z.string().trim().min(1).email(),
  role: apiUserRoleSchema,
});
export type CreateInviteRequest = z.infer<typeof createInviteRequestSchema>;

/**
 * `POST /v1/invites` → 201. The raw `token` is returned only here and is
 * delivered to the invitee by email; the dashboard never surfaces it (an admin
 * must not be able to copy a live credential). `mailFailed` means the row exists
 * but the message did not go out — the caller should prompt a resend.
 */
export const createInviteResponseSchema = z.object({
  invite: z.object({
    id: z.string(),
    tenantId: z.string().optional(),
    email: z.string(),
    role: apiUserRoleSchema,
    status: apiInviteStatusSchema,
    invitedBy: z.string().optional(),
    createdAt: z.string(),
    expiresAt: z.string().optional(),
  }),
  token: z.string(),
  mailFailed: z.boolean().optional(),
});
export type CreateInviteResponse = z.infer<typeof createInviteResponseSchema>;
