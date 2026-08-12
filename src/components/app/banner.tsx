import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Inline notice inside a page or card — the amber certificate-expiry warning
 * and the blue delivery-failure notice both render through this.
 *
 * The icon and the wording carry the meaning; colour is never the only signal.
 */
export function Banner({
  tone,
  title,
  description,
  action,
  icon = true,
  className,
}: {
  tone: "warn" | "info";
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-app border p-4",
        tone === "warn"
          ? "border-outline-warm bg-pill-warn-bg/60 text-pill-warn-fg"
          : "border-pill-info-fg/20 bg-pill-info-bg/60 text-strong",
        className,
      )}
    >
      {icon && tone === "warn" ? (
        <TriangleAlert aria-hidden className="mt-0.5 size-[18px] shrink-0" />
      ) : null}

      <div className="min-w-0 flex-1">
        <p className={cn("text-meta", tone === "info" && "font-semibold")}>{title}</p>
        {description ? (
          <p className={cn("mt-1 text-meta", tone === "info" ? "text-dim" : "opacity-90")}>
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
