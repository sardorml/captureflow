import type { ComponentType, CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CARD_GRAY,
  CARD_ZOOM,
  FRAME_CARD,
  FRAME_CELL,
  FRAME_CELLS,
} from "./frame";

export type PreviewTileItem = {
  key: string;
  title: string;
  body: string;
  Icon: LucideIcon;
  color: string;
  Preview: ComponentType;
};

const ARC_MOTION =
  "absolute border transition-[scale,border-color] duration-300 ease-out motion-reduce:transition-none motion-safe:group-hover/card:scale-[1.03]";
const ARCS = [
  "-right-[72px] -bottom-20 h-54 w-72 rounded-[64px] border-[color-mix(in_oklab,var(--cf-fg)_9%,transparent)] group-hover/card:border-[color-mix(in_oklab,var(--cf-fg)_14%,transparent)]",
  "-right-12 -bottom-14 h-42 w-60 rounded-[40px] border-[color-mix(in_oklab,var(--cf-fg)_12%,transparent)] group-hover/card:border-[color-mix(in_oklab,var(--cf-fg)_18%,transparent)]",
];
const ARC_MASK: CSSProperties = {
  maskImage:
    "linear-gradient(to top, #000 50%, transparent 72%), radial-gradient(circle at calc(100% - 72px) calc(100% - 28px), #000 192px, transparent 288px)",
  maskComposite: "intersect",
};

export function PreviewTileGrid({
  items,
}: {
  items: readonly PreviewTileItem[];
}) {
  return (
    <ul className={cn(FRAME_CELLS, "list-none grid-cols-2 lg:grid-cols-4")}>
      {items.map(({ key, title, body, Icon, color, Preview }) => (
        <li key={key} className={cn(FRAME_CELL, FRAME_CARD, "relative h-40")}>
          <div
            aria-hidden
            className="absolute inset-0 max-sm:translate-y-3"
            style={ARC_MASK}
          >
            {ARCS.map((arc) => (
              <span key={arc} className={cn(ARC_MOTION, arc)} />
            ))}
          </div>
          <div
            aria-hidden
            className="absolute top-[72px] -right-6 h-[120px] w-48 overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--cf-fg)_10%,transparent)] shadow-[0_1px_2px_rgb(0_0_0/0.05),0_4px_14px_-2px_rgb(0_0_0/0.08)] transition-[translate,border-color] duration-300 ease-out group-hover/card:border-[color-mix(in_oklab,var(--cf-fg)_20%,transparent)] motion-reduce:transition-none motion-safe:group-hover/card:-translate-y-1 max-sm:top-[84px] dark:shadow-[0_4px_14px_-2px_rgb(0_0_0/0.6)]"
          >
            <div className={cn(CARD_ZOOM, CARD_GRAY, "size-full")}>
              <Preview />
            </div>
          </div>
          <Icon
            aria-hidden
            className={cn(
              "absolute top-[22px] right-5 size-4 transition-colors duration-300 motion-reduce:transition-none [@media(hover:hover)]:not-group-hover/card:text-fg-muted",
              color,
            )}
          />
          <div className="relative p-5">
            <h3 className="pr-6 text-[15px] leading-5 font-medium text-fg-strong">
              {title}
            </h3>
            <p className="mt-0.5 text-xs leading-4 text-fg-muted">{body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
