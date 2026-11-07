"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import NextLink from "next/link";
import { cn } from "@/lib/utils";
import { FRAME_WIDTH } from "./frame";
import {
  BAR_HEIGHT_PX,
  CLOSE_DELAY_MS,
  CLOSED_AFTER_MS,
  CURTAIN_DELAY_MS,
  CURTAIN_MS,
  FLYOUT_EASE,
  HOVER_INTENT_MS,
  PANEL_MS,
  PART_IN_MS,
  SWITCH_MS,
  partInDelayMs,
  partOutMs,
} from "./nav-flyout-timing";

export type FlyoutLink = { label: string; href: string; external?: boolean };

export type FlyoutGroup = {
  title: string;
  featured?: FlyoutLink[];
  links: FlyoutLink[];
};

export type Flyout = { id: string; label: string; groups: FlyoutGroup[] };

type Mode = "enter" | "switch" | "leave";

export type FlyoutState = {
  active: string | null;
  from: string | null;
  mode: Mode;
  isOpen: (id: string) => boolean;
  open: (id: string) => void;
  close: () => void;
  intend: (id: string | null) => void;
  cancelIntent: () => void;
};

/*
 * Hover waits HOVER_INTENT_MS before opening or switching, so sweeping the
 * pointer across the bar doesn't flash every menu. Closing keeps the last
 * menu mounted until its parts and the panel have animated out.
 */
export function useFlyoutState(): FlyoutState {
  const [active, setActive] = useState<string | null>(null);
  const [from, setFrom] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("enter");
  const intent = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closing = useRef<ReturnType<typeof setTimeout> | null>(null);
  const live = useRef({ active, mode });
  live.current = { active, mode };

  const cancelIntent = useCallback(() => {
    if (intent.current) clearTimeout(intent.current);
    intent.current = null;
  }, []);

  const open = useCallback(
    (id: string) => {
      cancelIntent();
      if (closing.current) clearTimeout(closing.current);
      closing.current = null;
      const { active: current, mode: currentMode } = live.current;
      if (current === id && currentMode !== "leave") return;
      if (current === null || currentMode === "leave") {
        setFrom(null);
        setMode("enter");
      } else {
        setFrom(current);
        setMode("switch");
      }
      setActive(id);
    },
    [cancelIntent],
  );

  const close = useCallback(() => {
    cancelIntent();
    const { active: current, mode: currentMode } = live.current;
    if (current === null || currentMode === "leave") return;
    setFrom(null);
    setMode("leave");
    closing.current = setTimeout(() => {
      closing.current = null;
      setActive(null);
    }, CLOSED_AFTER_MS);
  }, [cancelIntent]);

  const intend = useCallback(
    (id: string | null) => {
      cancelIntent();
      if (id === null && live.current.active === null) return;
      intent.current = setTimeout(
        () => (id ? open(id) : close()),
        HOVER_INTENT_MS,
      );
    },
    [cancelIntent, open, close],
  );

  useEffect(
    () => () => {
      if (intent.current) clearTimeout(intent.current);
      if (closing.current) clearTimeout(closing.current);
    },
    [],
  );

  return {
    active,
    from,
    mode,
    isOpen: (id) => active === id && mode !== "leave",
    open,
    close,
    intend,
    cancelIntent,
  };
}

const FEATURED_LINK =
  "block px-[11px] pt-[9px] pb-[7px] -mb-[6px] text-[24px] leading-[28px] font-semibold tracking-[0.009em] text-fg/80 underline-offset-[3px] outline-none hover:underline focus-visible:underline";
const LINK =
  "block px-[11px] py-[7px] -mb-[6px] text-[12px] leading-4 font-semibold tracking-[-0.01em] text-fg/80 underline-offset-[3px] outline-none hover:underline focus-visible:underline";

type Status = "enter" | "leave" | "switch-in" | "switch-out" | "hidden";

function statusOf(id: string, state: FlyoutState): Status {
  if (id === state.active) {
    if (state.mode === "leave") return "leave";
    return state.mode === "enter" ? "enter" : "switch-in";
  }
  return id === state.from ? "switch-out" : "hidden";
}

type Motion = { className?: string; style?: CSSProperties };

function timing(durationMs: number, delayMs = 0): CSSProperties {
  return {
    "--nav-duration": `${durationMs}ms`,
    "--nav-delay": `${delayMs}ms`,
    "--nav-ease": FLYOUT_EASE,
  } as CSSProperties;
}

function partMotion(
  status: Status,
  group: number,
  item: number,
  items: number,
): Motion {
  if (status === "enter") {
    return {
      className: "animate-nav-part-in",
      style: timing(PART_IN_MS, partInDelayMs(group, item)),
    };
  }
  if (status === "leave") {
    return {
      className: "animate-nav-part-out",
      style: timing(partOutMs(item, items)),
    };
  }
  return {};
}

function containerMotion(status: Status): Motion {
  switch (status) {
    case "switch-in":
      return { className: "animate-nav-fade-in", style: timing(SWITCH_MS) };
    case "switch-out":
      return {
        style: {
          opacity: 0,
          visibility: "hidden",
          transition: `opacity ${SWITCH_MS}ms ${FLYOUT_EASE}, visibility ${SWITCH_MS}ms step-end`,
        },
      };
    case "hidden":
      return { style: { opacity: 0, visibility: "hidden" } };
    default:
      return {};
  }
}

function partCount(group: FlyoutGroup): number {
  return 1 + (group.featured?.length ?? 0) + group.links.length;
}

function FlyoutLinkItem({
  link,
  className,
  onNavigate,
}: {
  link: FlyoutLink;
  className: string;
  onNavigate: () => void;
}) {
  return link.external ? (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={onNavigate}
    >
      {link.label}
    </a>
  ) : (
    <NextLink href={link.href} className={className} onClick={onNavigate}>
      {link.label}
    </NextLink>
  );
}

function Part({
  as: Tag,
  motion,
  className,
  children,
}: {
  as: "h2" | "li";
  motion: Motion;
  className: string;
  children: ReactNode;
}) {
  return (
    <Tag className={cn(className, motion.className)} style={motion.style}>
      {children}
    </Tag>
  );
}

function FlyoutContent({
  flyout,
  status,
  onNavigate,
  onHeight,
}: {
  flyout: Flyout;
  status: Status;
  onNavigate: () => void;
  onHeight: (id: string, height: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const items = Math.max(...flyout.groups.map(partCount));
  const container = containerMotion(status);
  const part = (group: number, item: number) =>
    partMotion(status, group, item, items);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const report = () => onHeight(flyout.id, el.offsetHeight);
    report();
    const observer = new ResizeObserver(report);
    observer.observe(el);
    return () => observer.disconnect();
  }, [flyout.id, onHeight]);

  return (
    <div
      ref={ref}
      id={`nav-flyout-${flyout.id}`}
      className={cn("absolute inset-x-0 top-0", container.className)}
      style={container.style}
    >
      <div
        className={cn(
          "mx-auto flex w-[calc(100%-48px)] pt-10 pb-[84px]",
          FRAME_WIDTH,
        )}
      >
        {flyout.groups.map((group, g) => {
          let item = 1;
          return (
            <div
              key={group.title}
              className={group.featured ? "pr-[88px]" : "pr-[44px]"}
            >
              <Part
                as="h2"
                motion={part(g, item++)}
                className="text-[12px] leading-4 font-normal tracking-[-0.01em] text-fg-muted"
              >
                {group.title}
              </Part>
              <ul>
                {group.featured?.map((link, i) => (
                  <Part
                    as="li"
                    key={link.href}
                    motion={part(g, item++)}
                    className={cn("-mx-[11px]", i === 0 && "mt-[6px]")}
                  >
                    <FlyoutLinkItem
                      link={link}
                      className={FEATURED_LINK}
                      onNavigate={onNavigate}
                    />
                  </Part>
                ))}
                {group.links.map((link, i) => (
                  <Part
                    as="li"
                    key={link.href}
                    motion={part(g, item++)}
                    className={cn(
                      "-mx-[11px]",
                      i === 0 && (group.featured ? "mt-[14px]" : "mt-[10px]"),
                    )}
                  >
                    <FlyoutLinkItem
                      link={link}
                      className={LINK}
                      onNavigate={onNavigate}
                    />
                  </Part>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/*
 * The panel sits behind the bar from the top of the header and grows to the
 * open menu's height, so the bar and the menu read as one sheet. The curtain
 * starts at the header, leaving the top bar above it sharp, and takes no
 * pointer: moving onto it leaves the header, which closes the menu.
 */
export function NavFlyoutPanel({
  flyouts,
  state,
}: {
  flyouts: Flyout[];
  state: FlyoutState;
}) {
  const [heights, setHeights] = useState<Record<string, number>>({});
  const onHeight = useCallback((id: string, height: number) => {
    setHeights((prev) =>
      prev[id] === height ? prev : { ...prev, [id]: height },
    );
  }, []);

  const shown = state.active !== null;
  const opened = shown && state.mode !== "leave";
  const height = opened
    ? BAR_HEIGHT_PX + (heights[state.active!] ?? 0)
    : BAR_HEIGHT_PX;
  const transition =
    state.mode === "leave"
      ? `height ${PANEL_MS}ms ${FLYOUT_EASE} ${CLOSE_DELAY_MS}ms`
      : state.mode === "switch"
        ? `height ${SWITCH_MS}ms ${FLYOUT_EASE}`
        : `height ${PANEL_MS}ms ${FLYOUT_EASE}`;

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-dvh bg-[rgba(245,245,245,0.4)] backdrop-blur-[20px] dark:bg-black/40 motion-reduce:transition-none"
        style={{
          opacity: opened ? 1 : 0,
          visibility: opened ? "visible" : "hidden",
          transition: `opacity ${CURTAIN_MS}ms ${FLYOUT_EASE} ${CURTAIN_DELAY_MS}ms, visibility ${CURTAIN_MS}ms ${opened ? "step-start" : "step-end"} ${CURTAIN_DELAY_MS}ms`,
        }}
      />
      <div
        className="absolute inset-x-0 top-0 -z-10 overflow-hidden border-b border-line-strong bg-panel motion-reduce:transition-none"
        style={{
          height,
          visibility: shown ? "visible" : "hidden",
          transition: shown ? transition : "none",
        }}
      >
        <div className="relative" style={{ marginTop: BAR_HEIGHT_PX }}>
          {flyouts.map((flyout) => (
            <FlyoutContent
              key={flyout.id}
              flyout={flyout}
              status={statusOf(flyout.id, state)}
              onNavigate={state.close}
              onHeight={onHeight}
            />
          ))}
        </div>
      </div>
    </>
  );
}
