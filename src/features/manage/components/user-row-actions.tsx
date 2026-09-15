"use client";

import { MoreVertical } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Row actions menu for the Users list. The list lives inside an
 * `overflow-x-auto` frame that would clip an absolutely-positioned menu, so the
 * dropdown is positioned `fixed` from the button's rect and closes on any
 * scroll, resize or Escape. The items are the two flows the design provides a
 * destination for: the detail page and the membership drawer.
 */
export function UserRowActions({
  name,
  detailHref,
  membershipHref,
}: {
  name: string;
  detailHref: string;
  membershipHref: string;
}) {
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPos(null);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [pos]);

  function toggle() {
    if (pos) {
      setPos(null);
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Actions for ${name}`}
        aria-haspopup="menu"
        aria-expanded={pos !== null}
        onClick={toggle}
        className="flex size-8 items-center justify-center rounded-app text-dim transition-colors hover:bg-hover"
      >
        <MoreVertical aria-hidden className="size-4" />
      </button>
      {pos ? (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setPos(null)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            style={{ top: pos.top, right: pos.right }}
            className="fixed z-50 w-52 overflow-hidden rounded-app border border-hair-strong bg-chrome py-1 shadow-lg"
          >
            <Link
              role="menuitem"
              href={detailHref}
              className="block px-3.5 py-2 text-app text-copy transition-colors hover:bg-hover"
            >
              View details
            </Link>
            <Link
              role="menuitem"
              href={membershipHref}
              className="block px-3.5 py-2 text-app text-copy transition-colors hover:bg-hover"
            >
              Manage membership
            </Link>
          </div>
        </>
      ) : null}
    </>
  );
}
