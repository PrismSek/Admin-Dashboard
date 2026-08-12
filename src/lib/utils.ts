import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge cannot infer whether a custom utility like `text-body` sets a
 * font size or a text colour, and would collapse `text-body text-muted` down to
 * one class. Declaring our custom scales here keeps both.
 *
 * These lists mirror the `--text-*` and `--color-*` tokens in
 * src/app/globals.css — add a token there, add its name here.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            // auth ramp
            "heading",
            "body",
            "action",
            "help",
            "fine",
            // app ramp
            "page-title",
            "section",
            "stat",
            "app",
            "meta",
            "micro",
          ],
        },
      ],
      "text-color": [
        {
          text: [
            // auth
            "title",
            "ink",
            "ink-strong",
            "label",
            "muted",
            "subtle",
            "subtle-alt",
            "prose",
            "brand",
            "brand-fg",
            "brand-accent",
            "danger",
            "success",
            "third-party",
            // app shell
            "strong",
            "dim",
            "copy",
            "link",
            "destructive",
            "state-ok",
            "state-warn",
            "state-unknown",
            "pill-ok-fg",
            "pill-neutral-fg",
            "pill-warn-fg",
            "pill-info-fg",
          ],
        },
      ],
    },
  },
});

/**
 * Merge Tailwind classes with correct override precedence.
 * Always compose classes with this rather than template interpolation —
 * Tailwind's scanner cannot see dynamically built class strings.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
