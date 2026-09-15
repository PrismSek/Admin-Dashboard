"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Right-anchored drawer used by the Manage panels (Add users, Bulk upload,
 * Group membership, Domains/Applications side panels). Open state lives in the
 * URL, so the server renders the drawer's contents and the link is shareable —
 * the same URL-as-state rule the centred `Modal` and the settings `UserDrawer`
 * follow, only anchored to the right edge (`ml-auto`) per the Figma manage
 * frames. Uses the native <dialog> for its focus trap, Escape handling and
 * inert backdrop.
 */
export function SideDrawer({
  title,
  description,
  closeHref,
  children,
  footer,
  width = "default",
}: {
  title: string;
  description?: ReactNode;
  closeHref: string;
  children?: ReactNode;
  footer?: ReactNode;
  width?: "default" | "wide";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="side-drawer-title"
      onCancel={(event) => {
        // Let the link-based close drive navigation so the URL stays in sync.
        event.preventDefault();
        window.location.href = closeHref;
      }}
      className={cn(
        "m-0 ml-auto h-dvh max-h-dvh w-[calc(100vw-3rem)] rounded-none border-0 border-l border-hair-strong bg-chrome p-0 text-strong backdrop:bg-black/40",
        width === "wide" ? "max-w-[38.75rem]" : "max-w-[31.25rem]",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-hair-strong px-5 py-3.5">
          <h2 id="side-drawer-title" className="truncate text-section font-medium text-strong">
            {title}
          </h2>
          <Link
            href={closeHref}
            aria-label="Close"
            className="-mr-1 flex size-8 shrink-0 items-center justify-center rounded-app text-dim transition-colors hover:bg-hover"
          >
            <X aria-hidden className="size-4" />
          </Link>
        </div>

        {description ? (
          <p className="border-b border-hair-strong px-5 py-3.5 text-meta text-dim">{description}</p>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

        {footer ? (
          <div className="flex items-center justify-between gap-4 border-t border-hair-strong px-5 py-3.5">
            {footer}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
