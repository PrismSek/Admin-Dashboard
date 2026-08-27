import Image from "next/image";

import { authCommon } from "@/features/auth/content";
import { cn } from "@/lib/utils";

/**
 * The PrismSek lockup (shield mark + wordmark + tagline).
 *
 * A real vector asset: `public/prismsek-logo.svg`, cropped to the artwork with
 * a transparent background (the source file is a 1500×1500 board with a white
 * fill). Rendered at the Figma box, 242×61. `unoptimized` serves the SVG
 * verbatim — no rasterising, so it stays crisp at any DPI.
 */
const LOGO_WIDTH = 242;
const LOGO_HEIGHT = 61;

export function PrismSekLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/prismsek-logo.svg"
      alt={authCommon.logoAlt}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority
      unoptimized
      className={cn("h-auto w-[242px]", className)}
    />
  );
}
