// The canvas page itself, with or without a query or hash, not a longer path
// that merely starts the same way.
export function isCanvasUrl(
  url: string | undefined,
  canvasUrl: string,
): boolean {
  if (!url?.startsWith(canvasUrl)) return false;
  const rest = url.slice(canvasUrl.length);
  return rest === "" || /^[?#/]/.test(rest);
}
