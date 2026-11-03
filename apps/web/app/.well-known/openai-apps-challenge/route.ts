import { getAppWebEnv } from "@/lib/cf-env";

export const dynamic = "force-dynamic";

// OpenAI reads this exact token to confirm we own the MCP server's domain.
export async function GET() {
  const token = (await getAppWebEnv())?.OPENAI_APPS_CHALLENGE?.trim();
  if (!token) return new Response(null, { status: 404 });
  return new Response(token, { headers: { "content-type": "text/plain" } });
}
