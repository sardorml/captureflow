import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js";
import type { Credentials } from "./config";

// The hosted tools that read the user's library; recording happens here instead.
const LIBRARY_TOOLS = new Set([
  "list_workspaces",
  "list_recordings",
  "search_recordings",
  "get_recording",
  "get_transcript",
  "set_visibility",
]);

export type Library = ReturnType<typeof createLibrary>;

export function createLibrary(base: string, version: string) {
  let connection: Promise<{ client: Client; tools: Tool[] }> | null = null;

  function connect(creds: Credentials) {
    connection ??= (async () => {
      const client = new Client({ name: "captureflow-local", version });
      await client.connect(
        new StreamableHTTPClientTransport(new URL(`${base}/mcp`), {
          requestInit: { headers: { authorization: `Bearer ${creds.token}` } },
        }),
      );
      const { tools } = await client.listTools();
      return { client, tools: tools.filter((t) => LIBRARY_TOOLS.has(t.name)) };
    })();
    connection.catch(() => (connection = null));
    return connection;
  }

  return {
    has: (name: string) => LIBRARY_TOOLS.has(name),
    // Without a sign-in, or with the site unreachable, the library tools are simply absent.
    async tools(creds: Credentials | null): Promise<Tool[]> {
      if (!creds) return [];
      return (await connect(creds).catch(() => null))?.tools ?? [];
    },
    async call(
      creds: Credentials,
      name: string,
      args: Record<string, unknown>,
    ): Promise<CallToolResult> {
      const { client } = await connect(creds);
      return (await client.callTool({
        name,
        arguments: args,
      })) as CallToolResult;
    },
    reset() {
      void connection?.then((c) => c.client.close()).catch(() => {});
      connection = null;
    },
  };
}
