import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { isValidSnapId } from '@/lib/snap/id';
import { bumpSnapLastViewed, getSnap, getSnapWithOwner } from '@/lib/snap/db';
import { publicSnapUrl } from '@/lib/snap/r2';
import { verifySession } from '@/lib/snap/verify-session';
import {
  APP_SITE_URL,
  APP_WEB_SITE_URL,
  R2_PUBLIC_BASE_URL,
  snapViewUrlFor,
  PRODUCT_NAME,
} from '@/lib/site';
import { readThemeFromCookieHeader } from '@captureflow/ui';
import { RequestAccess } from './RequestAccess';
import { SessionLoadingShell } from './SessionLoadingShell';
import { SnapView } from './SnapView';
import { getWorkspaceForUpload } from '@/lib/snap/quota';

type Props = { params: Promise<{ id: string }> };

// Per-request render so the visibility gate runs against the current cookie;
// otherwise Next can serve a stale logged-out shell stuck on "Request access".
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isValidSnapId(id)) return { title: PRODUCT_NAME };
  const snap = await getSnap(id);
  if (!snap || snap.state !== 'ready') return { title: PRODUCT_NAME };
  if (snap.visibility !== 'public') {
    const cookieHeader = (await headers()).get('cookie');
    const visitorResult = await verifySession(cookieHeader);
    const visitor = visitorResult === 'unknown' ? null : visitorResult;
    let authorized = false;
    if (visitor) {
      if (snap.visibility === 'private') {
        authorized = visitor.userId === snap.userId;
      } else if (snap.visibility === 'workspace') {
        if (snap.workspaceId) {
          const isOwner = visitor.userId === snap.userId;
          const isMember = visitor.workspaceIds.includes(snap.workspaceId);
          authorized = isOwner || isMember;
        }
      }
    }
    if (!authorized) {
      return { title: PRODUCT_NAME, robots: { index: false, follow: false } };
    }
  }
  const imageUrl = publicSnapUrl(snap.id, R2_PUBLIC_BASE_URL);
  const title = snap.title ?? `${PRODUCT_NAME} snap`;
  return {
    title,
    description: `A screenshot shared from ${PRODUCT_NAME}.`,
    // noindex: user-generated screenshots must never surface in organic search.
    robots: { index: false, follow: false },
    openGraph: {
      title,
      type: 'website',
      url: snapViewUrlFor(snap.id),
      images: [{ url: imageUrl, width: snap.width, height: snap.height }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      images: [imageUrl],
    },
  };
}

export default async function SnapPage({ params }: Props) {
  const { id } = await params;
  if (!isValidSnapId(id)) notFound();
  const snap = await getSnapWithOwner(id);
  if (!snap || snap.state !== 'ready') notFound();

  const cookieHeader = (await headers()).get('cookie');
  const theme = readThemeFromCookieHeader(cookieHeader);

  // 'unknown' = transient auth failure; on a gated snap render a loading shell
  // rather than collapsing to "no session" and flashing RequestAccess.
  const visitorResult = await verifySession(cookieHeader);
  if (visitorResult === 'unknown' && snap.visibility !== 'public') {
    return <SessionLoadingShell appWebUrl={APP_WEB_SITE_URL} />;
  }
  const visitor = visitorResult === 'unknown' ? null : visitorResult;

  if (snap.visibility !== 'public') {
    let authorized = false;
    if (visitor) {
      if (snap.visibility === 'private') {
        authorized = visitor.userId === snap.userId;
      } else if (snap.visibility === 'workspace') {
        if (snap.workspaceId) {
          const isOwner = visitor.userId === snap.userId;
          const isMember = visitor.workspaceIds.includes(snap.workspaceId);
          authorized = isOwner || isMember;
        }
      }
    }
    if (!authorized) {
      return (
        <RequestAccess
          appWebUrl={APP_SITE_URL}
          snapId={snap.id}
          viewer={visitor ? { email: visitor.email, name: visitor.name } : null}
          returnUrl={snapViewUrlFor(snap.id)}
          ownerName={snap.ownerName}
        />
      );
    }
  }

  bumpSnapLastViewed(snap.id).catch(() => {});

  // Cache-bust so a re-saved snap isn't served from the browser disk cache.
  const cacheKey = snap.editedAt ?? snap.updatedAt ?? snap.createdAt;
  const imageUrl = `${publicSnapUrl(
    snap.id,
    R2_PUBLIC_BASE_URL,
  )}?v=${cacheKey}`;
  // +1 so the viewer sees their own (post-read) load reflected.
  const displayViews = snap.viewCount + 1;
  const isOwner = !!(visitor && snap.userId && visitor.userId === snap.userId);
  const workspaceRow = snap.workspaceId
    ? await getWorkspaceForUpload(snap.workspaceId)
    : null;
  return (
    <SnapView
      id={snap.id}
      title={snap.title}
      imageUrl={imageUrl}
      width={snap.width}
      height={snap.height}
      createdAt={snap.createdAt}
      viewCount={displayViews}
      ownerName={snap.ownerName}
      viewer={visitor ? { name: visitor.name, email: visitor.email } : null}
      viewerUserId={visitor?.userId ?? null}
      viewerImageUrl={visitor?.image ?? null}
      isOwner={isOwner}
      visibility={
        (snap.visibility ?? 'public') as 'public' | 'workspace' | 'private'
      }
      workspaceName={workspaceRow?.name ?? null}
      allowPublicLinks={workspaceRow?.allow_public_links ?? true}
      snapUrl={snapViewUrlFor(snap.id)}
      editUrl={`${APP_SITE_URL}/snaps/${snap.id}/edit`}
      theme={theme}
      loginUrl={`${APP_SITE_URL}/login?next=${encodeURIComponent(
        snapViewUrlFor(snap.id),
      )}`}
    />
  );
}
