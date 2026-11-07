// Measured on the reference nav; every duration is in milliseconds.
export const FLYOUT_EASE = "cubic-bezier(0.4, 0, 0.6, 1)";
export const HOVER_INTENT_MS = 130;
export const PANEL_MS = 240;
export const SWITCH_MS = 120;
export const CLOSE_DELAY_MS = 120;
export const CURTAIN_MS = 320;
export const CURTAIN_DELAY_MS = 80;
export const PART_IN_MS = 320;
export const BAR_HEIGHT_PX = 56;

// Columns after the first start 80 ms later, then 40 ms apart.
export function groupDelayMs(group: number): number {
  return Math.min(80 + (group - 1) * 40, group * 80);
}

// `item` counts from 1 at the column header.
export function partInDelayMs(group: number, item: number): number {
  return groupDelayMs(group) + item * 20 + 80;
}

// Later parts leave faster, so the column empties top-down together.
export function partOutMs(item: number, items: number): number {
  return Math.min(160 + 20 * (items - item), 240);
}

export const CLOSED_AFTER_MS = CLOSE_DELAY_MS + PANEL_MS;
