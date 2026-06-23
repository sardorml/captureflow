"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import {
  type ButtonHTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  forwardRef,
  useCallback,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

/*
 * Press feedback uses a pointer-driven `data-pressed` state rather than a bare
 * `active:` because most call sites render an `asChild` <a>, and `:active` on a
 * navigating anchor is unreliable.
 */
const ctaButtonVariants = cva(
  "inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-blue-600 font-semibold text-white ring-offset-background transition-transform duration-150 ease-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 data-[pressed=true]:scale-[0.97]",
  {
    variants: {
      size: {
        default: "h-10 px-5 py-2 text-sm",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-12 px-5 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export type CtaButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof ctaButtonVariants> & {
    asChild?: boolean;
  };

const CtaButton = forwardRef<HTMLButtonElement, CtaButtonProps>(
  (
    {
      className,
      size,
      asChild = false,
      onPointerDown,
      onPointerUp,
      onPointerLeave,
      onPointerCancel,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const [pressed, setPressed] = useState(false);
    const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const down = useCallback(
      (e: ReactPointerEvent<HTMLButtonElement>) => {
        if (releaseTimer.current) clearTimeout(releaseTimer.current);
        setPressed(true);
        onPointerDown?.(e);
      },
      [onPointerDown],
    );
    const up = useCallback(
      (e: ReactPointerEvent<HTMLButtonElement>) => {
        if (releaseTimer.current) clearTimeout(releaseTimer.current);
        releaseTimer.current = setTimeout(() => setPressed(false), 120);
        onPointerUp?.(e);
      },
      [onPointerUp],
    );
    const release = useCallback(
      (e: ReactPointerEvent<HTMLButtonElement>) => {
        if (releaseTimer.current) clearTimeout(releaseTimer.current);
        releaseTimer.current = setTimeout(() => setPressed(false), 120);
        onPointerLeave?.(e);
        onPointerCancel?.(e);
      },
      [onPointerLeave, onPointerCancel],
    );

    return (
      <Comp
        ref={ref}
        data-pressed={pressed ? "true" : undefined}
        onPointerDown={down}
        onPointerUp={up}
        onPointerLeave={release}
        onPointerCancel={release}
        className={cn(ctaButtonVariants({ size, className }))}
        {...props}
      />
    );
  },
);
CtaButton.displayName = "CtaButton";

export default CtaButton;
export { ctaButtonVariants };
