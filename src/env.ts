import { z } from "zod";

/**
 * Server-only environment contract, parsed with zod. Validated once at boot via
 * src/instrumentation.ts so a missing/malformed value fails the boot loudly
 * rather than surfacing as `undefined` deep in a request — CODING_STANDARDS §6.
 */
const serverEnvSchema = z.object({
  GATEWAY_ORIGIN: z.string().url(),
  // Secret used to encrypt/authenticate the short-lived `ps_user` display cookie
  // (the sidebar's name + role). Display data only — never consulted for
  // authorization, which always rides on the verified `ps_session` JWT.
  USER_COOKIE_SECRET: z.string().min(32),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Parse and return the validated server env. Reads process.env on each call. */
export function serverEnv(): ServerEnv {
  return serverEnvSchema.parse(process.env);
}
