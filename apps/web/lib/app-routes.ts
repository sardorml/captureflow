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
]);

export function isMarketingRoute(pathname: string): boolean {
  return MARKETING_ROUTE_SEGMENTS.has(pathname.split("/")[1] ?? "");
}
