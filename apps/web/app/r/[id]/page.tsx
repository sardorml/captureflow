import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  bumpLastViewed,
  getOwnerName,
  getShare,
  listComments,
  listReactions,
} from "@/lib/share/db";
import { verifySession } from "@/lib/share/verify-session";
import { canViewResource } from "@/lib/visibility";
import { getObjectJson, publicUrlFor } from "@/lib/share/r2";
import {
  DEFAULT_SHARE_CONFIG,
  hydrateShareConfig,
  shareConfigKeyFor,
} from "@/lib/share-config";
import { loadSummaryChapters } from "@/lib/share/summary-chapters";
import { isValidSlug } from "@/lib/share/slug";
import { APP_WEB_SITE_URL, PRODUCT_NAME, viewUrlFor } from "@/lib/site";
import { ViewerNav } from "../../_components/snap";
import { ThemeToggle, readThemeFromCookieHeader } from "@captureflow/ui";
import { getWorkspaceForUpload } from "@/lib/share/quota";
import { AuthSync } from "./AuthSync";
import { PendingShare } from "./PendingShare";
import { RequestAccess } from "./RequestAccess";
import { SessionLoadingShell } from "./SessionLoadingShell";
import { AuthPrompt } from "./AuthPrompt";
import { ShareActions } from "./ShareActions";
import { ShareViewer } from "./ShareViewer";
import { ViewerUserMenu } from "./ViewerUserMenu";
import { MARKETING_SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

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
  if (row.state === "pending") {
    return {
      title: `Preparing share… — ${PRODUCT_NAME}`,
      robots: { index: false, follow: false },
    };
  }
  if (row.state !== "ready") {
    return { title: PRODUCT_NAME, robots: { index: false, follow: false } };
  }
  // Non-public shares: unauthorized visitors get a flat "Not found" so
  // metadata reveals nothing more than a deleted row.
  if (row.visibility !== "public") {
    const cookieHeader = (await headers()).get("cookie");
    const visitorResult = await verifySession(cookieHeader);
    const visitor = visitorResult === "unknown" ? null : visitorResult;
    if (!canViewResource(visitor, row)) return { title: "Not found" };
  }

  const title = row.title ?? PRODUCT_NAME;
  const description = `A screen recording shared from ${PRODUCT_NAME}.`;
  const [videoUrlRaw, posterUrlRaw] = await Promise.all([
    publicUrlFor(row.storageKey),
    row.posterKey ? publicUrlFor(row.posterKey) : Promise.resolve(undefined),
  ]);
  // Content-version query so a post-finalize mutation of the same R2 key
  // (e.g. poster regeneration) yields a distinct URL and bypasses caching.
  const videoUrl = withVersion(videoUrlRaw, row.sizeBytes);
  const posterUrl = posterUrlRaw
    ? withVersion(posterUrlRaw, row.sizeBytes)
    : undefined;
  const pageUrl = viewUrlFor(id);

  const posterType = posterMimeOf(row.posterKey);
  // Facebook/Instagram skip the image without explicit og:image dimensions.
  const imageWidth = row.width ?? 1280;
  const imageHeight = row.height ?? 720;

  return {
    title,
    description,
    // noindex: user-generated recordings must never surface in organic search.
    robots: { index: false, follow: false },
    openGraph: {
      type: "video.other",
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
          type: "video/mp4",
        },
      ],
    },
    twitter: {
      card: "player",
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

function withVersion(url: string, version: number): string {
  if (!Number.isFinite(version) || version <= 0) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${version}`;
}

function posterMimeOf(posterKey: string | null): string {
  if (!posterKey) return "image/jpeg";
  const lower = posterKey.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

export default async function SharePage({ params }: { params: Params }) {
  const { id } = await params;
  if (!isValidSlug(id)) notFound();

  const row = await getShare(id);
  if (!row) notFound();

  const cookieHeader = (await headers()).get("cookie");
  const theme = readThemeFromCookieHeader(cookieHeader);
  // /api/r/init reserves the id at record-start so desktop hands the user a
  // copyable link immediately; the row flips to 'ready' on /api/r/finalize
  // and the loading shell polls /api/r/state to reload on flip.
  if (row.state === "pending") {
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
  if (row.state !== "ready") notFound();

  // 'unknown' means the auth lookup failed transiently (cold-start, D1 blip).
  // Do NOT collapse it to "no session" — it used to flash RequestAccess at
  // the owner on the first hit from the dashboard. Render a loading shell and
  // let the browser re-probe.
  const visitorResult = await verifySession(cookieHeader);
  if (visitorResult === "unknown" && row.visibility !== "public") {
    return <SessionLoadingShell appWebUrl={APP_WEB_SITE_URL} />;
  }
  const visitor = visitorResult === "unknown" ? null : visitorResult;

  // Unauthorized branches render <RequestAccess> (a path forward) rather than
  // a flat 404, while generateMetadata returns "Not found" for crawlers.
  if (row.visibility !== "public") {
    if (!canViewResource(visitor, row)) {
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
    row.webcamStorageKey && row.webcamState === "ready"
      ? publicUrlFor(row.webcamStorageKey)
      : Promise.resolve(undefined),
    getObjectJson<unknown>(shareConfigKeyFor(row.storageKey)).catch(() => null),
    loadSummaryChapters(row.storageKey),
  ]);
  const shareConfig = configRaw
    ? hydrateShareConfig(configRaw)
    : DEFAULT_SHARE_CONFIG;
  const videoUrl = withVersion(videoUrlRaw, row.sizeBytes);
  const posterUrl = posterUrlRaw
    ? withVersion(posterUrlRaw, row.sizeBytes)
    : undefined;
  const webcamUrl =
    webcamUrlRaw && row.webcamSizeBytes > 0
      ? withVersion(webcamUrlRaw, row.webcamSizeBytes)
      : undefined;

  // bumpLastViewed increments atomically but runs after we read the row, so
  // add 1 to reflect the current load.
  const displayViews = row.viewCount + 1;
  const headlineText = row.title ?? PRODUCT_NAME;

  const loginUrl = `${APP_WEB_SITE_URL}/login?next=${encodeURIComponent(
    viewUrlFor(id),
  )}`;

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
