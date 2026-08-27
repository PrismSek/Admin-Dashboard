import { z } from "zod";

export const sessionPayloadSchema = z.object({
  token: z.string().min(1),
  refresh: z.string().min(1),
  n: z.string().min(1),
});
export type SessionPayload = z.infer<typeof sessionPayloadSchema>;
