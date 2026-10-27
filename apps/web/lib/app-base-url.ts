import { getAppWebEnv } from "@/lib/cf-env";
import { APP_WEB_SITE_URL } from "@/lib/site";

/*
 * APP_WEB_PUBLIC_URL is a Worker var (and .dev.vars locally), so it is only
 * visible on the request-scoped env, never on process.env.
 */
export async function getAppBaseUrl(): Promise<string> {
  const env = await getAppWebEnv();
  return env?.APP_WEB_PUBLIC_URL || APP_WEB_SITE_URL;
}
