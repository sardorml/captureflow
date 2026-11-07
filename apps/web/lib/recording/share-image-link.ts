import {
  parseRecordingConfigJson,
  type RecordingConfig,
} from "@/lib/recording-config";
import { shareImagePrefixFor } from "@captureflow/shared/object-keys";
import { RECORDING_SITE_URL } from "@/lib/site";
import { posterMimeOf } from "./media-url";
import { shareImageSize, shareImageVersion } from "./share-image";
import type { RecordingRow } from "./types";

export type ShareImageLink = {
  url: string;
  key: string;
  width: number;
  height: number;
  config: RecordingConfig;
};

/*
 * The framed link preview for a public recording whose look has a
 * background. Null means the plain poster is the preview: no background, a
 * private recording (crawlers can't see it anyway), or a poster that isn't
 * a JPEG the worker can decode.
 */
export async function shareImageLinkFor(
  row: Pick<
    RecordingRow,
    | "slug"
    | "visibility"
    | "state"
    | "storageKey"
    | "posterKey"
    | "posterThumbKey"
    | "sizeBytes"
    | "width"
    | "height"
    | "configJson"
  >,
): Promise<ShareImageLink | null> {
  if (row.visibility !== "public" || row.state !== "ready") return null;
  if (!row.posterKey || posterMimeOf(row.posterKey) !== "image/jpeg") {
    return null;
  }
  const config = parseRecordingConfigJson(row.configJson);
  if (config.background === "transparent") return null;
  const size = shareImageSize(row.width, row.height);
  const version = await shareImageVersion({
    posterKey: row.posterKey,
    posterThumbKey: row.posterThumbKey,
    sizeBytes: row.sizeBytes,
    ...size,
    frame: config,
  });
  return {
    url: `${RECORDING_SITE_URL}/api/r/og/${row.slug}?v=${version}`,
    key: `${shareImagePrefixFor(row.storageKey)}${version}.jpg`,
    ...size,
    config,
  };
}
