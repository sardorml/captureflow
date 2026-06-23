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

// Public viewer for a single snap. Resolves the row, bumps view
// count + last_viewed_at fire-and-forget (so retention math knows
// the snap is alive), and serves an `<img>` pointing at the CDN.
//
// verifySession runs IN-PROCESS against better-auth (no cross-origin
// fetch) and can return 'unknown' for a transient backend blip,
// handled below.

type Props = { params: Promise<{ id: string }> };

// Force per-request rendering so the visibility gate + session check
// run against the current cookie on every hit. Without this Next.js
// can return a stale HTML shell rendered against a logged-out
// session, leaving the visitor stuck on "Request access" until they
// refresh.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isValidSnapId(id)) return { title: PRODUCT_NAME };
  const snap = await getSnap(id);
  if (!snap || snap.state !== 'ready') return { title: PRODUCT_NAME };
  // Non-public snaps: unauthorized visitors see a flat "Not found" so
  // metadata leaks nothing past the URL. Authorized viewers get the
  // real title + OG card so the tab matches the page body.
  if (snap.visibility !== 'public') {
    const cookieHeader = (await headers()).get('cookie');
    const visitorResult = await verifySession(cookieHeader);
    // 'unknown' (transient verify-session failure) collapses to
    // unauthorized for metadata — crawlers see "Not found" like any
    // anonymous visitor. The page body separately renders a loading
    // shell that re-runs SSR client-side.
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
    // Public snaps carry rich OG for social unfurls but are explicitly
    // noindex: user-generated screenshots must never surface in organic
    // search (the /s layout sets this too — declared here defensively).
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

  // Resolve the visitor once for the visibility gate + navbar avatar.
  const cookieHeader = (await headers()).get('cookie');
  const theme = readThemeFromCookieHeader(cookieHeader);

  // Returns 'unknown' when the auth lookup itself failed transiently
  // (cold-start, D1 blip). We must NOT collapse that to "no session" on
  // a gated snap — doing so would flash RequestAccess in the owner's
  // face on the first hit. Render a neutral loading shell instead and
  // let the browser re-probe.
  const visitorResult = await verifySession(cookieHeader);
  if (visitorResult === 'unknown' && snap.visibility !== 'public') {
    return <SessionLoadingShell appWebUrl={APP_WEB_SITE_URL} />;
  }
  const visitor = visitorResult === 'unknown' ? null : visitorResult;

  // Visibility gate. Unauthorized branches render <RequestAccess> so
  // the visitor can ping the owner instead of hitting a flat 404.
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

  // Cache-bust the public URL with the snap's edit/update timestamp so
  // a re-saved snap isn't served from the browser disk cache — the URL
  // is otherwise identical across edits.
  const cacheKey = snap.editedAt ?? snap.updatedAt ?? snap.createdAt;
  const imageUrl = `${publicSnapUrl(
    snap.id,
    R2_PUBLIC_BASE_URL,
  )}?v=${cacheKey}`;
  // bumpSnapLastViewed runs after we read the row, so add 1 so the
  // viewer sees their own load reflected.
  const displayViews = snap.viewCount + 1;
  // Workspace lookup powers the Share dialog's labels + the public-
  // link policy gate. Skipped on legacy rows without a workspace.
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
