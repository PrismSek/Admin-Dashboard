import Link from "next/link";

import { policyListContent, policyRoutes } from "@/features/policies/content";

/**
 * Shown in place of the table when the active tab/search matches nothing.
 * The recovery action clears every filter (tab, search, page) by linking
 * back to the canonical list route.
 */
export function PolicyListEmpty() {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
      <p className="text-app text-copy">{policyListContent.empty.title}</p>
      <Link
        href={policyRoutes.list}
        className="text-app font-medium text-brand-accent hover:text-brand-hover"
      >
        {policyListContent.empty.action}
      </Link>
    </div>
  );
}
