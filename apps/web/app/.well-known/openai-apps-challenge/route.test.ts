import { beforeEach, describe, expect, it, vi } from "vitest";

const env = vi.hoisted(() => ({ value: {} as Record<string, string> }));
vi.mock("@/lib/cf-env", () => ({ getAppWebEnv: async () => env.value }));

const { GET } = await import("./route");

describe("openai-apps-challenge", () => {
  beforeEach(() => {
    env.value = {};
  });

  it("is a 404 until a token is set", async () => {
    expect((await GET()).status).toBe(404);
  });

  it("returns only the token, as plain text", async () => {
    env.value = { OPENAI_APPS_CHALLENGE: " abc123\n" };
    const res = await GET();
    expect(res.headers.get("content-type")).toBe("text/plain");
    expect(await res.text()).toBe("abc123");
  });
});
