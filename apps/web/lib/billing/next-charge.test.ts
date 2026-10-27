import { describe, expect, it } from "vitest";
import { estimateNextCharge, periodStartOf } from "./next-charge";

const NOV_27 = Date.UTC(2026, 10, 27);
const OCT_27 = Date.UTC(2026, 9, 27);
const MID = OCT_27 + (NOV_27 - OCT_27) / 2;

describe("periodStartOf", () => {
  it("steps back one calendar month or year", () => {
    expect(periodStartOf(NOV_27, "monthly")).toBe(OCT_27);
    expect(periodStartOf(NOV_27, "annual")).toBe(Date.UTC(2025, 10, 27));
  });
});

describe("estimateNextCharge", () => {
  const base = {
    plan: "light" as const,
    cycle: "monthly" as const,
    periodEndMs: NOV_27,
  };

  it("is the plain seat price with no changes this period", () => {
    expect(estimateNextCharge({ ...base, quantity: 3, changes: [] })).toEqual({
      base: 15,
      prorated: 0,
      total: 15,
      seatsAdded: 0,
      seatsRemoved: 0,
    });
  });

  it("adds half a seat's price for a seat added mid-period", () => {
    const charge = estimateNextCharge({
      ...base,
      quantity: 4,
      changes: [{ from_quantity: 3, to_quantity: 4, changed_at: MID }],
    });
    expect(charge).toMatchObject({
      base: 20,
      prorated: 2.5,
      total: 22.5,
      seatsAdded: 1,
    });
  });

  it("credits a removed seat and nets mixed changes", () => {
    const charge = estimateNextCharge({
      ...base,
      quantity: 3,
      changes: [
        { from_quantity: 3, to_quantity: 4, changed_at: OCT_27 },
        { from_quantity: 4, to_quantity: 3, changed_at: MID },
      ],
    });
    expect(charge).toMatchObject({
      base: 15,
      prorated: 2.5,
      seatsAdded: 1,
      seatsRemoved: 1,
    });
  });

  it("ignores changes from an earlier period, already billed", () => {
    const charge = estimateNextCharge({
      ...base,
      quantity: 4,
      changes: [{ from_quantity: 3, to_quantity: 4, changed_at: OCT_27 - 1 }],
    });
    expect(charge.prorated).toBe(0);
  });

  it("prorates over the year on annual plans", () => {
    const yearStart = Date.UTC(2025, 10, 27);
    const charge = estimateNextCharge({
      ...base,
      cycle: "annual",
      quantity: 2,
      changes: [
        {
          from_quantity: 1,
          to_quantity: 2,
          changed_at: yearStart + (NOV_27 - yearStart) / 2,
        },
      ],
    });
    expect(charge).toMatchObject({ base: 96, prorated: 24, total: 120 });
  });
});
