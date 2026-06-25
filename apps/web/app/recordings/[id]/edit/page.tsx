import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getWorkspaceById } from "@captureflow/quota";
import { readThemeFromCookieHeader } from "@captureflow/ui";
import { getAppWebEnv } from "@/lib/cf-env";
import { requireSession } from "@/lib/session-guard";
import { getRecordingForUser } from "@/lib/recordings-db";
import { getObjectJson } from "@/lib/r2";
import {
  recordingConfigKeyFor,
  hydrateRecordingConfig,
} from "@/lib/recording-config";
import { viewUrlFor } from "@/lib/site";
import { RecordingEditor } from "./RecordingEditor";

const R2_BASE =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "https://cdn.captureflow.xyz";

export const dynamic = "force-dynamic";

export default async function RecordingEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const recording = await getRecordingForUser(session.user.id, id);
  if (!recording) notFound();

  let savedConfig: unknown = null;
  try {
    savedConfig = await getObjectJson<unknown>(
      recordingConfigKeyFor(recording.storageKey),
    );
  } catch (err) {
    console.error("[recording-edit-page] config sidecar read failed:", err);
  }
  const initialConfig = hydrateRecordingConfig(savedConfig);

  const env = await getAppWebEnv();
  const workspaceRow =
    env?.DB && recording.workspaceId
      ? await getWorkspaceById(env.DB, recording.workspaceId)
      : null;

  const videoUrl = `${R2_BASE}/${recording.storageKey}?v=${recording.sizeBytes}`;
  const webcamUrl =
    recording.webcamStorageKey && recording.webcamState === "ready"
      ? `${R2_BASE}/${recording.webcamStorageKey}?v=${recording.webcamSizeBytes}`
      : null;
  const viewUrl = viewUrlFor(recording.slug);
  const theme = readThemeFromCookieHeader((await headers()).get("cookie"));

  return (
    <RecordingEditor
      initialTheme={theme}
      slug={recording.slug}
      initialTitle={recording.title}
      videoUrl={videoUrl}
      webcamUrl={webcamUrl}
      viewUrl={viewUrl}
      width={recording.width}
      height={recording.height}
      durationMs={recording.durationMs}
      sizeBytes={recording.sizeBytes}
      viewCount={recording.viewCount}
      createdAt={recording.createdAt}
      initialVisibility={recording.visibility}
      initialConfig={initialConfig}
      initialState={recording.state}
      workspaceName={workspaceRow?.name ?? null}
      allowPublicLinks={workspaceRow?.allow_public_links ?? true}
    />
  );
}
