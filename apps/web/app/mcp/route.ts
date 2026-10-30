import { handleMcpRequest } from "@/lib/mcp/server";

export const dynamic = "force-dynamic";

// The MCP endpoint agents connect to; see lib/mcp/server.ts.
export const GET = handleMcpRequest;
export const POST = handleMcpRequest;
export const DELETE = handleMcpRequest;
