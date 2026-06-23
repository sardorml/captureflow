"use client";

import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";

const smoothButtonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold text-sm ring-offset-background transition-all duration-150 ease-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-500",
        outline:
          "border border-white/15 bg-white/[0.04] text-foreground hover:bg-white/[0.08] hover:border-white/25",
        ghost: "text-foreground hover:bg-white/[0.06]",
        link: "text-blue-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type SmoothButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof smoothButtonVariants> & {
    asChild?: boolean;
  };

const SmoothButton = forwardRef<HTMLButtonElement, SmoothButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(smoothButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
SmoothButton.displayName = "SmoothButton";

export default SmoothButton;
export { smoothButtonVariants };
