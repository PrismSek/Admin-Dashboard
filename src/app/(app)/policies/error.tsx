"use client";

import { PolicyListError } from "@/features/policies/components/PolicyListError";

/**
 * Route-level error boundary for `/policies`. Next 16.3's `retry()` (stable
 * since v16.3.0 — see node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md)
 * re-fetches and re-renders the segment, which is what this list needs; the
 * thrown `error` is intentionally never read here — see PolicyListError's
 * doc comment for why.
 */
export default function PoliciesError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <PolicyListError retry={retry} correlationId="POLICY-LOAD" />;
}
