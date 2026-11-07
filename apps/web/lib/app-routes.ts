import { isLocalizedPath, splitLocale } from "./i18n/config";

const APP_ROUTE_SEGMENTS = new Set([
  "api",
  "billing",
  "dashboard",
  "devices",
  "members",
  "notifications",
  "profile",
  "recordings",
  "screenshots",
  "settings",
]);

export function isAppRoute(pathname: string): boolean {
  return APP_ROUTE_SEGMENTS.has(pathname.split("/")[1] ?? "");
}

const MARKETING_ROUTE_SEGMENTS = new Set([
  "",
  "alternatives",
  "blog",
  "download",
  "enterprise",
  "faq",
  "features",
  "pricing",
  "self-host-setup",
  "suggest-feature",
  "swarm-demo",
]);

// A translated page (/de/pricing) is the same marketing page in another language.
export function isMarketingRoute(pathname: string): boolean {
  const [locale, path] = splitLocale(pathname);
  if (locale) return isLocalizedPath(path);
  return MARKETING_ROUTE_SEGMENTS.has(pathname.split("/")[1] ?? "");
}
