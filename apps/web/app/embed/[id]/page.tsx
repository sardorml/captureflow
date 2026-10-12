import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  bumpLastViewed,
  getRecording,
  listReactions,
} from "@/lib/recording/db";
import { verifySession } from "@/lib/recording/verify-session";
import { canViewResource } from "@/lib/visibility";
import { viewerMediaUrl, withVersion } from "@/lib/recording/media-url";
import { parseRecordingConfigJson } from "@/lib/recording-config";
import { isValidSlug } from "@/lib/recording/slug";
import { APP_WEB_SITE_URL, PRODUCT_NAME, viewUrlFor } from "@/lib/site";
import { EmbedPlayer } from "./EmbedPlayer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${PRODUCT_NAME} recording`,
  robots: { index: false, follow: false },
};

// The share page's player alone, for the extension to frame on GitHub.
export default async function EmbedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isValidSlug(id)) notFound();
  const row = await getRecording(id);
  if (!row || row.state !== "ready") notFound();

  const visitorResult = await verifySession((await headers()).get("cookie"));
  const visitor = visitorResult === "unknown" ? null : visitorResult;
  if (!canViewResource(visitor, row)) notFound();

  void bumpLastViewed(id);

  const [videoUrlRaw, posterUrlRaw, reactions, webcamUrlRaw] =
    await Promise.all([
      viewerMediaUrl(row, row.storageKey),
      row.posterKey
        ? viewerMediaUrl(row, row.posterKey)
        : Promise.resolve(undefined),
      listReactions(id),
      row.webcamStorageKey && row.webcamState === "ready"
        ? viewerMediaUrl(row, row.webcamStorageKey)
        : Promise.resolve(undefined),
    ]);

  return (
    <EmbedPlayer
      slug={id}
      videoUrl={withVersion(videoUrlRaw, row.sizeBytes)}
      posterUrl={
        posterUrlRaw ? withVersion(posterUrlRaw, row.sizeBytes) : undefined
      }
      webcamUrl={
        webcamUrlRaw && row.webcamSizeBytes > 0
          ? withVersion(webcamUrlRaw, row.webcamSizeBytes)
          : undefined
      }
      serverDurationMs={row.durationMs}
      serverWidth={row.width}
      serverHeight={row.height}
      config={parseRecordingConfigJson(row.configJson)}
      initialReactions={reactions}
      signedIn={!!visitor}
      shareUrl={viewUrlFor(id)}
      loginUrl={`${APP_WEB_SITE_URL}/login?next=${encodeURIComponent(viewUrlFor(id))}`}
    />
  );
}
