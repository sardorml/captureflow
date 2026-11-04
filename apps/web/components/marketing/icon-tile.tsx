import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CARD_SNAP, FRAME_CARD, FRAME_CELL, FRAME_CELLS } from "./frame";

export type IconTileItem = {
  key: string;
  title: string;
  body: string;
  Icon: LucideIcon;
  color: string;
};

const ARC_MOTION =
  "absolute border transition-[scale,border-color] duration-[120ms] ease-out group-hover/card:[transition-duration:120ms,0ms] motion-reduce:transition-none motion-safe:group-hover/card:scale-[1.03]";
const ARCS = [
  "-right-[92px] -bottom-[100px] size-64 rounded-[100px] border-[color-mix(in_oklab,var(--cf-fg)_7%,transparent)] group-hover/card:border-[color-mix(in_oklab,var(--cf-fg)_11%,transparent)]",
  "-right-[68px] -bottom-[76px] size-52 rounded-[76px] border-[color-mix(in_oklab,var(--cf-fg)_10%,transparent)] group-hover/card:border-[color-mix(in_oklab,var(--cf-fg)_15%,transparent)]",
  "-right-11 -bottom-[52px] size-40 rounded-[52px] border-[color-mix(in_oklab,var(--cf-fg)_13%,transparent)] group-hover/card:border-[color-mix(in_oklab,var(--cf-fg)_19%,transparent)]",
];
const FADE_DOWN: CSSProperties = {
  maskImage: "linear-gradient(transparent 28%, #000 50%)",
};
const FADE_OUT: CSSProperties = {
  maskImage:
    "radial-gradient(circle at calc(100% - 36px) calc(100% - 28px), #000 80px, transparent 176px)",
};

export function IconTileGrid({ items }: { items: readonly IconTileItem[] }) {
  return (
    <ul className={cn(FRAME_CELLS, "list-none grid-cols-2 lg:grid-cols-4")}>
      {items.map(({ key, title, body, Icon, color }) => (
        <li key={key} className={cn(FRAME_CELL, FRAME_CARD, "relative h-40")}>
          <div
            aria-hidden
            className="absolute inset-0 max-sm:translate-y-3"
            style={FADE_DOWN}
          >
            <div className="absolute inset-0" style={FADE_OUT}>
              {ARCS.map((arc) => (
                <span key={arc} className={cn(ARC_MOTION, arc)} />
              ))}
            </div>
          </div>
          <div
            aria-hidden
            className="absolute top-[76px] -right-5 size-28 rounded-[28px] border border-[color-mix(in_oklab,var(--cf-fg)_10%,transparent)] bg-canvas bg-linear-to-b from-transparent to-[color-mix(in_oklab,var(--cf-fg)_3%,transparent)] shadow-[0_1px_2px_rgb(0_0_0/0.05),0_4px_14px_-2px_rgb(0_0_0/0.08)] transition-[translate,border-color] duration-300 ease-out group-hover/card:border-[color-mix(in_oklab,var(--cf-fg)_20%,transparent)] motion-reduce:transition-none motion-safe:group-hover/card:-translate-y-1 max-sm:top-[88px] dark:from-[color-mix(in_oklab,var(--cf-fg)_6%,transparent)] dark:to-[color-mix(in_oklab,var(--cf-fg)_1%,transparent)] dark:shadow-[0_4px_14px_-2px_rgb(0_0_0/0.6)]"
          >
            <span className="absolute inset-1.5 rounded-[22px] border border-[color-mix(in_oklab,var(--cf-fg)_5%,transparent)]" />
            <Icon
              strokeWidth={1.5}
              className={cn(
                "absolute top-[18px] left-[22px] size-12 scale-110 opacity-0 blur-[24px] transition-opacity group-hover/card:opacity-30 motion-reduce:transition-none",
                CARD_SNAP,
                color,
              )}
            />
            <Icon
              strokeWidth={1.5}
              className={cn(
                "absolute top-[18px] left-[22px] size-12 transition-[filter,opacity] group-hover/card:opacity-100 group-hover/card:brightness-100 group-hover/card:contrast-100 group-hover/card:grayscale-0 motion-reduce:transition-none [@media(hover:hover)]:opacity-85 [@media(hover:hover)]:brightness-[0.6] [@media(hover:hover)]:contrast-125 [@media(hover:hover)]:grayscale dark:[@media(hover:hover)]:brightness-[1.5]",
                CARD_SNAP,
                color,
              )}
            />
          </div>
          <div className="relative p-5">
            <h3 className="text-[15px] leading-5 font-medium text-fg-strong">
              {title}
            </h3>
            <p className="mt-0.5 text-xs leading-4 text-fg-muted">{body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
