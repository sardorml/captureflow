import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/session-guard';
import { getSnapForUser } from '@/lib/snaps-db';
import { getObjectJson, objectExists } from '@/lib/r2';
import { sourceKeyFor, stateKeyFor } from '@/lib/snap-keys';
import { snapViewUrlFor } from '@/lib/site';
import { SnapEditor } from './SnapEditor';

const R2_BASE =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? 'https://cdn.captureflow.xyz';

export const dynamic = 'force-dynamic';

// Server wrapper: validate the session, fetch the snap row, and hand
// off to the client editor. Kept OUTSIDE the (dashboard) route group
// so it doesn't inherit the dashboard max-width container + nav — the
// Konva canvas wants the full viewport.
export default async function SnapEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const snap = await getSnapForUser(id, session.user.id);
  if (!snap) notFound();

  // Cache-bust by most-recent mutation time. Without it, a browser
  // that fetched the PNG before R2 had CORS configured reuses its
  // cached no-CORS response forever: the same URL hits the disk cache
  // (with stale CORS metadata) instead of the network.
  const cacheKey = snap.editedAt ?? snap.updatedAt ?? snap.createdAt;

  // After the first save, the pristine pre-edit screenshot lives at
  // `<key>.source.png` so later edits open against clean pixels rather
  // than a composition with the previous bg baked in. HEAD that key;
  // if missing (first edit ever) fall back to the primary key, which
  // still holds the original bytes.
  const sourceKey = sourceKeyFor(snap.storageKey);
  const stateKey = stateKeyFor(snap.storageKey);
  // Sidecar reads are best-effort — a network blip or eventual-
  // consistency miss shouldn't 500 the edit page. Fall back to the
  // primary key + null state.
  let hasSource = false;
  let savedState: { background?: string; annotations?: unknown[] } | null =
    null;
  try {
    const [a, b] = await Promise.all([
      objectExists(sourceKey),
      getObjectJson<{ background?: string; annotations?: unknown[] }>(stateKey),
    ]);
    hasSource = a;
    savedState = b;
  } catch (err) {
    console.error('[snap-edit-page] sidecar read failed:', err);
  }
  const imageKey = hasSource ? sourceKey : snap.storageKey;
  const imageUrl = `${R2_BASE}/${imageKey}?v=${cacheKey}`;
  const viewUrl = snapViewUrlFor(snap.id);

  return (
    <SnapEditor
      snapId={snap.id}
      initialTitle={snap.title}
      imageUrl={imageUrl}
      width={snap.width}
      height={snap.height}
      viewUrl={viewUrl}
      createdAt={snap.createdAt}
      ownerName={snap.ownerName}
      ownerEmail={snap.ownerEmail}
      initialBackground={savedState?.background ?? null}
      initialAnnotations={savedState?.annotations ?? null}
    />
  );
}
