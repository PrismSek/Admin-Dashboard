import { cn } from "@/lib/utils";

/**
 * Indeterminate progress ring used on the SSO handoff and signed-in screens.
 *
 * Honours prefers-reduced-motion via the global rule in globals.css, and the
 * accompanying label is what actually announces status — the ring is decorative.
 */
export function Spinner({
  tone = "brand",
  className,
}: {
  tone?: "brand" | "success";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-5 animate-spin rounded-full border-2 border-current border-t-transparent",
        tone === "success" ? "text-success" : "text-brand",
        className,
      )}
    />
  );
}

/** Spinner plus its status text, announced politely to assistive tech. */
export function StatusLine({
  label,
  tone = "brand",
}: {
  label: string;
  tone?: "brand" | "success";
}) {
  return (
    <p role="status" className="flex items-center justify-center gap-3 text-body text-ink">
      <Spinner tone={tone} />
      {label}
    </p>
  );
}
