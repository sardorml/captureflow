"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  drainSplitStamps,
  formatSplitTime,
  getServerSplitLoads,
  getSplitLoads,
  subscribeSplitLoads,
} from "@/lib/dev/split-loads";

type Box = {
  key: string;
  name: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

function hueOf(name: string) {
  let hue = 0;
  for (const char of name) hue = (hue * 31 + char.charCodeAt(0)) % 360;
  return hue;
}

// A data-split wrapper is usually display:contents, so it has no box of its
// own; the union of its children's boxes stands in.
function boxOf(el: HTMLElement): DOMRect | null {
  const own = el.getBoundingClientRect();
  if (own.width > 0 || own.height > 0) return own;
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const child of el.children) {
    const rect = child.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;
    left = Math.min(left, rect.left);
    top = Math.min(top, rect.top);
    right = Math.max(right, rect.right);
    bottom = Math.max(bottom, rect.bottom);
  }
  if (left === Infinity) return null;
  return new DOMRect(left, top, right - left, bottom - top);
}

function measure(): Box[] {
  const boxes: Box[] = [];
  document.querySelectorAll<HTMLElement>("[data-split]").forEach((el, i) => {
    const name = el.dataset.split;
    const rect = name ? boxOf(el) : null;
    if (!name || !rect || rect.width < 1 || rect.height < 1) return;
    boxes.push({
      key: `${name}:${i}`,
      name,
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    });
  });
  return boxes;
}

export function CodeSplitOverlay() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const { navAt, loads } = useSyncExternalStore(
    subscribeSplitLoads,
    getSplitLoads,
    getServerSplitLoads,
  );

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      frame = 0;
      drainSplitStamps();
      setBoxes(measure());
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    schedule();
    const interval = setInterval(schedule, 250);
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      clearInterval(interval);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const stateOf = (name: string) => {
    const load = loads.find((l) => l.name === name);
    return load ? formatSplitTime(load.at, navAt) : "loading…";
  };

  return createPortal(
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[10000] font-mono text-[11px] leading-none"
    >
      {boxes.map((box) => {
        const hue = hueOf(box.name);
        return (
          <div
            key={box.key}
            className="absolute"
            style={{
              left: box.left,
              top: box.top,
              width: box.width,
              height: box.height,
              outline: `2px dashed hsl(${hue} 85% 50%)`,
              outlineOffset: -2,
              background: `hsl(${hue} 85% 50% / 0.06)`,
            }}
          >
            <span
              className="absolute top-0 left-0 max-w-full truncate rounded-br px-1.5 py-1 text-white"
              style={{ background: `hsl(${hue} 85% 38%)` }}
            >
              {box.name} · {stateOf(box.name)}
            </span>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
