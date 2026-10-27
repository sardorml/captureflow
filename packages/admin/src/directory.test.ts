import { describe, expect, it } from "vitest";
import {
  inviteStatus,
  summarizePlan,
  weeklyBuckets,
  workspacePlan,
} from "./directory";

const NOW = Date.parse("2026-10-11T12:00:00Z");
const NOW_S = NOW / 1000;
const DAY_MS = 24 * 3600 * 1000;

describe("summarizePlan", () => {
  it("is Team while the user holds a seat in a paid workspace", () => {
    expect(
      summarizePlan({ inPaidWorkspace: true, subscriptionStatus: "active" }),
    ).toEqual({ tier: "team", subscriptionStatus: "active" });
  });

  it("keeps a lapsed subscription's status on a free user", () => {
    expect(
      summarizePlan({ inPaidWorkspace: false, subscriptionStatus: "expired" }),
    ).toEqual({ tier: "free", subscriptionStatus: "expired" });
  });
});

describe("workspacePlan", () => {
  const sub = {
    quantity: 4,
    status: "active" as const,
    plan: "pro",
    cycle: "monthly",
    currentPeriodEnd: NOW_S + 60,
  };

  it("reports the seats of an active subscription", () => {
    expect(workspacePlan(sub, NOW)).toEqual({
      tier: "team",
      plan: "pro",
      seats: 4,
      status: "active",
      cycle: "monthly",
      currentPeriodEnd: NOW_S + 60,
    });
  });

  it("keeps a cancelled subscription until its period ends", () => {
    const cancelled = { ...sub, status: "cancelled" as const };
    expect(workspacePlan(cancelled, NOW).tier).toBe("team");
    expect(
      workspacePlan({ ...cancelled, currentPeriodEnd: NOW_S - 60 }, NOW),
    ).toMatchObject({ tier: "free", seats: 0, status: "cancelled" });
  });

  it("is free without a subscription", () => {
    expect(workspacePlan(null, NOW)).toEqual({
      tier: "free",
      plan: null,
      seats: 0,
      status: null,
      cycle: null,
      currentPeriodEnd: null,
    });
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
