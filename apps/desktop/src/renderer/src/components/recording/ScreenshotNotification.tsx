import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  ChevronRight,
  ExternalLink,
  FolderOpen,
  Link2,
  MoreHorizontal,
  Trash2,
  X,
} from "lucide-react";
import logoRound from "@/assets/logo-round.png";

type ScreenshotState =
  | { kind: "capturing"; localPath: string | null; sourceTitle: string | null }
  | {
      kind: "ready";
      localPath: string;
      sourceTitle: string | null;
      id: string;
      viewUrl: string;
      editUrl: string;
    }
  | {
      kind: "failed";
      localPath: string | null;
      sourceTitle: string | null;
      reason: string;
    };

// Bottom-right "screenshot ready" modal, driven through capturing → ready / failed by
// main-process IPC.
export function ScreenshotNotification(): React.JSX.Element {
  const [state, setState] = useState<ScreenshotState>({
    kind: "capturing",
    localPath: null,
    sourceTitle: null,
  });
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
  }, []);

  useEffect(() => {
    const off1 = window.electronAPI.onScreenshotCaptured(
      ({ localPath, sourceTitle }): void => {
        setState((prev) => {
          if (prev.kind === "ready") {
            return { kind: "capturing", localPath, sourceTitle };
          }
          return { kind: "capturing", localPath, sourceTitle };
        });
        setCopied(false);
      },
    );
    const off2 = window.electronAPI.onScreenshotUploadComplete(
      ({ id, viewUrl, editUrl }): void => {
        setState((prev) => {
          if (prev.kind === "capturing" || prev.kind === "failed") {
            return {
              kind: "ready",
              localPath: prev.localPath ?? "",
              sourceTitle: prev.sourceTitle,
              id,
              viewUrl,
              editUrl,
            };
          }
          return prev;
        });
      },
    );
    const off3 = window.electronAPI.onScreenshotUploadFailed(
      ({ reason }): void => {
        setState((prev) => ({
          kind: "failed",
          localPath:
            prev.kind === "capturing" || prev.kind === "ready"
              ? prev.localPath
              : null,
          sourceTitle:
            prev.kind === "capturing" || prev.kind === "ready"
              ? prev.sourceTitle
              : null,
          reason,
        }));
      },
    );
    return () => {
      off1();
      off2();
      off3();
    };
  }, []);

  const handleClose = (): void => {
    window.electronAPI.screenshotNotificationClose();
  };

  const handleEdit = (): void => {
    if (state.kind !== "ready") return;
    window.electronAPI.screenshotOpenEdit(state.editUrl);
  };

  const handleCopy = (): void => {
    if (state.kind !== "ready") return;
    window.electronAPI.screenshotCopyLink(state.viewUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const handleRevealInFinder = (): void => {
    if (
      state.kind === "capturing" ||
      state.kind === "ready" ||
      state.kind === "failed"
    ) {
      if (state.localPath) {
        window.electronAPI.showItemInFolder(state.localPath).catch(() => {});
      }
    }
    setMenuOpen(false);
  };

  const handleOpenInBrowser = (): void => {
    if (state.kind !== "ready") return;
    window.electronAPI.screenshotOpenEdit(state.viewUrl);
    setMenuOpen(false);
  };

  const handleDelete = (): void => {
    if (state.kind !== "ready") return;
    window.electronAPI.screenshotDelete(state.id);
    setMenuOpen(false);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const previewSrc =
    state.kind === "capturing" ||
    state.kind === "ready" ||
    state.kind === "failed"
      ? state.localPath
        ? `media://screenshot-preview?path=${encodeURIComponent(state.localPath)}`
        : null
      : null;
  const isReady = state.kind === "ready";
  const isFailed = state.kind === "failed";

  return (
    <div
      className="h-screen w-screen p-3 select-none"
      style={{ background: "transparent" }}
    >
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-neutral-900 text-white shadow-2xl ring-1 ring-white/10">
        {/* Dark backdrop so transparent PNG regions (shadow alpha) stay contained. */}
        <div className="relative flex-1 overflow-hidden bg-neutral-950">
          {previewSrc ? (
            <img
              src={previewSrc}
              alt=""
              className="h-full w-full object-contain"
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/40">
              <Camera className="h-8 w-8" />
            </div>
          )}

          {state.kind === "capturing" && (
            <div
              data-testid="screenshot-spinner"
              className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40"
            >
              <Spinner />
            </div>
          )}

          {/* Disabled until upload completes: delete + open-in-browser need the server id / view URL. */}
          <div ref={menuRef} className="absolute left-3 top-3">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              disabled={!isReady}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white/90 ring-1 ring-white/10 backdrop-blur-md transition-colors hover:bg-black/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-black/55"
              aria-label="Screenshot options"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute left-0 top-11 z-10 min-w-[180px] overflow-hidden rounded-xl bg-neutral-900/95 p-1 text-[13px] text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-md"
              >
                <MenuItem
                  icon={<FolderOpen className="h-3.5 w-3.5" />}
                  label="Show in Finder"
                  onClick={handleRevealInFinder}
                  disabled={
                    !(
                      (state.kind === "ready" ||
                        state.kind === "capturing" ||
                        state.kind === "failed") &&
                      !!state.localPath
                    )
                  }
                />
                <MenuItem
                  icon={<ExternalLink className="h-3.5 w-3.5" />}
                  label="Open in browser"
                  onClick={handleOpenInBrowser}
                  disabled={!isReady}
                />
                <div className="my-1 h-px bg-white/10" />
                <MenuItem
                  icon={<Trash2 className="h-3.5 w-3.5" />}
                  label="Delete screenshot"
                  onClick={handleDelete}
                  disabled={!isReady}
                  destructive
                />
              </div>
            )}
          </div>

          {/* Always available so the modal can be dismissed mid-upload. */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white/90 ring-1 ring-white/10 backdrop-blur-md transition-colors hover:bg-black/70 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 border-t border-white/5 px-4 py-3">
          <img
            src={logoRound}
            alt=""
            className="h-7 w-7 flex-shrink-0 rounded-full"
            draggable={false}
          />
          <span
            data-testid="screenshot-status"
            className="truncate text-[13px] font-medium text-white/90"
          >
            {isFailed
              ? `Upload failed — ${state.reason}`
              : state.sourceTitle ||
                (isReady ? "Screenshot ready" : "Capturing screenshot…")}
          </span>
        </div>

        <div className="flex gap-2 px-3 pb-3">
          <button
            type="button"
            onClick={handleEdit}
            disabled={!isReady}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-white/10 px-4 py-3 text-[14px] font-medium text-white ring-1 ring-white/10 transition-colors hover:bg-white/15 disabled:opacity-40 disabled:hover:bg-white/10"
          >
            Edit in CaptureFlow
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!isReady}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-[14px] font-medium text-white ring-1 ring-white/10 transition-colors hover:bg-white/15 disabled:opacity-40 disabled:hover:bg-white/10"
          >
            {copied ? (
              <>
                Copied
                <Check className="h-4 w-4" />
              </>
            ) : (
              <>
                Copy link
                <Link2 className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  disabled,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}): React.JSX.Element {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        destructive
          ? "text-red-400 hover:bg-red-500/15 hover:text-red-300"
          : "text-white/90 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className="flex h-4 w-4 items-center justify-center">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function Spinner(): React.JSX.Element {
  return (
    <svg
      className="h-10 w-10 animate-spin text-white"
      viewBox="0 0 16 16"
      fill="none"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <rect
          key={i}
          x="7"
          y="1"
          width="2"
          height="4"
          rx="1"
          fill="currentColor"
          opacity={0.15 + (i / 8) * 0.85}
          transform={`rotate(${i * 45} 8 8)`}
        />
      ))}
    </svg>
  );
}
