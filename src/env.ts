import { z } from "zod";

/**
 * Server-only environment contract, parsed with zod. Validated once at boot via
 * src/instrumentation.ts so a missing/malformed value fails the boot loudly
 * rather than surfacing as `undefined` deep in a request — CODING_STANDARDS §6.
 */
const serverEnvSchema = z.object({
  GATEWAY_ORIGIN: z.string().url(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Parse and return the validated server env. Reads process.env on each call. */
export function serverEnv(): ServerEnv {
  return serverEnvSchema.parse(process.env);
}
