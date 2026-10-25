const APP_ROUTE_SEGMENTS = new Set([
  "api",
  "billing",
  "devices",
  "members",
  "notifications",
  "profile",
  "recordings",
  "screenshots",
  "settings",
  "workspaces",
]);

export function isAppRoute(pathname: string): boolean {
  return APP_ROUTE_SEGMENTS.has(pathname.split("/")[1] ?? "");
}
