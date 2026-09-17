import type { SVGProps } from "react";

/**
 * Full-colour third-party brand marks, used only as the integration badges on
 * the notification remediation cards (Slack, Microsoft Teams, Google, Microsoft).
 *
 * Unlike {@link AppIcon} — which is monochrome and inherits `currentColor` from a
 * design token — brand logos are literal vendor assets and MUST keep the vendors'
 * own fixed colours. This is the one sanctioned exception to the repo's
 * "no hardcoded colours" rule (a brand mark cannot be re-themed). The marks are
 * decorative: each badge renders its name as text beside the logo, so the svg is
 * `aria-hidden` to avoid a doubled screen-reader announcement.
 */
export const BRAND_LOGO_NAMES = ["slack", "teams", "google", "microsoft"] as const;

export type BrandLogoName = (typeof BRAND_LOGO_NAMES)[number];

type BrandLogoProps = Omit<SVGProps<SVGSVGElement>, "children" | "viewBox"> & {
  name: BrandLogoName;
};

const SHARED = {
  xmlns: "http://www.w3.org/2000/svg",
  focusable: "false" as const,
  "aria-hidden": true,
} satisfies Partial<SVGProps<SVGSVGElement>>;

export function BrandLogo({ name, ...props }: BrandLogoProps) {
  switch (name) {
    case "slack":
      return (
        <svg {...SHARED} viewBox="0 0 122.8 122.8" {...props}>
          <path fill="#E01E5A" d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9z" />
          <path fill="#E01E5A" d="M32.3 77.6c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" />
          <path fill="#36C5F0" d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2z" />
          <path fill="#36C5F0" d="M45.2 32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" />
          <path fill="#2EB67D" d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2z" />
          <path fill="#2EB67D" d="M90.5 45.2c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z" />
          <path fill="#ECB22E" d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9z" />
          <path fill="#ECB22E" d="M77.6 90.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" />
        </svg>
      );
    case "teams":
      return (
        <svg {...SHARED} viewBox="0 0 2228.833 2073.333" {...props}>
          <path fill="#5059C9" d="M1554.6 777.5h575.7c54.4 0 98.5 44.1 98.5 98.5v524.4c0 199.9-162.1 362-362 362h-1.7c-199.9 0-362-162-362-361.9V829c0-28.4 23-51.5 51.5-51.5z" />
          <circle fill="#5059C9" cx="1943.8" cy="440.6" r="233.3" />
          <circle fill="#7B83EB" cx="1218.1" cy="336.9" r="336.9" />
          <path fill="#7B83EB" d="M1667.3 777.5H717c-53.7 1.3-96.3 45.9-95 99.7v598.1c-7.5 322.5 247.7 590.2 570.2 598.1 322.5-7.9 577.7-275.5 570.2-598.1V877.2c1.2-53.7-41.3-98.3-95.1-99.7z" />
          <path fill="#fff" d="M964.7 930v58.2h-77.8v261.3h-64.9V988.2H745.5V930h219.2z" />
        </svg>
      );
    case "google":
      return (
        <svg {...SHARED} viewBox="0 0 48 48" {...props}>
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
      );
    case "microsoft":
      return (
        <svg {...SHARED} viewBox="0 0 23 23" {...props}>
          <path fill="#F25022" d="M1 1h10v10H1z" />
          <path fill="#7FBA00" d="M12 1h10v10H12z" />
          <path fill="#00A4EF" d="M1 12h10v10H1z" />
          <path fill="#FFB900" d="M12 12h10v10H12z" />
        </svg>
      );
  }
}
