import {
  Arrow as PopoverArrow,
  Content as PopoverContent,
  Portal as PopoverPortal,
  Root as PopoverRoot,
  Trigger as PopoverTrigger,
} from "@radix-ui/react-popover";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type RichPopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Rendered in place via Radix's `asChild`, so pass a single focusable node.
  trigger: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  className?: string;
  light?: boolean;
  glass?: boolean;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  // Needed when the trigger lives in the Electron title-bar drag region (`-webkit-app-region: drag`), which the OS intercepts before Radix's outside-pointer detection can fire.
  dismissBackdrop?: boolean;
  alignOffset?: number;
  sideOffset?: number;
  avoidCollisions?: boolean;
  children: React.ReactNode;
};

export function RichPopover({
  open,
  onOpenChange,
  trigger,
  title,
  icon,
  className,
  light = false,
  glass = false,
  side = "bottom",
  align = "end",
  alignOffset = 0,
  sideOffset = 8,
  avoidCollisions = true,
  dismissBackdrop = false,
  children,
}: RichPopoverProps): React.JSX.Element {
  const reduce = useReducedMotion();
  return (
    <PopoverRoot open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <AnimatePresence>
        {open && dismissBackdrop && (
          /*
           * The backdrop needs its own portal: Radix's PopoverPortal wraps its
           * children in a single Slot (`React.Children.only`), so rendering the
           * backdrop as a sibling of PopoverContent inside one portal throws.
           */
          <PopoverPortal forceMount>
            <div
              className="fixed inset-0 z-40"
              style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
              onPointerDown={() => onOpenChange(false)}
            />
          </PopoverPortal>
        )}
        {open && (
          <PopoverPortal forceMount>
            <PopoverContent
              asChild
              align={align}
              alignOffset={alignOffset}
              avoidCollisions={avoidCollisions}
              className="z-50"
              collisionPadding={12}
              side={side}
              sideOffset={sideOffset}
            >
              <motion.div
                // Width only — capping height would clip the arrow tail.
                style={
                  avoidCollisions
                    ? undefined
                    : {
                        maxWidth:
                          "var(--radix-popover-content-available-width)",
                      }
                }
                animate={
                  reduce
                    ? { opacity: 1 }
                    : { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }
                }
                exit={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.95, y: 5, filter: "blur(8px)" }
                }
                initial={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.95, y: 5, filter: "blur(8px)" }
                }
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 500, damping: 30 }
                }
                className={cn(
                  "relative rounded-xl px-4 py-3 shadow-xl",
                  glass &&
                    !light &&
                    "bg-neutral-800/65 backdrop-blur-2xl backdrop-saturate-150 border border-white/10 text-white",
                  light &&
                    "bg-white text-neutral-900 [--muted-foreground:oklch(0.46_0_0)]",
                  !light && !glass && "bg-neutral-800 text-white",
                  className,
                )}
              >
                {title && (
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {icon}
                    {title}
                  </div>
                )}
                {children}
                <PopoverArrow
                  className={
                    light
                      ? "fill-white"
                      : glass
                        ? "fill-neutral-800/65"
                        : "fill-neutral-800"
                  }
                  height={7}
                  width={14}
                />
              </motion.div>
            </PopoverContent>
          </PopoverPortal>
        )}
      </AnimatePresence>
    </PopoverRoot>
  );
}
