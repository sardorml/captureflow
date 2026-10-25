export type StorageTone = "ok" | "near" | "full";

export type StorageFill = { ratio: number; tone: StorageTone };

export const NEAR_FULL_RATIO = 0.8;

// null limit means unlimited: nothing to fill.
export function storageFill(
  usedBytes: number,
  limitBytes: number | null,
): StorageFill | null {
  if (limitBytes === null) return null;
  if (limitBytes <= 0) return { ratio: 1, tone: "full" };
  const ratio = Math.min(1, Math.max(0, usedBytes / limitBytes));
  const tone: StorageTone =
    usedBytes >= limitBytes ? "full" : ratio >= NEAR_FULL_RATIO ? "near" : "ok";
  return { ratio, tone };
}
