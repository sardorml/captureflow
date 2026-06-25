"use client";

// Keep source-identical to the desktop app's animated-tooltip: change both files.
import { cn } from "@captureflow/ui/cn";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

export type AnimatedTooltipPlacement = "top" | "bottom" | "left" | "right";

export interface AnimatedTooltipProps {
  content: ReactNode;
  placement?: AnimatedTooltipPlacement;
  /** Delay in milliseconds before the tooltip appears */
  delay?: number;
  children: ReactNode;
  className?: string;
  // Extra classes for the trigger wrapper span. Default is  `relative inline-flex items-center` — override to opt the wrapper  into the parent's layout (e.g. `flex flex-1` to take its recording of  a segmented flex container).
  triggerClassName?: string;
}

const SPRING = {
  type: "spring" as const,
  duration: 0.25,
  bounce: 0.1,
};

const GAP = 8;
const VIEWPORT_PADDING = 8;

const getInitialTransform = (
  placement: AnimatedTooltipPlacement,
): { opacity: number; scale: number; x: number; y: number } => {
  const base = { opacity: 0, scale: 0.95, x: 0, y: 0 };
  switch (placement) {
    case "top":
      return { ...base, y: 4 };
    case "bottom":
      return { ...base, y: -4 };
    case "left":
      return { ...base, x: 4 };
    case "right":
      return { ...base, x: -4 };
  }
};

type Position = { top: number; left: number };

const computePosition = (
  trigger: DOMRect,
  tooltip: { width: number; height: number },
  placement: AnimatedTooltipPlacement,
): Position => {
  let top = 0;
  let left = 0;
  switch (placement) {
    case "top":
      top = trigger.top - tooltip.height - GAP;
      left = trigger.left + trigger.width / 2 - tooltip.width / 2;
      break;
    case "bottom":
      top = trigger.bottom + GAP;
      left = trigger.left + trigger.width / 2 - tooltip.width / 2;
      break;
    case "left":
      top = trigger.top + trigger.height / 2 - tooltip.height / 2;
      left = trigger.left - tooltip.width - GAP;
      break;
    case "right":
      top = trigger.top + trigger.height / 2 - tooltip.height / 2;
      left = trigger.right + GAP;
      break;
  }
  const maxLeft = window.innerWidth - tooltip.width - VIEWPORT_PADDING;
  const maxTop = window.innerHeight - tooltip.height - VIEWPORT_PADDING;
  left = Math.max(VIEWPORT_PADDING, Math.min(left, maxLeft));
  top = Math.max(VIEWPORT_PADDING, Math.min(top, maxTop));
  return { top, left };
};

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";
const subscribeHoverDevice = (notify: () => void): (() => void) => {
  const mq = window.matchMedia(HOVER_QUERY);
  mq.addEventListener("change", notify);
  return () => mq.removeEventListener("change", notify);
};
const getHoverDeviceSnapshot = (): boolean =>
  window.matchMedia(HOVER_QUERY).matches;
const getHoverDeviceServerSnapshot = (): boolean => false;

export function AnimatedTooltip({
  content,
  placement = "top",
  delay = 0,
  children,
  className,
  triggerClassName,
}: AnimatedTooltipProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const isHoverDevice = useSyncExternalStore(
    subscribeHoverDevice,
    getHoverDeviceSnapshot,
    getHoverDeviceServerSnapshot,
  );
  const [position, setPosition] = useState<Position | null>(null);
  const tooltipId = useId();
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLSpanElement | null>(null);

  const show = useCallback(() => {
    if (delay > 0) {
      delayTimerRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    } else {
      setIsVisible(true);
    }
  }, [delay]);

  const hide = useCallback(() => {
    if (delayTimerRef.current !== null) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    setIsVisible(false);
  }, []);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) return;
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = {
      width: tooltip.offsetWidth,
      height: tooltip.offsetHeight,
    };
    setPosition(computePosition(triggerRect, tooltipRect, placement));
  }, [placement]);

  const [prevVisible, setPrevVisible] = useState(isVisible);
  if (prevVisible !== isVisible) {
    setPrevVisible(isVisible);
    if (!isVisible) setPosition(null);
  }

  useLayoutEffect(() => {
    if (!isVisible) return;
    updatePosition();
    const handle = (): void => updatePosition();
    window.addEventListener("scroll", handle, true);
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("resize", handle);
    };
  }, [isVisible, updatePosition]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        hide();
      }
    },
    [hide],
  );

  const initialTransform = getInitialTransform(placement);

  return (
    <span
      ref={triggerRef}
      className={cn("relative inline-flex items-center", triggerClassName)}
      onKeyDown={handleKeyDown}
      onMouseEnter={isHoverDevice ? show : undefined}
      onMouseLeave={isHoverDevice ? hide : undefined}
    >
      <span aria-describedby={isVisible ? tooltipId : undefined}>
        {children}
      </span>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isVisible && (
              <motion.span
                ref={tooltipRef}
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 1, scale: 1, x: 0, y: 0 }
                }
                className={cn(
                  "fixed z-50 w-max max-w-xs rounded-md bg-neutral-900 px-3 py-1.5 text-neutral-100 text-xs border border-white/5 shadow-lg pointer-events-none",
                  className,
                )}
                style={{
                  top: position?.top ?? 0,
                  left: position?.left ?? 0,
                  visibility: position ? "visible" : "hidden",
                }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0, transition: { duration: 0 } }
                    : {
                        ...initialTransform,
                        transition: { duration: 0.15 },
                      }
                }
                id={tooltipId}
                initial={shouldReduceMotion ? { opacity: 0 } : initialTransform}
                role="tooltip"
                transition={shouldReduceMotion ? { duration: 0 } : SPRING}
              >
                {content}
              </motion.span>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </span>
  );
}
