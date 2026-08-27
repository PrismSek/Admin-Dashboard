"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Dialog rendered over the current page.
 *
 * Open state lives in the URL (`?dialog=invite`), so the server renders the
 * dialog's contents and the URL is shareable — consistent with the URL-as-state
 * rule in docs/CODING_STANDARDS.md §7. `closeHref` is the same route without
 * the dialog params.
 *
 * Uses the native <dialog> element for its built-in focus trap, Escape
 * handling and inert backdrop.
 */
export function Modal({
  title,
  description,
  closeHref,
  children,
  footer,
  size = "default",
}: {
  title: string;
  description?: ReactNode;
  closeHref: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "default" | "wide";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      onCancel={(event) => {
        // Let the link-based close drive navigation so the URL stays in sync.
        event.preventDefault();
        window.location.href = closeHref;
      }}
      className={cn(
        "m-auto w-[calc(100vw-2rem)] rounded-card border border-hair-strong bg-chrome p-0",
        "text-strong backdrop:bg-black/40",
        size === "wide" ? "max-w-2xl" : "max-w-lg",
      )}
    >
      <div className="flex items-start justify-between gap-4 p-6 pb-0">
        <div className="min-w-0">
          <h2 id="modal-title" className="text-section font-medium text-strong">
            {title}
          </h2>
          {description ? <p className="mt-1 text-meta text-dim">{description}</p> : null}
        </div>
        <Link
          href={closeHref}
          aria-label="Close dialog"
          className="-mr-1 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-app text-dim transition-colors hover:bg-hover"
        >
          <X aria-hidden className="size-4" />
        </Link>
      </div>

      {children ? <div className="p-6">{children}</div> : null}

      {footer ? (
        <div className="flex justify-end gap-3 border-t border-hair px-6 py-4">{footer}</div>
      ) : null}
    </dialog>
  );
}
