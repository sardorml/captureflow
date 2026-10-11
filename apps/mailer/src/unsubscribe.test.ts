import { describe, expect, it } from "vitest";
import { countRecipients, unsubscribeUrl } from "@captureflow/mail";
import { addUser, testD1 } from "@captureflow/mail/testing";
import { handleUnsubscribe } from "./unsubscribe";

async function setup() {
  const db = testD1();
  await addUser(db, "ada@x.com");
  const link = await unsubscribeUrl(
    "https://mail.example.com",
    "secret",
    "ada@x.com",
  );
  return { db, link };
}

describe("handleUnsubscribe", () => {
  it("only confirms on GET, so link scanners can't unsubscribe anyone", async () => {
    const { db, link } = await setup();
    const res = await handleUnsubscribe(new Request(link), db, "secret", 1);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('<form method="post"');
    expect(await countRecipients(db)).toBe(1);
  });

  it("unsubscribes on POST, which is also the one-click request", async () => {
    const { db, link } = await setup();
    const res = await handleUnsubscribe(
      new Request(link, { method: "POST" }),
      db,
      "secret",
      1,
    );
    expect(await res.text()).toContain("unsubscribed");
    expect(await countRecipients(db)).toBe(0);
  });

  it("rejects a forged or mismatched link", async () => {
    const { db, link } = await setup();
    const forged = link.replace("ada%40x.com", "bob%40x.com");
    const res = await handleUnsubscribe(
      new Request(forged, { method: "POST" }),
      db,
      "secret",
      1,
    );
    expect(res.status).toBe(400);
    expect(await countRecipients(db)).toBe(1);
  });
});
