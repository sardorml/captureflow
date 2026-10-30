import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import {
  getOwnerName,
  getRecording,
  getTranscript,
  listComments,
  listReactions,
  listViewers,
  recordView,
  touchLastViewed,
} from "@/lib/recording/db";
import { hydrateStartSeconds } from "@/lib/recording/share-time";
import { viewerKeyFor } from "@/lib/recording/viewer-key";
import { resolveTranscript } from "@/lib/recording/transcript";
import {
  verifySession,
  type VerifiedSession,
} from "@/lib/recording/verify-session";
import { canViewResource } from "@/lib/visibility";
import type { RecordingVisibility } from "@/lib/recording/types";
import {
  posterMimeOf,
  viewerMediaUrl,
  withVersion,
} from "@/lib/recording/media-url";
import { parseRecordingConfigJson } from "@/lib/recording-config";
import { parseSummaryChaptersJson } from "@/lib/recording/summary-chapters";
import { isValidSlug } from "@/lib/recording/slug";
import { shareTitle } from "@/lib/recording/title";
import { formatDuration } from "@/lib/format";
import {
  APP_WEB_SITE_URL,
  PRODUCT_NAME,
  embedUrlFor,
  viewUrlFor,
} from "@/lib/site";
import { ViewerNav } from "../../_components/screenshot";
import { ThemeToggle } from "@captureflow/ui";
import {
  readThemeFromCookieHeader,
  readThemePreferenceFromCookieHeader,
} from "@captureflow/ui/theme";
import { getWorkspaceForUpload } from "@/lib/recording/quota";
import { AuthSync } from "./AuthSync";
import { PendingRecording } from "./PendingRecording";
import { RequestAccess } from "./RequestAccess";
import { SessionLoadingShell } from "./SessionLoadingShell";
import { AuthPrompt } from "./AuthPrompt";
import { RecordingActions } from "./RecordingActions";
import { RecordingViewer } from "./RecordingViewer";
import { NotificationsBell } from "@/app/_components/NotificationsBell";
import { SidebarDrawer } from "@/app/_components/SidebarDrawer";
import { ViewerUserMenu } from "@/app/_components/ViewerUserMenu";
import { Sidebar } from "@/app/(dashboard)/Sidebar";
import { MARKETING_SITE_URL } from "@/lib/site";
import { isSelfHosted } from "@captureflow/quota";
import { getAppWebEnv } from "@/lib/cf-env";

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

  const row = await getRecording(id);
  if (!row) {
    return { title: PRODUCT_NAME, robots: { index: false, follow: false } };
  }
  if (row.state === "pending") {
    return {
      title: `Preparing recording… — ${PRODUCT_NAME}`,
      robots: { index: false, follow: false },
    };
  }
  if (row.state !== "ready") {
    return { title: PRODUCT_NAME, robots: { index: false, follow: false } };
  }
  // Non-public recordings: unauthorized visitors get a flat "Not found" so
  // metadata reveals nothing more than a deleted row.
  if (row.visibility !== "public") {
    const cookieHeader = (await headers()).get("cookie");
    const visitorResult = await verifySession(cookieHeader);
    const visitor = visitorResult === "unknown" ? null : visitorResult;
    if (!canViewResource(visitor, row)) return { title: "Not found" };
  }

  const title = row.title ? shareTitle(row.title) : PRODUCT_NAME;
  const length = row.durationMs ? `${formatDuration(row.durationMs)} ` : "";
  const description = `A ${length}screen recording shared from ${PRODUCT_NAME}. Watch it in your browser, no sign-up needed.`;
  const [videoUrlRaw, posterUrlRaw] = await Promise.all([
    viewerMediaUrl(row, row.storageKey),
    row.posterKey
      ? viewerMediaUrl(row, row.posterKey)
      : Promise.resolve(undefined),
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

export default async function RecordingPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ t?: string | string[] }>;
}) {
  const { id } = await params;
  const startAtSeconds = hydrateStartSeconds((await searchParams).t);
  if (!isValidSlug(id)) notFound();

  const row = await getRecording(id);
  if (!row) notFound();

  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie");
  const theme = readThemeFromCookieHeader(cookieHeader);
  const themePreference = readThemePreferenceFromCookieHeader(cookieHeader);
  // /api/r/init reserves the id at record-start so desktop hands the user a
  // copyable link immediately; the row flips to 'ready' on /api/r/finalize
  // and the loading shell polls /api/r/state to reload on flip.
  if (row.state === "pending") {
    const pendingVisitor = await verifySession(cookieHeader);
    const visitor = pendingVisitor === "unknown" ? null : pendingVisitor;
    const isOwner = !!(visitor && row.userId && visitor.userId === row.userId);
    const [ownerName, workspaceRow, env] = await Promise.all([
      row.userId ? getOwnerName(row.userId) : Promise.resolve(null),
      row.workspaceId
        ? getWorkspaceForUpload(row.workspaceId)
        : Promise.resolve(null),
      getAppWebEnv(),
    ]);
    return (
      <div className="flex min-h-screen flex-col bg-panel text-fg lg:h-screen lg:overflow-hidden">
        <RecordingNav
          slug={id}
          visitor={visitor}
          theme={theme}
          themePreference={themePreference}
          selfHosted={isSelfHosted(env)}
          loginUrl={loginUrlFor(id)}
          visibility={row.visibility}
          isOwner={isOwner}
          workspaceName={workspaceRow?.name ?? null}
          allowPublicLinks={workspaceRow?.allow_public_links ?? true}
        />
        <PendingRecording
          slug={id}
          titleLine={row.title ?? PRODUCT_NAME}
          ownerName={ownerName}
          createdAt={row.createdAt}
          viewCount={row.viewCount}
          isOwner={isOwner}
        />
      </div>
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
  const selfHosted = isSelfHosted(await getAppWebEnv());

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

  const isOwner = !!(visitor && row.userId && visitor.userId === row.userId);
  // The owner's own visits are not views.
  void (
    isOwner
      ? touchLastViewed(id)
      : viewerKeyFor(visitor?.userId ?? null, requestHeaders).then((key) =>
          recordView(id, key, visitor?.userId ?? null),
        )
  ).catch(() => undefined);

  const [
    videoUrlRaw,
    posterUrlRaw,
    reactions,
    comments,
    ownerName,
    webcamUrlRaw,
    transcriptRow,
    viewers,
  ] = await Promise.all([
    viewerMediaUrl(row, row.storageKey),
    row.posterKey
      ? viewerMediaUrl(row, row.posterKey)
      : Promise.resolve(undefined),
    listReactions(id),
    listComments(id),
    row.userId ? getOwnerName(row.userId) : Promise.resolve(null),
    row.webcamStorageKey && row.webcamState === "ready"
      ? viewerMediaUrl(row, row.webcamStorageKey)
      : Promise.resolve(undefined),
    getTranscript(id),
    // Only the owner sees who watched.
    isOwner ? listViewers(id, row.userId) : Promise.resolve(null),
  ]);
  const recordingConfig = parseRecordingConfigJson(row.configJson);
  const summaryChapters = parseSummaryChaptersJson(row.summaryChaptersJson);
  const { transcript, status: transcriptStatus } =
    resolveTranscript(transcriptRow);
  const videoUrl = withVersion(videoUrlRaw, row.sizeBytes);
  const posterUrl = posterUrlRaw
    ? withVersion(posterUrlRaw, row.sizeBytes)
    : undefined;
  const webcamUrl =
    webcamUrlRaw && row.webcamSizeBytes > 0
      ? withVersion(webcamUrlRaw, row.webcamSizeBytes)
      : undefined;

  // recordView increments atomically but runs after we read the row, so
  // add 1 to reflect the current load.
  const displayViews = isOwner ? row.viewCount : row.viewCount + 1;
  const headlineText = row.title ?? PRODUCT_NAME;

  const loginUrl = loginUrlFor(id);

  const workspaceRow = row.workspaceId
    ? await getWorkspaceForUpload(row.workspaceId)
    : null;
  const workspaceName = workspaceRow?.name ?? null;
  const allowPublicLinks = workspaceRow?.allow_public_links ?? true;
  const editUrl = `${APP_WEB_SITE_URL}/recordings/${id}/edit`;

  return (
    <div className="flex min-h-screen flex-col bg-panel text-fg lg:h-screen lg:overflow-hidden">
      <AuthSync initialUserId={visitor?.userId ?? null} />
      <RecordingNav
        slug={id}
        visitor={visitor}
        theme={theme}
        themePreference={themePreference}
        selfHosted={selfHosted}
        loginUrl={loginUrl}
        visibility={row.visibility}
        isOwner={isOwner}
        workspaceName={workspaceName}
        allowPublicLinks={allowPublicLinks}
      />
      <RecordingViewer
        slug={id}
        startAtSeconds={startAtSeconds}
        videoUrl={videoUrl}
        posterUrl={posterUrl}
        posterBlur={row.posterBlur}
        webcamUrl={webcamUrl}
        serverDurationMs={row.durationMs}
        serverWidth={row.width}
        serverHeight={row.height}
        config={recordingConfig}
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
        viewers={viewers}
        isOwner={isOwner}
        initialSummary={summaryChapters.summary}
        initialChapters={summaryChapters.chapters}
        initialTranscript={transcript}
        initialTranscriptStatus={transcriptStatus}
        editUrl={editUrl}
      />
    </div>
  );
}

const loginUrlFor = (slug: string): string =>
  `${APP_WEB_SITE_URL}/login?next=${encodeURIComponent(viewUrlFor(slug))}`;

function RecordingNav({
  slug,
  visitor,
  theme,
  themePreference,
  selfHosted,
  loginUrl,
  visibility,
  isOwner,
  workspaceName,
  allowPublicLinks,
}: {
  slug: string;
  visitor: VerifiedSession | null;
  theme: ReturnType<typeof readThemeFromCookieHeader>;
  themePreference: ReturnType<typeof readThemePreferenceFromCookieHeader>;
  selfHosted: boolean;
  loginUrl: string;
  visibility: RecordingVisibility;
  isOwner: boolean;
  workspaceName: string | null;
  allowPublicLinks: boolean;
}) {
  return (
    <ViewerNav
      homeUrl={APP_WEB_SITE_URL}
      productName={PRODUCT_NAME}
      className="border-b border-black/[0.06] bg-panel dark:border-white/[0.07]"
      /* The workspace panel is the signed-in user's own; an anonymous viewer
         has nothing to put in it, and Sidebar's requireSession would bounce
         them to /auth/clear mid-render. Suspense keeps its workspace queries
         off the critical path — the drawer is shut on arrival either way. */
      leading={
        visitor ? (
          <SidebarDrawer>
            <div data-split="sidebar" className="contents">
              <Suspense fallback={null}>
                <Sidebar />
              </Suspense>
            </div>
          </SidebarDrawer>
        ) : null
      }
      viewer={visitor ? { name: visitor.name, email: visitor.email } : null}
      /* Signed in, the theme lives in the account menu exactly as it does on
         the dashboard; anonymous viewers have no menu, so they keep the
         standalone toggle. */
      themeToggle={
        visitor ? null : (
          <ThemeToggle initialTheme={theme} className="h-9 w-9 rounded-xl" />
        )
      }
      notifications={
        visitor ? (
          <NotificationsBell
            user={{ id: visitor.userId, email: visitor.email }}
            base={APP_WEB_SITE_URL}
          />
        ) : null
      }
      userMenu={
        visitor ? (
          <ViewerUserMenu
            userId={visitor.userId}
            name={visitor.name}
            email={visitor.email}
            imageUrl={visitor.image}
            appWebUrl={APP_WEB_SITE_URL}
            themePreference={themePreference}
            selfHosted={selfHosted}
          />
        ) : (
          <AuthPrompt marketingUrl={MARKETING_SITE_URL} loginUrl={loginUrl} />
        )
      }
      actions={
        <RecordingActions
          slug={slug}
          recordingUrl={viewUrlFor(slug)}
          embedUrl={embedUrlFor(slug)}
          editUrl={`${APP_WEB_SITE_URL}/recordings/${slug}/edit`}
          initialVisibility={visibility}
          isOwner={isOwner}
          workspaceName={workspaceName}
          allowPublicLinks={allowPublicLinks}
          signedIn={!!visitor}
        />
      }
    />
  );
}
