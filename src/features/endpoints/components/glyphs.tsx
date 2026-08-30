import { type OsFamily } from "@/features/endpoints/data";
import { cn } from "@/lib/utils";

/**
 * OS + browser marks for the Endpoints list. Simplified inline SVGs — the brand
 * logos reduced to recognizable silhouettes at ~16px. Kept as SVG (not brand
 * image assets) so they stay crisp and theme-neutral.
 */

export function OsGlyph({ family, className }: { family: OsFamily; className?: string }) {
  const cls = cn("size-4 shrink-0", className);
  if (family === "windows") {
    return (
      <svg viewBox="0 0 16 16" className={cls} aria-hidden fill="#0a84c1">
        <rect x="1" y="1" width="6" height="6" />
        <rect x="9" y="1" width="6" height="6" />
        <rect x="1" y="9" width="6" height="6" />
        <rect x="9" y="9" width="6" height="6" />
      </svg>
    );
  }
  if (family === "macos") {
    return (
      <svg viewBox="0 0 16 16" className={cls} aria-hidden fill="#1d1d1f">
        <path d="M13.5 12.1c-.2.6-.5 1.1-.9 1.6-.5.7-1 1.1-1.6 1.1-.5 0-.8-.1-1.4-.4-.6-.3-1-.4-1.5-.4s-.9.1-1.5.4c-.6.3-1 .4-1.4.4-.6 0-1.1-.4-1.7-1.1-.9-1.2-1.6-3-1.6-4.6 0-1.4.4-2.5 1.2-3.3.6-.6 1.4-.9 2.2-.9.5 0 1 .2 1.6.5.5.2.9.4 1.1.4.2 0 .6-.2 1.2-.5.6-.3 1.1-.4 1.5-.4 1.1 0 2 .5 2.6 1.4-1 .6-1.5 1.5-1.5 2.6 0 .9.3 1.6 1 2.2Z" />
        <path d="M10.4 3.6c-.4.5-.9.8-1.5.8 0-.6.3-1.2.7-1.6.4-.5 1-.8 1.6-.9.1.6-.2 1.2-.6 1.7Z" />
      </svg>
    );
  }
  if (family === "ubuntu") {
    return (
      <svg viewBox="0 0 16 16" className={cls} aria-hidden>
        <circle cx="8" cy="8" r="7" fill="#e95420" />
        <g fill="#fff">
          <circle cx="3.7" cy="8" r="1.3" />
          <circle cx="10.1" cy="4.6" r="1.3" />
          <circle cx="10.1" cy="11.4" r="1.3" />
        </g>
      </svg>
    );
  }
  // rhel
  return (
    <svg viewBox="0 0 16 16" className={cls} aria-hidden>
      <path d="M2.5 9.5c2.2 1.1 8.8 1.1 11 0 .5 1.2.3 2.3-.6 2.8-2.2 1.1-7.6 1.1-9.8 0-.9-.5-1.1-1.6-.6-2.8Z" fill="#ee0000" />
      <path d="M3.6 9.1C3 7.8 3.3 6.6 4.5 6.5c.5 0 .8.3 1.5.3.9 0 1.8-1.3 3.1-1.3 1 0 1.5.7 1.5 1.5 0 .5-.3.9-.3 1.3 0 .5.6.7 1.1 1-2 .8-6.2.8-7.8-.2Z" fill="#c00" />
    </svg>
  );
}

function Mark({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 16 16" className={cn("size-[15px] shrink-0", !active && "opacity-30")} aria-hidden>
      {children}
    </svg>
  );
}

/** Chrome / Edge / Firefox coverage marks + a "+N" (or "—") pill. */
export function BrowserMarks({ active, extra }: { active: boolean; extra: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Mark active={active}>
        <circle cx="8" cy="8" r="7" fill="#e8eaed" />
        <path d="M8 1a7 7 0 0 1 6.06 3.5H8a3.5 3.5 0 0 0-3.03 5.25L1.94 4.5A7 7 0 0 1 8 1Z" fill="#ea4335" />
        <path d="M14.06 4.5A7 7 0 0 1 8 15l3.03-5.25A3.5 3.5 0 0 0 8 4.5h6.06Z" fill="#4285f4" />
        <path d="M1.94 4.5 4.97 9.75A3.5 3.5 0 0 0 8 15 7 7 0 0 1 1.94 4.5Z" fill="#34a853" />
        <circle cx="8" cy="8" r="2.6" fill="#fbbc05" />
        <circle cx="8" cy="8" r="2.1" fill="#fff" />
        <circle cx="8" cy="8" r="1.7" fill="#4285f4" />
      </Mark>
      <Mark active={active}>
        <circle cx="8" cy="8" r="7" fill="#0c7dbb" />
        <path d="M3 10.5c1.5 2 4.5 2.8 7 1.8-1.8.4-3.9-.2-4.6-1.8-.8-1.8.8-3 2.6-3 2.2 0 3.4 1.2 4.4 1.2.6-2.5-1.2-5.2-4.4-5.2C5 3.5 2.6 6 2.6 9c0 .5.1 1 .4 1.5Z" fill="#7ecbf0" />
      </Mark>
      <Mark active={active}>
        <circle cx="8" cy="8" r="7" fill="#ff7139" />
        <path d="M13 5.5c.4 1 .5 2.2.2 3.4-.7 3-3.7 4.6-6.4 3.8-1.5-.5-2.5-1.7-2.7-3 .6 1 1.8 1.6 3 1.4 1.7-.3 2.8-1.8 2.5-3.3-.3-1.3-1.5-1.9-1.2-3.3.2-1 1.1-1.6 2-1.5-.6.5-.7 1.3-.3 1.9.4.5 1 .6 1.6.6Z" fill="#ffd28a" />
      </Mark>
      <span className="ml-1 inline-flex h-6 min-w-8 items-center justify-center rounded-full border border-hair-strong px-2 text-micro text-dim">
        {extra > 0 ? `+${extra}` : "—"}
      </span>
    </span>
  );
}
