/**
 * Runs once at server startup (Next.js instrumentation). Validating the env here
 * fails the boot loudly when a required variable is missing, instead of deferring
 * the error to a request handler — CODING_STANDARDS §6.
 */
export async function register() {
  const { serverEnv } = await import("@/env");
  serverEnv();
}
