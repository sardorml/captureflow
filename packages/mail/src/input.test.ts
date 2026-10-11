import { describe, expect, it } from "vitest";
import { hydrateCampaignInput, hydrateMailerMessage } from "./input";

const ID = "0b9f6f3e-2d1c-4a5b-8c7d-6e5f4a3b2c1d";

function form(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

describe("hydrateCampaignInput", () => {
  it("trims and accepts a subject and body", () => {
    expect(
      hydrateCampaignInput(form({ subject: " Hi ", body: " Body " })),
    ).toEqual({
      ok: true,
      value: { subject: "Hi", body: "Body", audience: "all", emails: [] },
    });
  });

  it("rejects blanks, multi-line subjects and missing fields", () => {
    expect(hydrateCampaignInput(form({ subject: "", body: "x" })).ok).toBe(
      false,
    );
    expect(hydrateCampaignInput(form({ subject: "a\nb", body: "x" })).ok).toBe(
      false,
    );
    expect(hydrateCampaignInput(form({ subject: "a", body: "  " })).ok).toBe(
      false,
    );
    expect(hydrateCampaignInput(form({ subject: "a" })).ok).toBe(false);
  });
});

describe("hydrateCampaignInput recipients", () => {
  it("normalizes, dedupes and validates picked addresses", () => {
    const f = form({ subject: "a", body: "b", audience: "selected" });
    for (const r of ["B@x.com ", "b@x.com", "not-an-email", "c@x.com"]) {
      f.append("recipient", r);
    }
    expect(hydrateCampaignInput(f)).toEqual({
      ok: true,
      value: {
        subject: "a",
        body: "b",
        audience: "selected",
        emails: ["b@x.com", "c@x.com"],
      },
    });
  });

  it("refuses a selection with nobody in it", () => {
    expect(
      hydrateCampaignInput(
        form({ subject: "a", body: "b", audience: "selected" }),
      ).ok,
    ).toBe(false);
  });
});

describe("hydrateMailerMessage", () => {
  it("accepts page and test messages", () => {
    expect(
      hydrateMailerMessage({ kind: "page", campaignId: ID, after: "" }),
    ).toEqual({
      kind: "page",
      campaignId: ID,
      after: "",
    });
    expect(
      hydrateMailerMessage({ kind: "test", campaignId: ID, to: "a@b.c" })?.kind,
    ).toBe("test");
  });

  it("rejects anything else", () => {
    expect(hydrateMailerMessage(null)).toBeNull();
    expect(
      hydrateMailerMessage({ kind: "page", campaignId: "nope", after: "" }),
    ).toBeNull();
    expect(
      hydrateMailerMessage({ kind: "test", campaignId: ID, to: "nobody" }),
    ).toBeNull();
    expect(hydrateMailerMessage({ kind: "other", campaignId: ID })).toBeNull();
  });
});
