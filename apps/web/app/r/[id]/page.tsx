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

// The share viewer lives under /r — its public URL is
// captureflow.xyz/r/<id>. The dynamic segment is `id`, which IS the
// share's public slug, so the share-lib calls that take a slug
// receive `id` directly.
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
  // Pending row: /api/r/init reserved the id at record-start. Render a
  // "Preparing share…" tab title so the user (who's the most likely
  // hitter of this state) sees something sensible instead of "Not
  // found" — the page body renders the loading shell.
  if (row.state === 'pending') {
    return {
      title: `Preparing share… — ${PRODUCT_NAME}`,
      robots: { index: false, follow: false },
    };
  }
  if (row.state !== 'ready') {
    return { title: PRODUCT_NAME, robots: { index: false, follow: false } };
  }
  // Non-public shares: anonymous crawlers and unauthorized visitors
  // get a flat "Not found" so the metadata reveals nothing different
  // from a deleted row. Authorized viewers (signed-in workspace
  // member for workspace-visibility, owner for private) get the real
  // title + OG card so the tab + previews don't read as "Not found"
  // when the page body is actually playing.
  if (row.visibility !== 'public') {
    const cookieHeader = (await headers()).get('cookie');
    const visitor = await verifySession(cookieHeader);
    let authorized = false;
    // 'unknown' (transient verify-session failure) collapses to
    // unauthorized for metadata — crawlers see "Not found" the same as
    // a real anonymous visitor. The page body separately renders a
    // loading shell that re-runs SSR client-side.
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
  // Append a content-version query so any post-finalize mutation of
  // the same R2 key (poster regeneration, future re-encodes) produces
  // a distinct URL → fresh fetch guaranteed without forcing every
  // visit to re-download. The screen MP4 itself is immutable
  // post-finalize so this is mostly inertia + future-proofing.
  const videoUrl = withVersion(videoUrlRaw, row.sizeBytes);
  const posterUrl = posterUrlRaw
    ? withVersion(posterUrlRaw, row.sizeBytes)
    : undefined;
  const pageUrl = viewUrlFor(id);

  // Match the image MIME type to whatever extension the poster was
  // stored under so the og:image:type crawlers receive lines up with
  // the byte stream. Defaulting to image/jpeg matches our happy path
  // (ffmpeg extracts mjpeg → .jpg) without us probing R2's headers.
  const posterType = posterMimeOf(row.posterKey);
  // Crawlers (Facebook/Instagram especially) need explicit dimensions
  // on the og:image to render the preview card — without them they
  // tend to skip the image entirely or downgrade to a bare link. Fall
  // back to 1280×720 (the worker's poster preset) when the row's own
  // dims aren't recorded so we always emit *some* size.
  const imageWidth = row.width ?? 1280;
  const imageHeight = row.height ?? 720;

  return {
    title,
    description,
    // Public shares carry rich OG for social unfurls but are explicitly
    // noindex: they're user-generated recordings and must never surface in
    // organic search (the /r layout sets this too — declaring it here makes
    // the intent defensive against any inheritance change).
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

// Appends a content-version query to a public R2 URL so any
// post-finalize mutation (poster regeneration, etc.) produces a
// distinct URL and bypasses downstream caching. Skips when the
// version is non-positive (pending upload that hasn't reported size
// yet).
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
  // Pending row: /api/r/init reserves the id at record-start so the
  // desktop can hand the user a copyable link immediately. The bytes
  // arrive via streaming-multipart during the recording itself; the
  // row flips to 'ready' once /api/r/finalize lands. The loading shell
  // polls /api/r/state and reloads the page on flip. After ~2 minutes
  // it surfaces a "didn't finish uploading" fallback.
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

  // Resolve the visitor once — used both for the visibility gate
  // below AND for the ShareViewer prop further down (reaction/comment
  // auth UI). verifySession runs an IN-PROCESS
  // better-auth lookup (no cross-origin fetch) — see
  // lib/share/verify-session.ts.
  //
  // Returns 'unknown' when the auth lookup itself failed transiently
  // (cold-start, D1 blip). We must NOT collapse that to "no session" —
  // doing so used to flash RequestAccess in the owner's face on the
  // first hit from the dashboard. Render a neutral loading shell
  // instead and let the browser re-probe.
  const visitorResult = await verifySession(cookieHeader);
  if (visitorResult === 'unknown' && row.visibility !== 'public') {
    return <SessionLoadingShell appWebUrl={APP_WEB_SITE_URL} />;
  }
  const visitor = visitorResult === 'unknown' ? null : visitorResult;

  // Non-public shares are gated by the visitor's session:
  //   - `public`: anyone, no gate
  //   - `workspace`: signed-in user must be a member of `row.workspaceId`
  //   - `private`: signed-in user must be the owner (row.userId)
  //
  // Unauthorized branches render <RequestAccess> rather than a flat
  // 404 so the visitor has a path forward (sign in / ping the owner).
  // generateMetadata still returns "Not found" so crawlers + previews
  // see nothing.
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
    // Best-effort sidecar fetch. Missing / unparseable JSON resolves
    // to null which hydrates back to DEFAULT_SHARE_CONFIG below — a
    // fresh share that's never been edited renders the same as it
    // does today (no bg, default PiP corner, audio on).
    getObjectJson<unknown>(shareConfigKeyFor(row.storageKey)).catch(() => null),
    loadSummaryChapters(row.storageKey),
  ]);
  const shareConfig = configRaw
    ? hydrateShareConfig(configRaw)
    : DEFAULT_SHARE_CONFIG;
  // Same content-version trick as generateMetadata — see the comment
  // there for why a normal refresh would otherwise still see the pre-
  // replace bytes from cache.
  const videoUrl = withVersion(videoUrlRaw, row.sizeBytes);
  const posterUrl = posterUrlRaw
    ? withVersion(posterUrlRaw, row.sizeBytes)
    : undefined;
  // Webcam companion: only surface when fully ready. Hidden while
  // 'pending' (still uploading from desktop) and absent for 'none'
  // (no camera was attached). Versioned with its own size so an
  // independent re-upload busts cache.
  const webcamUrl =
    webcamUrlRaw && row.webcamSizeBytes > 0
      ? withVersion(webcamUrlRaw, row.webcamSizeBytes)
      : undefined;

  // bumpLastViewed also increments view_count atomically — but it
  // runs AFTER we read the row, so the count we display is the
  // pre-increment value. Add 1 here so the user sees their own load
  // reflected. (Strictly speaking the next viewer sees the same
  // number we just showed — close enough for a public counter.)
  const displayViews = row.viewCount + 1;
  // The full headline (source name + brand line + date) is now baked
  // into `shares.title` at /api/r/init time so dashboard renames can
  // edit the entire string. Legacy rows that predate that change
  // fall back to just the product name.
  const headlineText = row.title ?? PRODUCT_NAME;

  // Sign-in CTA in the sidebar bounces visitors through app-web's
  // login with a `next` param so they land back on this share after
  // signing in.
  const loginUrl = `${APP_WEB_SITE_URL}/login?next=${encodeURIComponent(
    viewUrlFor(id),
  )}`;

  // Look up the share's workspace so the Share modal can label the
  // workspace visibility option ("Workspace · Acme") and respect the
  // workspace's allow_public_links policy. Skipped for legacy rows
  // without a workspace.
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

// Headline composition moved server-side at /api/r/init time so the
// entire string sits in shares.title and dashboard renames can edit
// any part of it — including the brand suffix + date. See
// lib/share/title.ts.
