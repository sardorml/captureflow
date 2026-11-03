import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, it, vi } from "vitest";

vi.mock("../auth", () => ({ getAuth: async () => ({}) }));
vi.mock("../cf-env", () => ({ getAppWebEnv: async () => null }));
vi.mock("../recording/device-tokens", () => ({
  issueDeviceToken: async () => ({}),
  resolveDeviceTokenToUser: async () => null,
}));
vi.mock("./library", () => ({ LibraryError: class extends Error {} }));
vi.mock("./recording", () => ({
  SLIDE_LAYOUTS: ["cover"],
  SLIDE_THEMES: ["dark"],
  VOICES: ["luna"],
}));

const { createServer } = await import("./server");

async function listTools() {
  const server = createServer(
    {} as D1Database,
    {},
    {} as Parameters<typeof createServer>[2],
    "",
  );
  const client = new Client({ name: "test", version: "1" });
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
  return (await client.listTools()).tools;
}

describe("tool annotations", () => {
  it("states all three hints on every tool, as plugin review requires", async () => {
    const tools = await listTools();
    expect(tools.length).toBeGreaterThan(0);
    for (const tool of tools) {
      for (const hint of [
        "readOnlyHint",
        "destructiveHint",
        "openWorldHint",
      ] as const) {
        expect(typeof tool.annotations?.[hint], `${tool.name} ${hint}`).toBe(
          "boolean",
        );
      }
    }
  });

  it("never calls a read-only tool destructive", async () => {
    for (const tool of await listTools()) {
      if (tool.annotations?.readOnlyHint) {
        expect(tool.annotations.destructiveHint, tool.name).toBe(false);
      }
    }
  });
});
