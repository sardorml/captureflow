import { oAuthProtectedResourceMetadata } from "better-auth/plugins";
import { getAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return oAuthProtectedResourceMetadata(await getAuth())(req);
}
