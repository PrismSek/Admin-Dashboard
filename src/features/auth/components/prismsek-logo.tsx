import Image from "next/image";

import { authCommon } from "@/features/auth/content";
import { cn } from "@/lib/utils";

/**
 * The PrismSek lockup (shield mark + wordmark + tagline).
 *
 * Exported from Figma at 4x. The source asset is a bitmap in the design file,
 * not vector paths — if a true SVG lockup exists in brand assets, swap
 * public/prismsek-logo.png for it here and every screen updates.
 */
const LOGO_WIDTH = 240;
const LOGO_HEIGHT = 61;

export function PrismSekLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/prismsek-logo.png"
      alt={authCommon.logoAlt}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority
      className={cn("h-auto w-[240px]", className)}
    />
  );
}
