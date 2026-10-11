import { describe, expect, it, vi } from "vitest";
import { sendTransactional } from "./transactional";

const email = {
  to: "them@example.com",
  subject: "Hi",
  html: "<p>Hi</p>",
  text: "Hi",
  replyTo: "sam@example.com",
};
const from = "CaptureFlow <hello@captureflow.dev>";

function okFetch() {
  return vi.fn(
    async (_url: RequestInfo | URL, _init?: RequestInit) =>
      new Response("{}", { status: 200 }),
  );
}

describe("sendTransactional", () => {
  it("sends through Cloudflare when bound, without touching Resend", async () => {
    const send = vi.fn(async () => ({ messageId: "m1" }));
    const fetcher = okFetch();
    const result = await sendTransactional(
      { from, binding: { send }, resendApiKey: "re_test", fetcher },
      email,
    );
    expect(result).toBe("cloudflare");
    expect(fetcher).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith({
      from: { name: "CaptureFlow", email: "hello@captureflow.dev" },
      to: "them@example.com",
      subject: "Hi",
      html: "<p>Hi</p>",
      text: "Hi",
      replyTo: "sam@example.com",
    });
  });

  it("falls back to Resend when Cloudflare throws", async () => {
    const send = vi.fn(async () => {
      throw Object.assign(new Error("nope"), { code: "E_SENDER_NOT_VERIFIED" });
    });
    const fetcher = okFetch();
    const result = await sendTransactional(
      { from, binding: { send }, resendApiKey: "re_test", fetcher },
      email,
    );
    expect(result).toBe("resend");
    const body = JSON.parse(String(fetcher.mock.calls[0][1]?.body));
    expect(body).toMatchObject({
      from,
      to: ["them@example.com"],
      reply_to: "sam@example.com",
    });
  });

  it("uses Resend alone when nothing is bound", async () => {
    const fetcher = okFetch();
    expect(
      await sendTransactional(
        { from, resendApiKey: "re_test", fetcher },
        email,
      ),
    ).toBe("resend");
  });

  it("reports failure when neither channel delivers", async () => {
    const fetcher = vi.fn(async () => new Response("", { status: 422 }));
    expect(
      await sendTransactional(
        { from, resendApiKey: "re_test", fetcher },
        email,
      ),
    ).toBeNull();
    expect(await sendTransactional({ from }, email)).toBeNull();
  });
});
