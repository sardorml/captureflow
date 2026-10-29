import type { MediaKind } from "@/lib/media";
import { cn } from "@captureflow/ui/cn";

export function mediaUrl(file: string, download = false): string {
  return `/api/library/${file}${download ? "?download" : ""}`;
}

export function MediaPreview({
  kind,
  file,
  className,
}: {
  kind: MediaKind;
  file: string | null;
  className?: string;
}) {
  const frame = cn(
    "flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-canvas",
    className,
  );
  if (!file) {
    return (
      <div className={cn(frame, "text-sm text-fg-muted")}>Not rendered yet</div>
    );
  }
  return (
    <div className={frame}>
      {kind === "video" ? (
        <video
          src={mediaUrl(file)}
          controls
          muted
          loop
          className="h-full w-full object-contain"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- local renders, not optimisable assets
        <img
          src={mediaUrl(file)}
          alt=""
          className="h-full w-full object-contain"
        />
      )}
    </div>
  );
}
