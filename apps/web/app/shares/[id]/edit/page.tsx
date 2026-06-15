import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getWorkspaceById } from '@captureflow/quota';
import { readThemeFromCookieHeader } from '@captureflow/ui';
import { getAppWebEnv } from '@/lib/cf-env';
import { requireSession } from '@/lib/session-guard';
import { getShareForUser } from '@/lib/shares-db';
import { getObjectJson } from '@/lib/r2';
import { shareConfigKeyFor, hydrateShareConfig } from '@/lib/share-config';
import { viewUrlFor } from '@/lib/site';
import { ShareEditor } from './ShareEditor';

const R2_BASE =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? 'https://cdn.captureflow.xyz';

export const dynamic = 'force-dynamic';

// Server wrapper: validate the session, fetch the share row, pull the
// config sidecar from R2, and hand off to the client editor. This route
// lives at the top level (not under `(dashboard)`), so it renders its
// own header (back arrow + title + actions) rather than the dashboard
// chrome — share edits are a focused management surface. The theme is
// resolved from the cookie here so the editor's own toggle paints the
// right glyph on first render.
export default async function ShareEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const share = await getShareForUser(session.user.id, id);
  if (!share) notFound();

  // Sidecar config — best-effort. Falls back to defaults if R2 has no
  // object yet (first edit) or the JSON is unparseable.
  let savedConfig: unknown = null;
  try {
    savedConfig = await getObjectJson<unknown>(
      shareConfigKeyFor(share.storageKey)
    );
  } catch (err) {
    console.error('[share-edit-page] config sidecar read failed:', err);
  }
  const initialConfig = hydrateShareConfig(savedConfig);

  // Workspace lookup powers the editor's VisibilityDialog — same
  // contract as the dashboard cards + share viewer.
  const env = await getAppWebEnv();
  const workspaceRow =
    env?.DB && share.workspaceId
      ? await getWorkspaceById(env.DB, share.workspaceId)
      : null;

  const videoUrl = `${R2_BASE}/${share.storageKey}?v=${share.sizeBytes}`;
  const webcamUrl =
    share.webcamStorageKey && share.webcamState === 'ready'
      ? `${R2_BASE}/${share.webcamStorageKey}?v=${share.webcamSizeBytes}`
      : null;
  const viewUrl = viewUrlFor(share.slug);
  const theme = readThemeFromCookieHeader((await headers()).get('cookie'));

  return (
    <ShareEditor
      initialTheme={theme}
      slug={share.slug}
      initialTitle={share.title}
      videoUrl={videoUrl}
      webcamUrl={webcamUrl}
      viewUrl={viewUrl}
      width={share.width}
      height={share.height}
      durationMs={share.durationMs}
      sizeBytes={share.sizeBytes}
      viewCount={share.viewCount}
      createdAt={share.createdAt}
      initialVisibility={share.visibility}
      initialConfig={initialConfig}
      initialState={share.state}
      workspaceName={workspaceRow?.name ?? null}
      allowPublicLinks={workspaceRow?.allow_public_links ?? true}
    />
  );
}
