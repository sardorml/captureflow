import { describe, expect, it } from "vitest";
import {
  type RawActivityEvent,
  describeEvent,
  groupSessions,
  pageLabel,
  rowToEvent,
  summarizeActivity,
  userActivityQuery,
} from "./user-activity";

function ev(over: Partial<RawActivityEvent>): RawActivityEvent {
  return {
    id: Math.random().toString(36),
    event: "$pageview",
    at: 0,
    sessionId: "s1",
    path: "/",
    host: "captureflow.dev",
    text: null,
    tag: null,
    eventType: null,
    subject: null,
    detail: null,
    browser: "Chrome",
    os: "Mac OS X",
    deviceType: "Desktop",
    city: "Tashkent",
    country: "UZ",
    errorMessage: null,
    lib: "web",
    ...over,
  };
}

describe("pageLabel", () => {
  it("names known pages and drops the locale", () => {
    expect(pageLabel("/recordings/abc/edit")).toBe("Recording editor");
    expect(pageLabel("/es/pricing")).toBe("Pricing");
    expect(pageLabel("/es")).toBe("Home");
    expect(pageLabel("/unknown")).toBe("/unknown");
  });
});

describe("describeEvent", () => {
  it("turns clicks and server events into plain words", () => {
    expect(
      describeEvent(
        ev({ event: "$autocapture", text: "Google", eventType: "click" }),
      ),
    ).toEqual({ kind: "click", text: "Clicked", subject: "“Google”" });
    expect(
      describeEvent(ev({ event: "cf:recording.rename", subject: "Demo" })),
    ).toEqual({
      kind: "recording",
      text: "Renamed a recording to",
      subject: "Demo",
    });
    expect(describeEvent(ev({ event: "$web_vitals" }))).toBeNull();
  });
});

describe("groupSessions", () => {
  it("groups by session, folds repeats and attaches server events", () => {
    const sessions = groupSessions(
      [
        ev({ at: 1000, path: "/login" }),
        ev({ at: 2000, path: "/login" }),
        ev({
          at: 3000,
          event: "cf:account.sign_in",
          sessionId: null,
          lib: "captureflow-server",
        }),
        ev({ at: 10_000_000, sessionId: "s2", path: "/recordings" }),
      ],
      (id) => `replay/${id}`,
    );
    expect(sessions).toHaveLength(2);
    expect(sessions[0]!.id).toBe("s2");
    const first = sessions[1]!;
    expect(first.replayUrl).toBe("replay/s1");
    expect(first.place).toBe("Tashkent, UZ");
    expect(first.steps.map((s) => [s.text, s.count])).toEqual([
      ["Opened", 2],
      ["Signed in", 1],
    ]);
    const summary = summarizeActivity(sessions, 30, false);
    expect(summary.totals.pages).toBe(3);
    expect(summary.totals.actions).toBe(1);
    expect(summary.topPages[0]).toEqual({ label: "Sign-in page", count: 2 });
  });
});

describe("userActivityQuery", () => {
  it("escapes the email and skips noise", () => {
    const q = userActivityQuery("O'Neil@x.com", 30);
    expect(q).toContain("'o\\'neil@x.com'");
    expect(q).toContain("'$web_vitals'");
  });
});

describe("rowToEvent", () => {
  it("treats empty strings as missing", () => {
    const e = rowToEvent([
      "id",
      "$pageview",
      "2026-11-24T07:20:26Z",
      "s",
      "/",
      "h",
      "",
      "",
    ]);
    expect(e.text).toBeNull();
    expect(e.at).toBe(Date.parse("2026-11-24T07:20:26Z"));
  });
});
