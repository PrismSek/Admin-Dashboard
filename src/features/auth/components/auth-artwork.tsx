import { cn } from "@/lib/utils";

/**
 * Decorative gradient composition on the right half of the split auth layout.
 *
 * Rebuilt in CSS from the Figma artwork (overlapping soft orbs plus a rotated
 * bar, over a fine noise wash) rather than shipped as a ~3 MB bitmap: it stays
 * crisp at any viewport, costs no network request, and re-themes with tokens.
 * Colours come from the --color-art-* tokens in globals.css.
 *
 * Layers are ordered back to front, positioned as percentages derived from the
 * Figma frame geometry so the composition holds its proportions when resized.
 *
 * Purely decorative — aria-hidden, and dropped entirely below `lg` where the
 * form takes the full width.
 */
export function AuthArtwork({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none relative overflow-hidden", className)}>
      {/* Pale lavender field filling the lower right, fading out at the edges */}
      <div
        className="absolute rounded-full blur-[40px]"
        style={{
          left: "18%",
          top: "34%",
          width: "125%",
          aspectRatio: "1",
          background:
            "radial-gradient(circle at 42% 34%, var(--color-art-lilac) 0%, color-mix(in srgb, var(--color-art-lilac) 55%, white) 46%, color-mix(in srgb, var(--color-art-lilac) 12%, white) 74%, transparent 88%)",
        }}
      />

      {/* Primary orb — warm across the top, violet through the lower body */}
      <div
        className="absolute rounded-full blur-[2px]"
        style={{
          left: "16%",
          top: "6%",
          width: "89%",
          aspectRatio: "1",
          background:
            "linear-gradient(158deg, var(--color-art-amber) 0%, var(--color-art-peach) 14%, var(--color-art-coral) 30%, var(--color-art-violet) 62%, var(--color-art-violet) 100%)",
        }}
      />

      {/* Light bar crossing the upper third */}
      <div
        className="absolute rounded-full blur-[7px]"
        style={{
          left: "14%",
          top: "27%",
          width: "80%",
          height: "9%",
          transform: "rotate(-13deg)",
          background:
            "linear-gradient(90deg, color-mix(in srgb, var(--color-art-lilac) 70%, white) 0%, color-mix(in srgb, var(--color-art-peach) 45%, white) 40%, color-mix(in srgb, var(--color-art-peach) 55%, white) 72%, color-mix(in srgb, var(--color-art-lilac) 60%, white) 100%)",
        }}
      />

      {/* Small orb, upper left */}
      <div
        className="absolute rounded-full blur-[2px]"
        style={{
          left: "13%",
          top: "15%",
          width: "25%",
          aspectRatio: "1",
          background:
            "radial-gradient(circle at 36% 30%, var(--color-art-peach) 0%, var(--color-art-coral) 68%, var(--color-art-coral) 100%)",
        }}
      />

      {/* Focal orb, centre right */}
      <div
        className="absolute rounded-full blur-[2px]"
        style={{
          left: "42%",
          top: "30%",
          width: "39%",
          aspectRatio: "1",
          background:
            "radial-gradient(circle at 38% 28%, var(--color-art-amber) 0%, #ff8a4c 42%, var(--color-art-coral) 78%, #f4483f 100%)",
        }}
      />

      {/* Fine grain, matching the noise layer in the source file */}
      <div
        className="absolute inset-0 opacity-[0.16] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
