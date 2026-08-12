import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * All button styling lives in this one variant map. To restyle every button
 * in the app, edit here — never override colours at the call site.
 */
const buttonVariants = cva(
  cn(
    "inline-flex w-full items-center justify-center gap-2 rounded-control",
    "text-action font-semibold whitespace-nowrap",
    "transition-colors duration-150",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        /** Primary call to action — solid brand fill. */
        primary: "bg-brand text-brand-fg hover:bg-brand-hover active:bg-brand-active",
        /** Secondary action — white surface with a hairline border. */
        secondary:
          "border border-line bg-card text-ink-strong hover:bg-page active:bg-line-faint",
        /** Third-party identity providers — same shell, normal weight label. */
        provider:
          "border border-line bg-card text-ink font-normal hover:bg-page active:bg-line-faint",
      },
      size: {
        /** Default control height, meets the WCAG 2.2 minimum target size. */
        default: "h-control px-4",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
