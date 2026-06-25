import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session-guard";
import { getScreenshotForUser } from "@/lib/screenshots-db";
import { getObjectJson, objectExists } from "@/lib/r2";
import { sourceKeyFor, stateKeyFor } from "@/lib/screenshot-keys";
import { screenshotViewUrlFor } from "@/lib/site";
import { ScreenshotEditor } from "./ScreenshotEditor";

const R2_BASE =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "https://cdn.captureflow.xyz";

export const dynamic = "force-dynamic";

// Kept OUTSIDE the (dashboard) route group so it doesn't inherit the
// dashboard max-width container + nav — the Konva canvas wants the full viewport.
export default async function ScreenshotEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const screenshot = await getScreenshotForUser(id, session.user.id);
  if (!screenshot) notFound();

  // Cache-bust by most-recent mutation time so a browser that fetched the
  // PNG before R2 had CORS configured doesn't reuse its cached no-CORS response.
  const cacheKey =
    screenshot.editedAt ?? screenshot.updatedAt ?? screenshot.createdAt;

  // After the first save the pristine pre-edit screenshot lives at
  // `<key>.source.png`; fall back to the primary key on the first edit ever.
  const sourceKey = sourceKeyFor(screenshot.storageKey);
  const stateKey = stateKeyFor(screenshot.storageKey);
  // Sidecar reads are best-effort — a blip shouldn't 500 the edit page.
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
    console.error("[screenshot-edit-page] sidecar read failed:", err);
  }
  const imageKey = hasSource ? sourceKey : screenshot.storageKey;
  const imageUrl = `${R2_BASE}/${imageKey}?v=${cacheKey}`;
  const viewUrl = screenshotViewUrlFor(screenshot.id);

  return (
    <ScreenshotEditor
      screenshotId={screenshot.id}
      initialTitle={screenshot.title}
      imageUrl={imageUrl}
      width={screenshot.width}
      height={screenshot.height}
      viewUrl={viewUrl}
      createdAt={screenshot.createdAt}
      ownerName={screenshot.ownerName}
      ownerEmail={screenshot.ownerEmail}
      initialBackground={savedState?.background ?? null}
      initialAnnotations={savedState?.annotations ?? null}
    />
  );
}
