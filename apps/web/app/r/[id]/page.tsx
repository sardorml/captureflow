import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  bumpLastViewed,
  getOwnerName,
  getShare,
  listComments,
  listReactions,
} from '@/lib/share/db';
import { verifySession } from '@/lib/share/verify-session';
import { getObjectJson, publicUrlFor } from '@/lib/share/r2';
import {
  DEFAULT_SHARE_CONFIG,
  hydrateShareConfig,
  shareConfigKeyFor,
} from '@/lib/share/share-config';
import { loadSummaryChapters } from '@/lib/share/summary-chapters';
import { isValidSlug } from '@/lib/share/slug';
import { APP_WEB_SITE_URL, PRODUCT_NAME, viewUrlFor } from '@/lib/site';
import { ViewerNav } from '../../_components/snap';
import { ThemeToggle, readThemeFromCookieHeader } from '@captureflow/ui';
import { getWorkspaceForUpload } from '@/lib/share/quota';
import { AuthSync } from './AuthSync';
import { PendingShare } from './PendingShare';
import { RequestAccess } from './RequestAccess';
import { SessionLoadingShell } from './SessionLoadingShell';
import { AuthPrompt } from './AuthPrompt';
import { ShareActions } from './ShareActions';
import { ShareViewer } from './ShareViewer';
import { ViewerUserMenu } from './ViewerUserMenu';
import { MARKETING_SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

// The dynamic `id` segment IS the share's public slug, so share-lib
// calls that take a slug receive `id` directly.
type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isValidSlug(id)) {
    return { title: PRODUCT_NAME, robots: { index: false, follow: false } };
  }

  const row = await getShare(id);
  if (!row) {
    return { title: PRODUCT_NAME, robots: { index: false, follow: false } };
  }
  // Pending row (id reserved at record-start): show a "Preparing share…"
  // tab title rather than "Not found" — the page body renders the loading
  // shell.
  if (row.state === 'pending') {
    return {
      title: `Preparing share… — ${PRODUCT_NAME}`,
      robots: { index: false, follow: false },
    };
  }
  if (row.state !== 'ready') {
    return { title: PRODUCT_NAME, robots: { index: false, follow: false } };
  }
  // Non-public shares: anonymous crawlers and unauthorized visitors get a
  // flat "Not found" so metadata reveals nothing more than a deleted row.
  // Authorized viewers (workspace member, or owner for private) get the
  // real title + OG card so the tab/previews match the playing page body.
  if (row.visibility !== 'public') {
    const cookieHeader = (await headers()).get('cookie');
    const visitor = await verifySession(cookieHeader);
    let authorized = false;
    // 'unknown' (transient verify-session failure) collapses to
    // unauthorized for metadata, same as anonymous. The page body
    // separately renders a loading shell that re-runs SSR client-side.
    if (visitor && visitor !== 'unknown') {
      if (row.visibility === 'private') {
        authorized = visitor.userId === row.userId;
      } else if (row.visibility === 'workspace') {
        if (row.workspaceId) {
          const isOwner = visitor.userId === row.userId;
          const isMember = visitor.workspaceIds.includes(row.workspaceId);
          authorized = isOwner || isMember;
        }
      }
    }
    if (!authorized) return { title: 'Not found' };
  }

  // shares.title now holds the full pre-baked headline ("source —
  // brand — date"). Legacy rows fall back to the product name.
  const title = row.title ?? PRODUCT_NAME;
  const description = `A screen recording shared from ${PRODUCT_NAME}.`;
  const [videoUrlRaw, posterUrlRaw] = await Promise.all([
    publicUrlFor(row.storageKey),
    row.posterKey ? publicUrlFor(row.posterKey) : Promise.resolve(undefined),
  ]);
  // Append a content-version query so any post-finalize mutation of the
  // same R2 key (poster regeneration, future re-encodes) yields a distinct
  // URL and bypasses caching. The screen MP4 is immutable post-finalize, so
  // for it this is mostly future-proofing.
  const videoUrl = withVersion(videoUrlRaw, row.sizeBytes);
  const posterUrl = posterUrlRaw
    ? withVersion(posterUrlRaw, row.sizeBytes)
    : undefined;
  const pageUrl = viewUrlFor(id);

  // Derive og:image:type from the stored poster extension so the declared
  // MIME matches the byte stream. Default image/jpeg matches the happy path
  // (ffmpeg extracts mjpeg → .jpg) without probing R2 headers.
  const posterType = posterMimeOf(row.posterKey);
  // Crawlers (Facebook/Instagram especially) need explicit og:image
  // dimensions or they skip the image / downgrade to a bare link. Fall back
  // to the worker's 1280×720 poster preset when row dims aren't recorded.
  const imageWidth = row.width ?? 1280;
  const imageHeight = row.height ?? 720;

  return {
    title,
    description,
    // Public shares carry rich OG for social unfurls but are explicitly
    // noindex: user-generated recordings must never surface in organic
    // search. The /r layout sets this too; redeclaring here is defensive
    // against inheritance changes.
    robots: { index: false, follow: false },
    openGraph: {
      type: 'video.other',
      url: pageUrl,
      title,
      description,
      siteName: PRODUCT_NAME,
      images: posterUrl
        ? [
            {
              url: posterUrl,
              secureUrl: posterUrl,
              type: posterType,
              width: imageWidth,
              height: imageHeight,
              alt: title,
            },
          ]
        : undefined,
      videos: [
        {
          url: videoUrl,
          secureUrl: videoUrl,
          width: row.width ?? undefined,
          height: row.height ?? undefined,
          type: 'video/mp4',
        },
      ],
    },
    twitter: {
      card: 'player',
      title,
      description,
      images: posterUrl ? [posterUrl] : undefined,
      players: [
        {
          playerUrl: pageUrl,
          streamUrl: videoUrl,
          width: row.width ?? 1280,
          height: row.height ?? 720,
        },
      ],
    },
  };
}

// Appends a content-version query to a public R2 URL so any post-finalize
// mutation produces a distinct URL and bypasses downstream caching. No-op
// for a non-positive version (pending upload that hasn't reported size yet).
function withVersion(url: string, version: number): string {
  if (!Number.isFinite(version) || version <= 0) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${version}`;
}

function posterMimeOf(posterKey: string | null): string {
  if (!posterKey) return 'image/jpeg';
  const lower = posterKey.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

export default async function SharePage({ params }: { params: Params }) {
  const { id } = await params;
  if (!isValidSlug(id)) notFound();

  const row = await getShare(id);
  if (!row) notFound();

  const cookieHeader = (await headers()).get('cookie');
  const theme = readThemeFromCookieHeader(cookieHeader);
  // Pending row: /api/r/init reserves the id at record-start so desktop can
  // hand the user a copyable link immediately; bytes stream in during the
  // recording and the row flips to 'ready' on /api/r/finalize. The loading
  // shell polls /api/r/state and reloads on flip, falling back to a "didn't
  // finish uploading" message after ~2 minutes.
  if (row.state === 'pending') {
    return (
      <>
        <ViewerNav
          homeUrl={APP_WEB_SITE_URL}
          productName={PRODUCT_NAME}
          label="recording"
          viewCount={row.viewCount}
          themeToggle={<ThemeToggle initialTheme={theme} />}
        />
        <PendingShare
          slug={id}
          titleLine={row.title ?? `${PRODUCT_NAME}`}
          createdAt={row.createdAt}
        />
      </>
    );
  }
  if (row.state !== 'ready') notFound();

  // Resolve the visitor once — used for the visibility gate below and for
  // the ShareViewer reaction/comment auth UI. verifySession does an
  // in-process better-auth lookup (no cross-origin fetch).
  //
  // Returns 'unknown' when the auth lookup failed transiently (cold-start,
  // D1 blip). Do NOT collapse that to "no session" — it used to flash
  // RequestAccess at the owner on the first hit from the dashboard. Render a
  // neutral loading shell instead and let the browser re-probe.
  const visitorResult = await verifySession(cookieHeader);
  if (visitorResult === 'unknown' && row.visibility !== 'public') {
    return <SessionLoadingShell appWebUrl={APP_WEB_SITE_URL} />;
  }
  const visitor = visitorResult === 'unknown' ? null : visitorResult;

  // Non-public shares are gated by the visitor's session:
  //   - `workspace`: signed-in user must be a member of `row.workspaceId`
  //   - `private`: signed-in user must be the owner (row.userId)
  //
  // Unauthorized branches render <RequestAccess> rather than a flat 404 so
  // the visitor has a path forward (sign in / ping the owner).
  // generateMetadata still returns "Not found" so crawlers + previews see
  // nothing.
  if (row.visibility !== 'public') {
    let authorized = false;
    if (visitor) {
      if (row.visibility === 'private') {
        authorized = visitor.userId === row.userId;
      } else if (row.visibility === 'workspace') {
        if (row.workspaceId) {
          const isOwner = visitor.userId === row.userId;
          const isMember = visitor.workspaceIds.includes(row.workspaceId);
          authorized = isOwner || isMember;
        }
      }
    }
    if (!authorized) {
      const ownerNameForGate = row.userId
        ? await getOwnerName(row.userId)
        : null;
      return (
        <RequestAccess
          appWebUrl={APP_WEB_SITE_URL}
          slug={id}
          viewer={visitor ? { email: visitor.email, name: visitor.name } : null}
          returnUrl={viewUrlFor(id)}
          ownerName={ownerNameForGate}
        />
      );
    }
  }

  void bumpLastViewed(id);

  const [
    videoUrlRaw,
    posterUrlRaw,
    reactions,
    comments,
    ownerName,
    webcamUrlRaw,
    configRaw,
    summaryChapters,
  ] = await Promise.all([
    publicUrlFor(row.storageKey),
    row.posterKey ? publicUrlFor(row.posterKey) : Promise.resolve(undefined),
    listReactions(id),
    listComments(id),
    row.userId ? getOwnerName(row.userId) : Promise.resolve(null),
    row.webcamStorageKey && row.webcamState === 'ready'
      ? publicUrlFor(row.webcamStorageKey)
      : Promise.resolve(undefined),
    // Best-effort sidecar fetch. Missing / unparseable JSON resolves to null
    // which hydrates to DEFAULT_SHARE_CONFIG below, so a never-edited share
    // renders with defaults (no bg, default PiP corner, audio on).
    getObjectJson<unknown>(shareConfigKeyFor(row.storageKey)).catch(() => null),
    loadSummaryChapters(row.storageKey),
  ]);
  const shareConfig = configRaw
    ? hydrateShareConfig(configRaw)
    : DEFAULT_SHARE_CONFIG;
  // Same content-version trick as generateMetadata; see that comment for
  // why a refresh would otherwise serve pre-replace bytes from cache.
  const videoUrl = withVersion(videoUrlRaw, row.sizeBytes);
  const posterUrl = posterUrlRaw
    ? withVersion(posterUrlRaw, row.sizeBytes)
    : undefined;
  // Webcam companion: only surface when fully ready. Hidden while 'pending'
  // (still uploading) and absent for 'none' (no camera attached). Versioned
  // with its own size so an independent re-upload busts cache.
  const webcamUrl =
    webcamUrlRaw && row.webcamSizeBytes > 0
      ? withVersion(webcamUrlRaw, row.webcamSizeBytes)
      : undefined;

  // bumpLastViewed increments view_count atomically but runs AFTER we read
  // the row, so we add 1 here to reflect the current load. (The next viewer
  // sees the same number we just showed — close enough for a public counter.)
  const displayViews = row.viewCount + 1;
  // The full headline (source + brand line + date) is baked into
  // `shares.title` at /api/r/init time so dashboard renames can edit the
  // whole string. Legacy rows fall back to just the product name.
  const headlineText = row.title ?? PRODUCT_NAME;

  // Sign-in CTA routes through app-web login with a `next` param so the
  // visitor lands back on this share after signing in.
  const loginUrl = `${APP_WEB_SITE_URL}/login?next=${encodeURIComponent(
    viewUrlFor(id),
  )}`;

  // Look up the share's workspace so the Share modal can label the workspace
  // visibility option ("Workspace · Acme") and honor allow_public_links.
  // Skipped for legacy rows without a workspace.
  const isOwner = !!(visitor && row.userId && visitor.userId === row.userId);
  const workspaceRow = row.workspaceId
    ? await getWorkspaceForUpload(row.workspaceId)
    : null;
  const workspaceName = workspaceRow?.name ?? null;
  const allowPublicLinks = workspaceRow?.allow_public_links ?? true;
  const shareUrl = viewUrlFor(id);

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-fg lg:h-screen lg:overflow-hidden">
      <AuthSync initialUserId={visitor?.userId ?? null} />
      <ViewerNav
        homeUrl={APP_WEB_SITE_URL}
        productName={PRODUCT_NAME}
        viewer={visitor ? { name: visitor.name, email: visitor.email } : null}
        themeToggle={<ThemeToggle initialTheme={theme} />}
        userMenu={
          visitor ? (
            <ViewerUserMenu
              userId={visitor.userId}
              name={visitor.name}
              email={visitor.email}
              imageUrl={visitor.image}
              appWebUrl={APP_WEB_SITE_URL}
            />
          ) : (
            <AuthPrompt marketingUrl={MARKETING_SITE_URL} loginUrl={loginUrl} />
          )
        }
        actions={
          <ShareActions
            slug={id}
            shareUrl={shareUrl}
            editUrl={`${APP_WEB_SITE_URL}/shares/${id}/edit`}
            initialVisibility={row.visibility}
            isOwner={isOwner}
            workspaceName={workspaceName}
            allowPublicLinks={allowPublicLinks}
            signedIn={!!visitor}
          />
        }
      />
      <ShareViewer
        slug={id}
        videoUrl={videoUrl}
        posterUrl={posterUrl}
        webcamUrl={webcamUrl}
        serverDurationMs={row.durationMs}
        serverWidth={row.width}
        serverHeight={row.height}
        config={shareConfig}
        initialReactions={reactions}
        initialComments={comments}
        viewer={
          visitor
            ? {
                userId: visitor.userId,
                name: visitor.name,
                email: visitor.email,
                image: visitor.image,
              }
            : null
        }
        loginUrl={loginUrl}
        headlineText={headlineText}
        ownerName={ownerName}
        createdAt={row.createdAt}
        viewCount={displayViews}
        isOwner={isOwner}
        initialSummary={summaryChapters.summary}
        initialChapters={summaryChapters.chapters}
      />
    </div>
  );
}
