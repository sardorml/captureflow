import { setShareAuth } from "./share-auth";
import { logInfo, logWarn } from "../logger";

export async function handleDeepLinkUrl(rawUrl: string): Promise<void> {
  if (typeof rawUrl !== "string" || !rawUrl.startsWith("captureflow://")) {
    return;
  }
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    logWarn(
      "share-auth",
      `dropped malformed deep link: ${rawUrl.slice(0, 64)}…`,
    );
    return;
  }
  // Custom-scheme URL parsing is OS-dependent on which segment becomes the host,
  // so accept both auth/callback and the swapped callback/auth ordering.
  const key = `${parsed.host}${parsed.pathname}`
    .replace(/\/+/g, "/")
    .replace(/^\//, "");
  if (!key.startsWith("auth/callback") && !key.startsWith("callback/auth")) {
    logInfo("share-auth", `ignored non-auth deep link host=${parsed.host}`);
    return;
  }
  const token = parsed.searchParams.get("token") ?? "";
  const tokenId = parsed.searchParams.get("id") ?? "";
  const label = parsed.searchParams.get("label") ?? null;
  const email = parsed.searchParams.get("email") ?? null;
  if (token.length < 32 || tokenId.length === 0) {
    logWarn("share-auth", "deep link missing token or id; rejected");
    return;
  }
  await setShareAuth({ token, tokenId, label, email });
  logInfo("share-auth", `accepted token from deep link (id=${tokenId})`);
}
