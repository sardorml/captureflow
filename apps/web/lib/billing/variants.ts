import type { SeatPlanId } from "@captureflow/quota";

export type SeatCycle = "monthly" | "annual";
export type SeatVariant = { plan: SeatPlanId; cycle: SeatCycle };

export type SeatVariantEnv = Partial<
  Record<`LEMON_${"LIGHT" | "PRO"}_${"MONTHLY" | "ANNUAL"}_VARIANT_ID`, string>
>;

function variantTable(
  env: SeatVariantEnv,
): [string | undefined, SeatVariant][] {
  return [
    [env.LEMON_LIGHT_MONTHLY_VARIANT_ID, { plan: "light", cycle: "monthly" }],
    [env.LEMON_LIGHT_ANNUAL_VARIANT_ID, { plan: "light", cycle: "annual" }],
    [env.LEMON_PRO_MONTHLY_VARIANT_ID, { plan: "pro", cycle: "monthly" }],
    [env.LEMON_PRO_ANNUAL_VARIANT_ID, { plan: "pro", cycle: "annual" }],
  ];
}

export function seatVariant(
  env: SeatVariantEnv,
  variantId: string,
): SeatVariant | null {
  return variantTable(env).find(([id]) => id && id === variantId)?.[1] ?? null;
}

export function variantIdFor(
  env: SeatVariantEnv,
  target: SeatVariant,
): string | null {
  return (
    variantTable(env).find(
      ([id, v]) => id && v.plan === target.plan && v.cycle === target.cycle,
    )?.[0] ?? null
  );
}
