import { Lock } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

import { authCommon, footerLinks } from "@/features/auth/content";
import { cn } from "@/lib/utils";

/**
 * Assurance line plus legal navigation, shown at the foot of every auth
 * screen. Both layouts render this, so the footer is defined once.
 */
export function AuthFooter({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <p className="flex items-center gap-2 text-fine text-muted">
        <Lock aria-hidden className="size-3.5 shrink-0" />
        {authCommon.assurance}
      </p>

      <nav aria-label="Legal and support">
        <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {footerLinks.map((link, index) => (
            <Fragment key={link.href}>
              {index > 0 ? (
                <li aria-hidden className="h-3 w-px bg-line" />
              ) : null}
              <li>
                <Link
                  href={link.href}
                  className="rounded-sm text-fine text-muted transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            </Fragment>
          ))}
        </ul>
      </nav>
    </div>
  );
}
