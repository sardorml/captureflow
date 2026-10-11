import { describe, expect, it } from "vitest";
import {
  inviteStatus,
  planLabel,
  summarizePlan,
  weeklyBuckets,
} from "./directory";

const NOW = Date.parse("2026-10-11T12:00:00Z");
const NOW_S = NOW / 1000;
const DAY_MS = 24 * 3600 * 1000;

describe("summarizePlan", () => {
  it("reports a free account", () => {
    expect(
      summarizePlan({ subscription: null, grant: null, nowMs: NOW }),
    ).toEqual({
      source: "free",
      isPro: false,
      label: "Free",
      subscriptionStatus: null,
      grantExpiresAt: null,
    });
  });

  it("prefers an active subscription over a grant", () => {
    const plan = summarizePlan({
      subscription: {
        variantId: "1849425",
        status: "active",
        currentPeriodEnd: null,
      },
      grant: { variantId: "1828191", expiresAt: null },
      nowMs: NOW,
    });
    expect(plan).toMatchObject({
      source: "subscription",
      isPro: true,
      label: "500 GB",
    });
  });

  it("falls to the grant when the subscription has lapsed, keeping its status", () => {
    const plan = summarizePlan({
      subscription: {
        variantId: "1849425",
        status: "expired",
        currentPeriodEnd: NOW_S - 10,
      },
      grant: { variantId: "1828191", expiresAt: NOW + DAY_MS },
      nowMs: NOW,
    });
    expect(plan).toEqual({
      source: "granted",
      isPro: true,
      label: "1 TB",
      subscriptionStatus: "expired",
      grantExpiresAt: NOW + DAY_MS,
    });
  });

  it("keeps a cancelled subscription until its period ends", () => {
    const sub = { variantId: "1849420", status: "cancelled" as const };
    expect(
      summarizePlan({
        subscription: { ...sub, currentPeriodEnd: NOW_S + 60 },
        grant: null,
        nowMs: NOW,
      }).isPro,
    ).toBe(true);
    expect(
      summarizePlan({
        subscription: { ...sub, currentPeriodEnd: NOW_S - 60 },
        grant: null,
        nowMs: NOW,
      }),
    ).toMatchObject({ source: "free", subscriptionStatus: "cancelled" });
  });

  it("treats an expired grant as free", () => {
    expect(
      summarizePlan({
        subscription: null,
        grant: { variantId: "1849420", expiresAt: NOW - 1 },
        nowMs: NOW,
      }).source,
    ).toBe("free");
  });
});

describe("planLabel", () => {
  it("names known plans and falls back to the smallest", () => {
    expect(planLabel("1828191")).toBe("1 TB");
    expect(planLabel("nope")).toBe("100 GB");
  });
});

describe("inviteStatus", () => {
  it("separates accepted, pending and expired", () => {
    expect(inviteStatus({ acceptedAt: 1, expiresAt: 0 }, NOW)).toBe("accepted");
    expect(inviteStatus({ acceptedAt: null, expiresAt: NOW + 1 }, NOW)).toBe(
      "pending",
    );
    expect(inviteStatus({ acceptedAt: null, expiresAt: NOW }, NOW)).toBe(
      "expired",
    );
  });
});

describe("weeklyBuckets", () => {
  const WEEK = 7 * DAY_MS;
  it("puts each timestamp in its week, oldest first", () => {
    expect(
      weeklyBuckets(
        [NOW - 1, NOW - DAY_MS, NOW - WEEK - 1, NOW - 3 * WEEK - 1],
        4,
        NOW,
      ),
    ).toEqual([1, 0, 1, 2]);
  });

  it("drops anything outside the window or in the future", () => {
    expect(weeklyBuckets([NOW + 5, NOW - 4 * WEEK], 4, NOW)).toEqual([
      0, 0, 0, 0,
    ]);
  });
});
