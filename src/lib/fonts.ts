import { IBM_Plex_Sans } from "next/font/google";

/**
 * The one place the app's typeface is configured.
 *
 * IBM Plex Sans is the typeface used throughout the PrismSek Figma file.
 * Weights map to the type ramp in globals.css:
 *   400 body · 500 labels/links · 600 buttons · 700 emphasis
 * (300 exists in Figma on two headings only; see docs/FIGMA-DEVIATIONS.md.)
 *
 * Self-hosted by next/font — no external request, so it survives the strict
 * CSP required by docs/CODING_STANDARDS.md §12.
 */
export const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ibm-plex-sans",
});
