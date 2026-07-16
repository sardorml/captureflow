import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isValidScreenshotId } from "@/lib/screenshot/id";
import {
  bumpScreenshotLastViewed,
  getScreenshot,
  getScreenshotWithOwner,
} from "@/lib/screenshot/db";
import { publicScreenshotUrlFor } from "@/lib/screenshot/r2";
import { verifySession } from "@/lib/screenshot/verify-session";
import { canViewResource } from "@/lib/visibility";
import {
  APP_SITE_URL,
  APP_WEB_SITE_URL,
  screenshotViewUrlFor,
  PRODUCT_NAME,
} from "@/lib/site";
import { readThemeFromCookieHeader } from "@captureflow/ui";
import { RequestAccess } from "./RequestAccess";
import { SessionLoadingShell } from "./SessionLoadingShell";
import { ScreenshotView } from "./ScreenshotView";
import { getWorkspaceForUpload } from "@/lib/screenshot/quota";

type Props = { params: Promise<{ id: string }> };

// Per-request render so the visibility gate runs against the current cookie;
// otherwise Next can serve a stale logged-out shell stuck on "Request access".
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isValidScreenshotId(id)) return { title: PRODUCT_NAME };
  const screenshot = await getScreenshot(id);
  if (!screenshot || screenshot.state !== "ready")
    return { title: PRODUCT_NAME };
  if (screenshot.visibility !== "public") {
    const cookieHeader = (await headers()).get("cookie");
    const visitorResult = await verifySession(cookieHeader);
    const visitor = visitorResult === "unknown" ? null : visitorResult;
    if (!canViewResource(visitor, screenshot)) {
      return { title: PRODUCT_NAME, robots: { index: false, follow: false } };
    }
  }
  const imageUrl = await publicScreenshotUrlFor(screenshot.id);
  const title = screenshot.title ?? `${PRODUCT_NAME} screenshot`;
  return {
    title,
    description: `A screenshot shared from ${PRODUCT_NAME}.`,
    // noindex: user-generated screenshots must never surface in organic search.
    robots: { index: false, follow: false },
    openGraph: {
      title,
      type: "website",
      url: screenshotViewUrlFor(screenshot.id),
      images: [
        { url: imageUrl, width: screenshot.width, height: screenshot.height },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: [imageUrl],
    },
  };
}

export default async function ScreenshotPage({ params }: Props) {
  const { id } = await params;
  if (!isValidScreenshotId(id)) notFound();
  const screenshot = await getScreenshotWithOwner(id);
  if (!screenshot || screenshot.state !== "ready") notFound();

  const cookieHeader = (await headers()).get("cookie");
  const theme = readThemeFromCookieHeader(cookieHeader);

  // 'unknown' = transient auth failure; on a gated screenshot render a loading shell
  // rather than collapsing to "no session" and flashing RequestAccess.
  const visitorResult = await verifySession(cookieHeader);
  if (visitorResult === "unknown" && screenshot.visibility !== "public") {
    return <SessionLoadingShell appWebUrl={APP_WEB_SITE_URL} />;
  }
  const visitor = visitorResult === "unknown" ? null : visitorResult;

  if (screenshot.visibility !== "public") {
    if (!canViewResource(visitor, screenshot)) {
      return (
        <RequestAccess
          appWebUrl={APP_SITE_URL}
          screenshotId={screenshot.id}
          viewer={visitor ? { email: visitor.email, name: visitor.name } : null}
          returnUrl={screenshotViewUrlFor(screenshot.id)}
          ownerName={screenshot.ownerName}
        />
      );
    }
  }

  bumpScreenshotLastViewed(screenshot.id).catch(() => {});

  // Cache-bust so a re-saved screenshot isn't served from the browser disk cache.
  const cacheKey =
    screenshot.editedAt ?? screenshot.updatedAt ?? screenshot.createdAt;
  const imageUrl = `${await publicScreenshotUrlFor(screenshot.id)}?v=${cacheKey}`;
  // +1 so the viewer sees their own (post-read) load reflected.
  const displayViews = screenshot.viewCount + 1;
  const isOwner = !!(
    visitor &&
    screenshot.userId &&
    visitor.userId === screenshot.userId
  );
  const workspaceRow = screenshot.workspaceId
    ? await getWorkspaceForUpload(screenshot.workspaceId)
    : null;
  return (
    <ScreenshotView
      id={screenshot.id}
      title={screenshot.title}
      imageUrl={imageUrl}
      width={screenshot.width}
      height={screenshot.height}
      createdAt={screenshot.createdAt}
      viewCount={displayViews}
      ownerName={screenshot.ownerName}
      viewer={visitor ? { name: visitor.name, email: visitor.email } : null}
      viewerUserId={visitor?.userId ?? null}
      viewerImageUrl={visitor?.image ?? null}
      isOwner={isOwner}
      visibility={
        (screenshot.visibility ?? "public") as
          | "public"
          | "workspace"
          | "private"
      }
      workspaceName={workspaceRow?.name ?? null}
      allowPublicLinks={workspaceRow?.allow_public_links ?? true}
      screenshotUrl={screenshotViewUrlFor(screenshot.id)}
      editUrl={`${APP_SITE_URL}/screenshots/${screenshot.id}/edit`}
      theme={theme}
      loginUrl={`${APP_SITE_URL}/login?next=${encodeURIComponent(
        screenshotViewUrlFor(screenshot.id),
      )}`}
    />
  );
}
