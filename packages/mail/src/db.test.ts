import { describe, expect, it } from "vitest";
import {
  addUnsubscribe,
  countRecipients,
  listAudience,
  selectedEmails,
  createCampaign,
  finishCampaign,
  getCampaign,
  nextRecipients,
  recordDeliveries,
  startCampaign,
  updateDraft,
} from "./db";
import { addUser, testD1 } from "./testing/d1";

const ALL = { subject: "Hi", body: "B", audience: "all" as const, emails: [] };

async function seeded() {
  const db = testD1();
  for (const email of ["c@x.com", "A@x.com", "b@x.com", "d@x.com"]) {
    await addUser(db, email);
  }
  const id = await createCampaign(
    db,
    {
      subject: "Hi",
      body: "Body",
      audience: "all",
      emails: [],
      createdBy: "owner@x.com",
    },
    1,
  );
  return { db, id };
}

describe("campaign lifecycle", () => {
  it("edits only drafts and starts exactly once", async () => {
    const { db, id } = await seeded();
    expect(await updateDraft(db, id, { ...ALL, subject: "New" })).toBe(true);
    expect(await startCampaign(db, id, 2)).toBe(true);
    expect(await startCampaign(db, id, 3)).toBe(false);
    expect(await updateDraft(db, id, { ...ALL, subject: "Late" })).toBe(false);
    await finishCampaign(db, id, 4);
    expect(await getCampaign(db, id)).toMatchObject({
      subject: "New",
      status: "sent",
      startedAt: 2,
      finishedAt: 4,
    });
  });
});

describe("recipients", () => {
  it("pages lowercased addresses in order and skips unsubscribes", async () => {
    const { db, id } = await seeded();
    await addUnsubscribe(db, "c@x.com", 1);
    expect(await countRecipients(db)).toBe(3);
    expect(await nextRecipients(db, id, "", 2)).toEqual(["a@x.com", "b@x.com"]);
    expect(await nextRecipients(db, id, "b@x.com", 2)).toEqual(["d@x.com"]);
  });

  it("never returns an address this campaign already reached", async () => {
    const { db, id } = await seeded();
    await recordDeliveries(
      db,
      id,
      [
        { email: "a@x.com", ok: true },
        { email: "b@x.com", ok: false },
      ],
      5,
    );
    expect(await nextRecipients(db, id, "", 10)).toEqual([
      "c@x.com",
      "d@x.com",
    ]);
    expect(await getCampaign(db, id)).toMatchObject({
      sentCount: 1,
      failedCount: 1,
    });
  });
});

describe("selected audience", () => {
  it("sends only to picked accounts that haven't unsubscribed", async () => {
    const { db, id } = await seeded();
    await updateDraft(db, id, {
      ...ALL,
      audience: "selected",
      emails: ["b@x.com", "d@x.com", "gone@x.com"],
    });
    await addUnsubscribe(db, "d@x.com", 1);
    expect(await selectedEmails(db, id)).toEqual([
      "b@x.com",
      "d@x.com",
      "gone@x.com",
    ]);
    expect(await countRecipients(db, id)).toBe(1);
    expect(await nextRecipients(db, id, "", 10)).toEqual(["b@x.com"]);
  });

  it("drops the selection when switched back to everyone", async () => {
    const { db, id } = await seeded();
    await updateDraft(db, id, {
      ...ALL,
      audience: "selected",
      emails: ["b@x.com"],
    });
    await updateDraft(db, id, ALL);
    expect(await selectedEmails(db, id)).toEqual([]);
    expect(await countRecipients(db, id)).toBe(4);
  });

  it("can't change who a started campaign goes to", async () => {
    const { db, id } = await seeded();
    await updateDraft(db, id, {
      ...ALL,
      audience: "selected",
      emails: ["b@x.com"],
    });
    await startCampaign(db, id, 2);
    await updateDraft(db, id, {
      ...ALL,
      audience: "selected",
      emails: ["c@x.com"],
    });
    expect(await selectedEmails(db, id)).toEqual(["b@x.com"]);
  });

  it("lists every account for the picker, flagging unsubscribes", async () => {
    const { db } = await seeded();
    await addUnsubscribe(db, "c@x.com", 1);
    const audience = await listAudience(db);
    expect(audience.map((a) => a.email)).toEqual([
      "a@x.com",
      "b@x.com",
      "c@x.com",
      "d@x.com",
    ]);
    expect(audience.find((a) => a.email === "c@x.com")?.unsubscribed).toBe(
      true,
    );
  });
});
