import { cn } from "@/lib/utils";

/**
 * Decorative composition on the right half of the split auth layout.
 *
 * Reconstructed as inline SVG from the Figma artwork (`.Background Shape`,
 * node 388:3734) using the source geometry directly — the overlapping soft
 * orbs, the two warm spheres and the rotated "ring" bar — so it matches the
 * design rather than approximating it, while staying a few hundred bytes of
 * vector (no bitmap request) that re-themes through the --color-art-* tokens.
 *
 * Every sphere is a base fill with a blurred highlight offset toward the light,
 * exactly as drawn in Figma. Coordinates live in the source frame's own space;
 * the viewBox crops to the right-hand half the frame shows and `slice` lets the
 * composition cover the column at any height.
 *
 * Purely decorative — aria-hidden, and dropped entirely below `lg` where the
 * form takes the full width.
 */
export function AuthArtwork({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none relative overflow-hidden", className)}>
      <svg
        className="absolute inset-0 size-full"
        viewBox="339 300 720 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <clipPath id="aw-big">
            <circle cx="779.31" cy="675.145" r="231.995" />
          </clipPath>
          <clipPath id="aw-mid">
            <circle cx="782.641" cy="680.874" r="100.752" />
          </clipPath>
          <clipPath id="aw-small">
            <circle cx="527.763" cy="517.112" r="64.9586" />
          </clipPath>
          <clipPath id="aw-ring">
            <rect
              width="510.692"
              height="42.0283"
              rx="21.0141"
              transform="matrix(0.982894 -0.184881 0.183779 0.9831 461.623 596.057)"
            />
          </clipPath>

          <filter id="aw-blur-lilac" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="80.86" />
          </filter>
          <filter id="aw-blur-peach" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="99.18" />
          </filter>
          <filter id="aw-blur-mid" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="55.49" />
          </filter>
          <filter id="aw-blur-small" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="35.77" />
          </filter>
          <filter id="aw-blur-ring" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="71.63" />
          </filter>

          {/* Soft field filling the lower right, in place of the source's
              background-blur ellipse — a plain gradient renders identically
              over the flat page and avoids a backdrop-filter foreignObject. */}
          <radialGradient id="aw-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="var(--color-art-lilac)" stopOpacity="0.55" />
            <stop offset="55%" stopColor="var(--color-art-lilac)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-art-lilac)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="913.812" cy="903.636" r="318" fill="url(#aw-glow)" />

        {/* Primary orb — violet body, warmed by lilac and peach toward the top */}
        <g clipPath="url(#aw-big)">
          <circle cx="779.31" cy="675.145" r="231.995" fill="var(--color-art-violet)" />
          <circle
            cx="680.064"
            cy="506.663"
            r="346.667"
            fill="var(--color-art-lilac)"
            filter="url(#aw-blur-lilac)"
          />
          <circle
            cx="661.569"
            cy="475.248"
            r="231.995"
            fill="var(--color-art-peach)"
            filter="url(#aw-blur-peach)"
          />
        </g>

        {/* Focal warm sphere, centre right */}
        <g clipPath="url(#aw-mid)">
          <circle cx="782.641" cy="680.874" r="100.752" fill="var(--color-art-coral)" />
          <circle
            cx="723.306"
            cy="580.102"
            r="126.84"
            fill="var(--color-art-amber)"
            filter="url(#aw-blur-mid)"
          />
        </g>

        {/* Small warm sphere, upper left */}
        <g clipPath="url(#aw-small)">
          <circle cx="527.763" cy="517.112" r="64.9586" fill="var(--color-art-coral)" />
          <circle
            cx="489.514"
            cy="452.14"
            r="81.7783"
            fill="var(--color-art-amber)"
            filter="url(#aw-blur-small)"
          />
        </g>

        {/* Rotated ring bar crossing the upper third */}
        <g clipPath="url(#aw-ring)">
          <rect
            width="510.692"
            height="42.0283"
            rx="21.0141"
            transform="matrix(0.982894 -0.184881 0.183779 0.9831 461.623 596.057)"
            fill="var(--color-art-peach)"
          />
          <ellipse
            cx="505.877"
            cy="451.69"
            rx="215.078"
            ry="214.913"
            fill="var(--color-art-lilac)"
            filter="url(#aw-blur-ring)"
          />
        </g>
      </svg>

      {/* Fine grain, matching the noise layer in the source file */}
      <div
        className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
