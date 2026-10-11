import { describe, expect, it, vi } from "vitest";
import { sendBatch, TransientSendError, type OutgoingEmail } from "./resend";

const email = (to: string): OutgoingEmail => ({
  to,
  subject: "Hi",
  html: "<p>Hi</p>",
  text: "Hi",
  unsubscribeUrl: `https://mail.example.com/unsubscribe?e=${to}`,
});

const base = {
  apiKey: "re_test",
  from: "CaptureFlow <updates@example.com>",
  emails: [email("a@x.com"), email("b@x.com")],
  idempotencyKey: "c1:",
  sleep: async () => {},
};

describe("sendBatch", () => {
  it("sends one batch with one-click unsubscribe headers", async () => {
    const fetcher = vi.fn(async () => new Response("{}", { status: 200 }));
    expect(await sendBatch({ ...base, fetcher })).toEqual([true, true]);
    const [url, init] = fetcher.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://api.resend.com/emails/batch");
    expect((init.headers as Record<string, string>)["idempotency-key"]).toBe(
      "c1:",
    );
    const body = JSON.parse(String(init.body));
    expect(body[0].headers["List-Unsubscribe"]).toBe(
      "<https://mail.example.com/unsubscribe?e=a@x.com>",
    );
    expect(body[0].headers["List-Unsubscribe-Post"]).toBe(
      "List-Unsubscribe=One-Click",
    );
  });

  it("falls back to single sends when the batch is rejected", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 422 }))
      .mockResolvedValueOnce(new Response("{}", { status: 200 }))
      .mockResolvedValueOnce(new Response("", { status: 422 }));
    expect(await sendBatch({ ...base, fetcher })).toEqual([true, false]);
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it("throws on rate limits and outages so the page is retried", async () => {
    const limited = vi.fn(async () => new Response("", { status: 429 }));
    await expect(
      sendBatch({ ...base, fetcher: limited }),
    ).rejects.toBeInstanceOf(TransientSendError);
    const offline = vi.fn(async () => {
      throw new Error("offline");
    });
    await expect(
      sendBatch({ ...base, fetcher: offline }),
    ).rejects.toBeInstanceOf(TransientSendError);
  });
});
