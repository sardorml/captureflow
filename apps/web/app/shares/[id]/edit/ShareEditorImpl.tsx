'use client';

import { useRouter } from 'next/navigation';
import { formatBytes, formatDuration } from '@/lib/format';
import { useCallback, useEffect, useState, useTransition } from 'react';
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Globe,
  Loader2,
  Lock,
  Mic,
  MicOff,
  Pencil,
  Trash2,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { forwardRef } from 'react';
import { SmoothButton, ThemeToggle } from '@captureflow/ui';
import { VisibilityDialog } from '@/app/VisibilityDialog';
import {
  SHARE_GRADIENT_KEYS,
  SHARE_GRADIENT_PRESETS,
  isShareHexColor,
  shareGradientCss,
  type ShareCameraCorner,
  type ShareCameraSize,
  type ShareConfig,
} from '@/lib/share-config';
import { SharePlayer } from '../../../_components/share';
import type { ShareEditorProps } from './ShareEditor';
import {
  deleteShareAction,
  renameShareAction,
  saveShareConfigAction,
  setVisibilityAction,
} from '../../../actions';

/*
 * Share edit page. Renders the preview with SharePlayer (the same
 * component the public viewer uses, so the preview matches the
 * published page pixel for pixel). Config changes apply live to the
 * preview; explicit Save persists to the R2 sidecar.
 */

const SOLID_PALETTE = [
  '#2563eb',
  '#0ea5e9',
  '#65a30d',
  '#ca8a04',
  '#db2777',
  '#dc2626',
  '#ea580c',
  '#64748b',
  '#0f172a',
];

const CAMERA_CORNERS: { value: ShareCameraCorner; label: string }[] = [
  { value: 'top-left', label: 'Top left' },
  { value: 'top-right', label: 'Top right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'bottom-right', label: 'Bottom right' },
];

const CAMERA_SIZES: { value: ShareCameraSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export function ShareEditorImpl(props: ShareEditorProps) {
  const router = useRouter();
  const {
    slug,
    initialTitle,
    videoUrl,
    webcamUrl,
    viewUrl,
    width,
    height,
    durationMs,
    sizeBytes,
    viewCount,
    createdAt,
    initialVisibility,
    initialConfig,
    workspaceName,
    allowPublicLinks,
    initialTheme,
  } = props;

  const [title, setTitle] = useState<string>(initialTitle ?? '');
  const [titleDraft, setTitleDraft] = useState<string>(initialTitle ?? '');
  const [titleEditing, setTitleEditing] = useState(false);
  const [titlePending, startTitleTransition] = useTransition();
  const [titleError, setTitleError] = useState<string | null>(null);

  const [visibility, setVisibility] = useState(initialVisibility);
  const [actionPending, startActionTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  // savedConfig tracks what's persisted so Save can be disabled when
  // the live config has no unsaved changes.
  const [config, setConfig] = useState<ShareConfig>(initialConfig);
  const [savedConfig, setSavedConfig] = useState<ShareConfig>(initialConfig);
  const [savePending, startSaveTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedJustNow, setSavedJustNow] = useState(false);

  const isDirty = !shallowEqualConfig(config, savedConfig);

  useEffect(() => {
    if (!savedJustNow) return;
    const t = setTimeout(() => setSavedJustNow(false), 2000);
    return () => clearTimeout(t);
  }, [savedJustNow]);

  const commitTitle = (): void => {
    const next = titleDraft.trim();
    if (next === (title ?? '').trim()) {
      setTitleEditing(false);
      return;
    }
    setTitleError(null);
    startTitleTransition(async () => {
      const fd = new FormData();
      fd.set('slug', slug);
      fd.set('title', next);
      const res = await renameShareAction({ error: null, slug: null }, fd);
      if (res.error) {
        setTitleError(res.error);
        return;
      }
      setTitle(next);
      setTitleEditing(false);
    });
  };

  const onChangeVisibility = async (next: typeof visibility): Promise<void> => {
    if (next === visibility) return;
    const previous = visibility;
    setVisibility(next);
    setActionError(null);
    const res = await setVisibilityAction(slug, next);
    if (res.error) {
      setVisibility(previous);
      setActionError(res.error);
    }
  };

  const onDelete = (): void => {
    const ok = confirm(
      'Delete this share permanently? The video and link will stop working immediately.'
    );
    if (!ok) return;
    setActionError(null);
    startActionTransition(async () => {
      const res = await deleteShareAction(slug);
      if (res.error) {
        setActionError(res.error);
        return;
      }
      router.push('/');
    });
  };

  const onSave = useCallback((): void => {
    setSaveError(null);
    const snapshot = config;
    startSaveTransition(async () => {
      const res = await saveShareConfigAction(slug, snapshot);
      if (res.error) {
        setSaveError(res.error);
        return;
      }
      setSavedConfig(snapshot);
      setSavedJustNow(true);
    });
  }, [config, slug]);

  const onCopyLink = (): void => {
    void navigator.clipboard.writeText(viewUrl).catch(() => {
      /* clipboard may be unavailable in insecure contexts */
    });
  };

  return (
    <main className="flex min-h-screen flex-col bg-canvas text-fg">
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line bg-canvas-2 px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/')}
            aria-label="Back to shares"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-overlay hover:text-fg-strong"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          {titleEditing ? (
            <form
              className="flex min-w-0 items-center gap-1"
              onSubmit={(e) => {
                e.preventDefault();
                commitTitle();
              }}
            >
              <input
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setTitleDraft(title ?? '');
                    setTitleEditing(false);
                    setTitleError(null);
                  }
                }}
                maxLength={200}
                placeholder="Untitled share"
                disabled={titlePending}
                className="w-[28rem] max-w-[60vw] rounded-md border border-line bg-neutral-900 px-2 py-1 text-sm text-neutral-100 focus:border-line-strong focus:outline-none disabled:opacity-50"
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTitleDraft(title ?? '');
                setTitleEditing(true);
              }}
              className="group flex min-w-0 items-center gap-1 rounded-md px-2 py-1 text-left hover:bg-overlay"
              title="Rename"
            >
              <span className="truncate text-sm text-neutral-200">
                {title?.trim() || 'Untitled share'}
              </span>
              <Pencil className="h-3.5 w-3.5 shrink-0 text-neutral-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          )}
          {titleError && (
            <span className="text-xs text-red-400">{titleError}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* router.refresh() re-runs the server tree so the new theme
              cookie propagates (the toggle also flips the <html>
              attribute + writes the cookie for instant feedback). */}
          <ThemeToggle
            initialTheme={initialTheme}
            onAfterToggle={() => router.refresh()}
            className="h-9 w-9"
          />
          <span className="mx-1 h-5 w-px bg-line" aria-hidden />
          <VisibilityDialog
            value={visibility}
            disabled={actionPending}
            onChange={onChangeVisibility}
            allowPublic={allowPublicLinks}
            workspaceName={workspaceName}
            trigger={<EditorVisibilityChip visibility={visibility} />}
          />
          <SmoothButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCopyLink}
            className="bg-overlay text-fg hover:bg-overlay-strong hover:text-fg-strong"
          >
            Copy link
          </SmoothButton>
          <SmoothButton
            type="button"
            variant="ghost"
            size="sm"
            asChild
            className="bg-overlay text-fg hover:bg-overlay-strong hover:text-fg-strong"
          >
            <a href={viewUrl} target="_blank" rel="noreferrer">
              Open <ExternalLink className="h-3 w-3" />
            </a>
          </SmoothButton>
          <SmoothButton
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Delete share"
            onClick={onDelete}
            disabled={actionPending}
            className="h-8 w-8 bg-overlay text-fg hover:bg-danger-soft hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </SmoothButton>
          <SmoothButton
            type="button"
            variant="candy"
            onClick={onSave}
            disabled={!isDirty || savePending}
            className="ml-2"
          >
            {savePending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : savedJustNow ? (
              <Check className="h-4 w-4" />
            ) : null}
            {savedJustNow ? 'Saved' : 'Save'}
          </SmoothButton>
        </div>
      </header>

      {actionError && (
        <div className="border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-center text-xs text-red-200">
          {actionError}
        </div>
      )}
      {saveError && (
        <div className="border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-center text-xs text-red-200">
          {saveError}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-6 p-6 lg:flex-row">
        <section className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-4xl">
            <SharePlayer
              videoUrl={videoUrl}
              webcamUrl={webcamUrl ?? undefined}
              serverDurationMs={durationMs}
              serverWidth={width}
              serverHeight={height}
              config={config}
            />
            <ShareStatsRow
              durationMs={durationMs}
              sizeBytes={sizeBytes}
              viewCount={viewCount}
              createdAt={createdAt}
              slug={slug}
            />
          </div>
        </section>

        <aside className="w-full shrink-0 space-y-5 lg:w-[320px]">
          <BackgroundPanel
            background={config.background}
            onChange={(bg) => setConfig((c) => ({ ...c, background: bg }))}
          />
          {webcamUrl ? (
            <CameraPanel
              corner={config.cameraCorner}
              size={config.cameraSize}
              onCorner={(corner) =>
                setConfig((c) => ({ ...c, cameraCorner: corner }))
              }
              onSize={(size) => setConfig((c) => ({ ...c, cameraSize: size }))}
            />
          ) : null}
          <AudioPanel
            micMuted={config.micMuted}
            systemMuted={config.systemMuted}
            hasMic={!!webcamUrl}
            onMic={(muted) => setConfig((c) => ({ ...c, micMuted: muted }))}
            onSystem={(muted) =>
              setConfig((c) => ({ ...c, systemMuted: muted }))
            }
          />
        </aside>
      </div>
    </main>
  );
}

function ShareStatsRow({
  durationMs,
  sizeBytes,
  viewCount,
  createdAt,
  slug,
}: {
  durationMs: number | null;
  sizeBytes: number;
  viewCount: number;
  createdAt: number;
  slug: string;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
      <span className="font-mono">/{slug}</span>
      <span>{formatBytes(sizeBytes)}</span>
      {durationMs != null ? <span>{formatDuration(durationMs)}</span> : null}
      <span>
        {viewCount} view{viewCount === 1 ? '' : 's'}
      </span>
      <span>{formatDate(createdAt)}</span>
    </div>
  );
}

function BackgroundPanel({
  background,
  onChange,
}: {
  background: string;
  onChange: (bg: string) => void;
}) {
  return (
    <section className="rounded-lg border border-line bg-canvas-2 p-3">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
        Background
      </h3>
      <div className="grid grid-cols-5 gap-1.5">
        <button
          type="button"
          onClick={() => onChange('transparent')}
          className={
            'flex h-7 items-center justify-center rounded bg-neutral-800 text-[10px] font-medium text-neutral-100 ring-1 transition-colors ' +
            (background === 'transparent'
              ? 'ring-blue-400'
              : 'ring-line hover:ring-line-strong')
          }
        >
          None
        </button>
        {SHARE_GRADIENT_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            title={SHARE_GRADIENT_PRESETS[k].label}
            className={
              'h-7 rounded ring-1 transition-shadow ' +
              (background === k
                ? 'ring-2 ring-blue-400'
                : 'ring-line hover:ring-line-strong')
            }
            style={{
              background: shareGradientCss(SHARE_GRADIENT_PRESETS[k].stops),
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-line pt-2">
        {SOLID_PALETTE.map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={() => onChange(hex)}
            aria-label={`Solid ${hex}`}
            className={
              'h-5 w-5 rounded-full ring-1 transition-shadow ' +
              (background.toLowerCase() === hex.toLowerCase()
                ? 'ring-2 ring-blue-400'
                : 'ring-line-strong hover:ring-line-strong')
            }
            style={{ backgroundColor: hex }}
          />
        ))}
        <label
          className="relative inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full ring-1 ring-line-strong hover:ring-line-strong"
          style={{
            background:
              'conic-gradient(from 0deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ec4899, #ef4444)',
          }}
          aria-label="Pick a custom color"
        >
          <input
            type="color"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            value={isShareHexColor(background) ? background : '#000000'}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      </div>
    </section>
  );
}

function CameraPanel({
  corner,
  size,
  onCorner,
  onSize,
}: {
  corner: ShareCameraCorner;
  size: ShareCameraSize;
  onCorner: (c: ShareCameraCorner) => void;
  onSize: (s: ShareCameraSize) => void;
}) {
  return (
    <section className="rounded-lg border border-line bg-canvas-2 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
        Camera
      </h3>
      <div className="mb-1 text-[10px] uppercase tracking-wide text-neutral-500">
        Position
      </div>
      <div className="grid grid-cols-2 gap-2">
        {CAMERA_CORNERS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onCorner(opt.value)}
            className={
              'rounded-md border px-3 py-2 text-xs ' +
              (corner === opt.value
                ? 'border-blue-400/60 bg-blue-500/10 text-blue-200'
                : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700')
            }
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="mt-3 mb-1 text-[10px] uppercase tracking-wide text-neutral-500">
        Size
      </div>
      <div className="grid grid-cols-3 gap-2">
        {CAMERA_SIZES.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSize(opt.value)}
            className={
              'rounded-md border px-3 py-2 text-xs ' +
              (size === opt.value
                ? 'border-blue-400/60 bg-blue-500/10 text-blue-200'
                : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700')
            }
          >
            {opt.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function AudioPanel({
  micMuted,
  systemMuted,
  hasMic,
  onMic,
  onSystem,
}: {
  micMuted: boolean;
  systemMuted: boolean;
  hasMic: boolean;
  onMic: (muted: boolean) => void;
  onSystem: (muted: boolean) => void;
}) {
  return (
    <section className="rounded-lg border border-line bg-canvas-2 p-3">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
        Audio
      </h3>
      <AudioToggle
        label="System sound"
        muted={systemMuted}
        onChange={onSystem}
        MutedIcon={VolumeX}
        OnIcon={Volume2}
      />
      {hasMic ? (
        <div className="mt-1.5">
          <AudioToggle
            label="Microphone"
            muted={micMuted}
            onChange={onMic}
            MutedIcon={MicOff}
            OnIcon={Mic}
          />
        </div>
      ) : (
        <p className="mt-1.5 text-[11px] text-neutral-500">
          No microphone track on this recording.
        </p>
      )}
    </section>
  );
}

function AudioToggle({
  label,
  muted,
  onChange,
  MutedIcon,
  OnIcon,
}: {
  label: string;
  muted: boolean;
  onChange: (muted: boolean) => void;
  MutedIcon: typeof X;
  OnIcon: typeof X;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!muted)}
      className="flex w-full items-center justify-between rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 hover:border-neutral-700"
    >
      <span>{label}</span>
      <span
        className={
          'inline-flex items-center gap-1 text-xs ' +
          (muted ? 'text-neutral-500' : 'text-blue-300')
        }
      >
        {muted ? (
          <MutedIcon className="h-3.5 w-3.5" />
        ) : (
          <OnIcon className="h-3.5 w-3.5" />
        )}
        {muted ? 'Muted' : 'On'}
      </span>
    </button>
  );
}

function shallowEqualConfig(a: ShareConfig, b: ShareConfig): boolean {
  return (
    a.background === b.background &&
    a.cameraCorner === b.cameraCorner &&
    a.cameraSize === b.cameraSize &&
    a.micMuted === b.micMuted &&
    a.systemMuted === b.systemMuted
  );
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// forwardRef so Radix's DialogTrigger asChild can wire its onClick.
const EditorVisibilityChip = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    visibility: 'public' | 'workspace' | 'private';
  }
>(function EditorVisibilityChip({ visibility, className, ...props }, ref) {
  const Icon =
    visibility === 'public' ? Globe : visibility === 'workspace' ? Users : Lock;
  const label =
    visibility === 'public'
      ? 'Public'
      : visibility === 'workspace'
      ? 'Workspace'
      : 'Private';
  return (
    <button
      ref={ref}
      type="button"
      className={
        'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-fg-muted transition-colors hover:bg-overlay hover:text-fg' +
        (className ? ` ${className}` : '')
      }
      {...props}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
});
