import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The circular icon that heads each outcome screen.
 *
 * Two treatments in the design: a green ring for success, and a filled peach
 * halo for informational and blocked states.
 */
export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: "success" | "brand";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full",
        tone === "success"
          ? "size-14 border-2 border-success text-success"
          : "size-[72px] bg-brand-halo text-brand-accent",
        "[&_svg]:size-7",
        className,
      )}
    >
      {children}
    </div>
  );
}
