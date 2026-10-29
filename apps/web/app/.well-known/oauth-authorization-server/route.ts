import { oAuthDiscoveryMetadata } from "better-auth/plugins";
import { getAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// MCP clients discover where to sign in here, at the site root.
export async function GET(req: Request) {
  return oAuthDiscoveryMetadata(await getAuth())(req);
}
