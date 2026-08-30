import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * All button styling lives in this one variant map. To restyle every button
 * in the app, edit here — never override colours at the call site.
 *
 * `size: "default"` is the auth-screen control (44px, 10px radius, full width);
 * `size: "app"` is the denser signed-in control (36px, 6px radius, auto width).
 */
const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-semibold transition-colors duration-150",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        /** Primary call to action — solid brand fill. */
        primary: "bg-brand text-brand-fg hover:bg-brand-hover active:bg-brand-active",
        /** Signed-in primary — solid brand orange (#E04F27, via --color-brand-accent). */
        appPrimary: "bg-brand-accent text-brand-fg hover:bg-brand-hover active:bg-brand-active",
        /** Secondary action — white surface with a hairline border. */
        secondary:
          "border border-line bg-card text-ink-strong hover:bg-page active:bg-line-faint",
        /** Signed-in secondary. */
        appSecondary:
          "border border-hair-strong bg-chrome text-strong hover:bg-hover active:bg-active",
        /** Destructive action — outlined, never a filled red button. */
        destructive:
          "border border-destructive bg-transparent text-destructive hover:bg-destructive/5",
        /** High-consequence signed-in action (e.g. isolate endpoint) — outlined
            in brand-danger orange, distinct from the red `destructive` delete. */
        appDanger:
          "border border-danger bg-chrome text-danger hover:bg-danger/5 active:bg-danger/10",
        /** Third-party identity providers — normal-weight label. */
        provider:
          "border border-line bg-card text-ink font-normal hover:bg-page active:bg-line-faint",
        /** Text-only action. */
        ghost: "text-copy hover:bg-hover",
      },
      size: {
        default: "h-control rounded-control px-4 text-action",
        app: "h-9 rounded-app px-3.5 text-meta",
        appSm: "h-8 rounded-app px-3 text-micro",
      },
      width: {
        full: "w-full",
        auto: "w-auto",
      },
    },
    defaultVariants: { variant: "primary", size: "default", width: "full" },
  },
);

export type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, width, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size, width }), className)} {...props} />
  );
}

export { buttonVariants };
