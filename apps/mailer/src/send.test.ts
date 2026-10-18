import { describe, expect, it, vi } from "vitest";
import {
  createCampaign,
  getCampaign,
  startCampaign,
  type MailerMessage,
} from "@captureflow/mail";
import { addUser, testD1 } from "@captureflow/mail/testing";
import { handleMessage, type MailerEnv } from "./send";

async function setup(users: number) {
  const db = testD1();
  for (let i = 0; i < users; i++) {
    await addUser(db, `u${String(i).padStart(3, "0")}@x.com`);
  }
  const id = await createCampaign(
    db,
    {
      subject: "News",
      body: "**Hi**",
      audience: "all",
      emails: [],
      createdBy: "owner@x.com",
    },
    1,
  );
  const queued: MailerMessage[] = [];
  const env: MailerEnv = {
    DB: db,
    MAIL_QUEUE: {
      send: async (m: MailerMessage) => void queued.push(m),
    } as unknown as Queue<MailerMessage>,
    RESEND_API_KEY: "re_test",
    MAIL_UNSUBSCRIBE_SECRET: "secret",
    MAILER_BASE_URL: "https://mail.example.com",
    MAIL_FROM: "CaptureFlow <updates@example.com>",
    MAIL_REPLY_TO: "support@example.com",
  };
  return { db, id, env, queued };
}

const ok = () => vi.fn(async () => new Response("{}", { status: 200 }));

describe("handleMessage", () => {
  it("sends a full page, then queues the next one", async () => {
    const { db, id, env, queued } = await setup(101);
    await startCampaign(db, id, 2);
    const fetcher = ok();
    await handleMessage(
      env,
      { kind: "page", campaignId: id, after: "" },
      { fetcher, now: () => 3 },
    );
    const sent = JSON.parse(
      String(
        (fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].body,
      ),
    );
    expect(sent).toHaveLength(100);
    expect(sent[0].to).toEqual(["u000@x.com"]);
    expect(sent[0].reply_to).toBe("support@example.com");
    expect(sent[0].text).toContain(
      "https://mail.example.com/unsubscribe?e=u000%40x.com",
    );
    expect(queued).toEqual([
      { kind: "page", campaignId: id, after: "u099@x.com" },
    ]);
    expect((await getCampaign(db, id))?.status).toBe("sending");

    await handleMessage(env, queued[0]!, { fetcher, now: () => 4 });
    expect(await getCampaign(db, id)).toMatchObject({
      status: "sent",
      sentCount: 101,
      finishedAt: 4,
    });
  });

  it("does nothing for a campaign that isn't sending", async () => {
    const { id, env, queued } = await setup(3);
    const fetcher = ok();
    await handleMessage(
      env,
      { kind: "page", campaignId: id, after: "" },
      { fetcher },
    );
    expect(fetcher).not.toHaveBeenCalled();
    expect(queued).toEqual([]);
  });

  it("leaves no deliveries behind when Resend is down, so a retry resends", async () => {
    const { db, id, env } = await setup(3);
    await startCampaign(db, id, 2);
    const down = vi.fn(async () => new Response("", { status: 503 }));
    await expect(
      handleMessage(
        env,
        { kind: "page", campaignId: id, after: "" },
        { fetcher: down },
      ),
    ).rejects.toThrow();
    expect((await getCampaign(db, id))?.sentCount).toBe(0);
  });

  it("sends a test to one address with a marked subject, even for a draft", async () => {
    const { id, env } = await setup(3);
    const fetcher = ok();
    await handleMessage(
      env,
      { kind: "test", campaignId: id, to: "me@x.com" },
      { fetcher },
    );
    const body = JSON.parse(
      String(
        (fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].body,
      ),
    );
    expect(body.to).toEqual(["me@x.com"]);
    expect(body.subject).toBe("[Test] News");
  });
});
