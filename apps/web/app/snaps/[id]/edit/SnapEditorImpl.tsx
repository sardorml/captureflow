'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  History,
  ImageOff,
  Loader2,
  MoveUpRight,
  Pencil,
  Redo2,
  Square,
  Trash2,
  Type as TypeIcon,
  Undo2,
  X,
} from 'lucide-react';
import {
  Arrow,
  Group,
  Image as KonvaImage,
  Layer,
  Rect,
  Stage,
  Text,
  Transformer,
} from 'react-konva';
import Konva from 'konva';
// Konva ships filters as separate modules — `Konva.Filters.Blur` is
// undefined unless the Blur filter file is side-effect-imported.
// Without this import the blur tool would silently no-op (the cached
// node has filters=[undefined]) which looked like "click does nothing".
import 'konva/lib/filters/Blur';
import { GridLoader, SmoothButton } from '@captureflow/ui';
import { AnimatedTooltip } from '@/lib/animated-tooltip';
import type { SnapEditorProps } from './SnapEditor';
import { renameSnapAction, saveSnapAction } from '../../../actions';

// Loom-style image editor. MVP tools: select, text, rect, arrow.
// Background presets (transparent + 4 gradients). Undo/redo via
// snapshot stack. Save → canvas.toBlob → server action that writes
// the PNG to R2 and bumps edited_at + size_bytes. Crop is intentionally
// deferred — the open-ended tools are higher leverage for v1.

// ── Types ────────────────────────────────────────────────────────

type Tool = 'select' | 'text' | 'rect' | 'arrow' | 'blur';

// `Background` is stored on disk as a plain string so the state JSON
// stays tiny + diffable. Three shapes are recognised:
//   - 'transparent'        → no fill, the editor body shows through
//   - <preset key>         → one of the named gradient presets below
//   - '#rrggbb'/'#rgb'     → a solid fill from the color picker / swatch
// Anything else is normalised back to 'transparent' on hydrate so a
// malformed sidecar can't poison the renderer.
type Background = string;

const GRADIENT_KEYS = [
  'violet',
  'sunset',
  'orchid',
  'forest',
  'flamingo',
  'citrus',
  'arctic',
  'ocean',
  'deep',
] as const;
type GradientKey = (typeof GRADIENT_KEYS)[number];

type AnnotationBase = { id: string };

type TextAnno = AnnotationBase & {
  kind: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fill: string;
  width: number;
};

type RectAnno = AnnotationBase & {
  kind: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
};

type ArrowAnno = AnnotationBase & {
  kind: 'arrow';
  points: number[];
  stroke: string;
  strokeWidth: number;
};

type BlurAnno = AnnotationBase & {
  kind: 'blur';
  x: number;
  y: number;
  width: number;
  height: number;
  blurRadius: number;
};

type Annotation = TextAnno | RectAnno | ArrowAnno | BlurAnno;

type EditorState = {
  background: Background;
  annotations: Annotation[];
};

// ── Background presets ──────────────────────────────────────────

// Konva's fillLinearGradientColorStops takes an interleaved
// (offset, color, offset, color, …) tuple — numbers and strings mixed.
type GradientStops = (number | string)[];

// Each gradient is a Konva linear-gradient stops array: [t, color,
// t, color, ...]. Hand-picked so the framed image reads as bordered,
// not lost in a busy backdrop.
const GRADIENT_PRESETS: Record<
  GradientKey,
  { label: string; stops: GradientStops }
> = {
  violet: {
    label: 'Violet',
    stops: [0, '#6366f1', 0.5, '#a855f7', 1, '#e9d5ff'],
  },
  sunset: {
    label: 'Sunset',
    stops: [0, '#fcd5b5', 0.55, '#f5946a', 1, '#a47bd6'],
  },
  orchid: {
    label: 'Orchid',
    stops: [0, '#7c3aed', 0.5, '#ec4899', 1, '#fb923c'],
  },
  forest: {
    label: 'Forest',
    stops: [0, '#022c22', 0.5, '#15803d', 1, '#86efac'],
  },
  flamingo: {
    label: 'Flamingo',
    stops: [0, '#9d174d', 0.5, '#db2777', 1, '#fbcfe8'],
  },
  citrus: {
    label: 'Citrus',
    stops: [0, '#f59e0b', 0.4, '#ec4899', 0.8, '#3b82f6', 1, '#1e3a8a'],
  },
  arctic: {
    label: 'Arctic',
    stops: [0, '#0ea5e9', 0.5, '#a5f3fc', 1, '#e0f2fe'],
  },
  ocean: {
    label: 'Ocean',
    stops: [0, '#0c4a6e', 0.5, '#0e7490', 1, '#67e8f9'],
  },
  deep: {
    label: 'Deep',
    stops: [0, '#312e81', 0.55, '#7c3aed', 1, '#f472b6'],
  },
};

// Quick-pick solid colors (rendered as circular swatches in the
// picker footer). Custom shades live behind the color-picker input
// on the right side of that row.
const SOLID_PALETTE = [
  '#2563eb', // blue
  '#0ea5e9', // teal
  '#65a30d', // green
  '#ca8a04', // gold
  '#db2777', // pink
  '#dc2626', // red
  '#ea580c', // orange
  '#64748b', // slate
  '#0f172a', // near-black
];

function isHexColor(v: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);
}

function isGradientKey(v: string): v is GradientKey {
  return (GRADIENT_KEYS as readonly string[]).includes(v);
}

const STROKE_PALETTE = [
  '#0a84ff', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#a855f7', // violet
  '#ffffff', // white
  '#0f172a', // near-black
];

// Constant frame ratio between the screenshot and the stage edge.
// Applied regardless of background selection so the on-screen stage
// (and the editor body padding around it) doesn't change size when
// a background is toggled — in transparent mode the inset shows the
// editor body through; in coloured mode the BackgroundLayer paints
// the frame.
// snap-editor-stage-pad-marker-v3
const BG_PADDING_RATIO = 0.12;

// Render dimensions — the stage paints at native resolution so the
// exported PNG matches the captured snap; CSS scales it down to fit
// the viewport.

function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function defaultTextAt(x: number, y: number, scale: number): TextAnno {
  return {
    id: newId(),
    kind: 'text',
    x,
    y,
    text: 'Text',
    fontSize: Math.round(28 * scale),
    fill: '#ffffff',
    // 0 = auto-fit to content; once user resizes, width is baked
    // into a real pixel value by onTransformEnd.
    width: 0,
  };
}

function defaultRectFromDrag(
  start: { x: number; y: number },
  end: { x: number; y: number },
  scale: number
): RectAnno {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  return {
    id: newId(),
    kind: 'rect',
    x,
    y,
    width,
    height,
    stroke: STROKE_PALETTE[0],
    strokeWidth: Math.round(4 * scale),
    cornerRadius: Math.round(8 * scale),
  };
}

function defaultArrowFromDrag(
  start: { x: number; y: number },
  end: { x: number; y: number },
  scale: number
): ArrowAnno {
  return {
    id: newId(),
    kind: 'arrow',
    points: [start.x, start.y, end.x, end.y],
    stroke: STROKE_PALETTE[0],
    strokeWidth: Math.round(5 * scale),
  };
}

function defaultBlurFromDrag(
  start: { x: number; y: number },
  end: { x: number; y: number },
  scale: number
): BlurAnno {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  return {
    id: newId(),
    kind: 'blur',
    x,
    y,
    width,
    height,
    blurRadius: Math.round(12 * scale),
  };
}

// ── Component ───────────────────────────────────────────────────

// Narrow whatever the sidecar JSON stored under `background` into one
// of the three shapes the renderer accepts. Anything unrecognised
// falls back to 'transparent' so a future preset (or a corrupted file)
// can't crash the editor on hydrate.
//
// `raw === null` means the user has never saved this snap (no
// `.state.json` sidecar yet). For those we open with the first
// gradient preset already applied so the editor doesn't look bare
// and the user has a one-click path to a polished public link. Once
// they save, this becomes 'violet' on disk — subsequent reopens
// follow whatever they last chose.
function hydrateBackground(raw: string | null): Background {
  if (raw === null) return 'violet';
  if (typeof raw !== 'string') return 'transparent';
  if (raw === 'transparent') return 'transparent';
  if (isGradientKey(raw)) return raw;
  if (isHexColor(raw)) return raw;
  // Legacy: 'slate' was a gradient in an earlier build. Drop it to
  // transparent so old snaps re-open cleanly under the new picker.
  return 'transparent';
}

// Annotations come back as `unknown[]` because the action is shared
// with the server (which can't pull in the Konva types). We trust
// shapes we wrote ourselves but still gate on a defensively-typed
// kind check so a corrupted sidecar can't poison the renderer.
function hydrateAnnotations(raw: unknown[] | null): Annotation[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (a): a is Annotation =>
      !!a &&
      typeof a === 'object' &&
      'kind' in a &&
      (a.kind === 'text' ||
        a.kind === 'rect' ||
        a.kind === 'arrow' ||
        a.kind === 'blur')
  );
}

export function SnapEditorImpl(props: SnapEditorProps) {
  const router = useRouter();
  const {
    snapId,
    imageUrl,
    width: imgW,
    height: imgH,
    viewUrl,
    initialTitle,
    initialBackground,
    initialAnnotations,
  } = props;

  // Editable title state — backed by `renameSnapAction`. Live string
  // tracks the input + the static label; both flip into edit mode on
  // pencil click. The action persists; we update the in-memory copy
  // so the header label matches without waiting on a router refresh.
  const [title, setTitle] = useState<string>(initialTitle ?? '');
  const [titleDraft, setTitleDraft] = useState<string>(initialTitle ?? '');
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleSaving, setTitleSaving] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inspectorRef = useRef<HTMLDivElement>(null);

  // Reference to each annotation Konva node by id, so the Transformer
  // can resolve `.nodes([node])` from `selectedId`.
  const nodeRefs = useRef<Map<string, Konva.Node>>(new Map());

  // Image element loaded async so Konva.Image has a real source.
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);

  // The source image's natural dimensions drive every layout
  // calculation below. We can't use `imgW`/`imgH` from props because
  // those are the D1 row's width/height, which after the first save
  // hold the *composed* stage size (image + bg padding). Loading the
  // pristine source PNG and reading `naturalWidth/Height` always
  // gives the dimensions of the actual pixels — no stretching when
  // the editor reopens a previously-saved snap.
  const [naturalSize, setNaturalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);

  // Editor state + undo/redo stack. `state` is current; `past` /
  // `future` hold snapshots. Annotation drags + transforms call
  // `commit` on end so each completed gesture is one undo step.
  const [state, setState] = useState<EditorState>(() => ({
    background: hydrateBackground(initialBackground),
    annotations: hydrateAnnotations(initialAnnotations),
  }));
  const [past, setPast] = useState<EditorState[]>([]);
  const [future, setFuture] = useState<EditorState[]>([]);

  const [tool, setTool] = useState<Tool>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Drag-out state for rect / arrow placement. Discriminated union so
  // `drawing.current` narrows to the right annotation shape (TS can
  // then check `.points` / `.width` access correctly).
  type DrawingState =
    | { kind: 'rect'; start: { x: number; y: number }; current: RectAnno }
    | { kind: 'arrow'; start: { x: number; y: number }; current: ArrowAnno }
    | { kind: 'blur'; start: { x: number; y: number }; current: BlurAnno };
  const [drawing, setDrawing] = useState<DrawingState | null>(null);

  // Saving state — disables the button + paints a spinner. After a
  // successful save we copy the public link and show a "Copied!"
  // confirmation flash.
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedJustNow, setSavedJustNow] = useState(false);

  // We measure the canvas-surface box and pass it to Konva as explicit
  // pixel dimensions. Pure-CSS sizing doesn't work here because Konva
  // mounts a child <canvas> per Layer and sizes each canvas from the
  // Stage's `width`/`height` props directly (the Stage `style` only
  // affects the wrapper div, not the nested canvases). Without an
  // explicit pixel size we'd either overflow at native res or paint
  // at 0×0. A single ref callback owns both the ref and a
  // ResizeObserver — no useEffect, no window listener, cleans itself
  // up when React calls the callback with `null` on unmount.
  const [containerBox, setContainerBox] = useState<{
    w: number;
    h: number;
  }>({ w: 0, h: 0 });
  const containerRefCb = useCallback(
    (node: HTMLDivElement | null): (() => void) | void => {
      containerRef.current = node;
      if (!node) return;
      const measure = (): void => {
        const r = node.getBoundingClientRect();
        setContainerBox({ w: r.width, h: r.height });
      };
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(node);
      // React 19 calls the ref callback's return function on unmount,
      // matching the cleanup contract of useEffect — disconnect there.
      return () => ro.disconnect();
    },
    []
  );

  // ── Image load ────────────────────────────────────────────────
  // We deliberately go through `fetch` + `URL.createObjectURL` instead
  // of pointing the <img> element directly at the R2 URL. Reason:
  // browsers (Brave especially) cache the pre-CORS response of a CDN
  // asset once, then refuse to swap it out even after the bucket gains
  // CORS headers — because `<img crossOrigin>` only matches a cached
  // entry that was originally fetched with CORS. `fetch({ cache:
  // 'reload' })` forces a network revalidation with the right Origin
  // so we always get a fresh, CORS-tagged response. Once that lands
  // we hand the bytes to Konva via an object URL, which is
  // same-origin and never gets reflected back through the disk cache.
  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    void (async () => {
      try {
        const res = await fetch(imageUrl, {
          cache: 'reload',
          mode: 'cors',
          credentials: 'omit',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        const img = new window.Image();
        img.onload = () => {
          if (cancelled) return;
          setImage(img);
          setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
        };
        img.onerror = () => {
          if (!cancelled) setImageLoadError('Failed to decode snap image.');
        };
        img.src = objectUrl;
      } catch {
        if (!cancelled) {
          setImageLoadError(
            'Could not load the snap image. The bucket may have lost CORS access.'
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageUrl]);

  // ── Transformer wiring ────────────────────────────────────────
  useEffect(() => {
    if (!transformerRef.current) return;
    if (!selectedId) {
      transformerRef.current.nodes([]);
      return;
    }
    const node = nodeRefs.current.get(selectedId);
    if (node) {
      transformerRef.current.nodes([node]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, state.annotations]);

  // Clicks anywhere outside the Stage container and the floating
  // ElementInspector clear the selection. Clicks inside the Stage
  // already route through `handleStageMouseDown`, which handles
  // empty-area deselect on its own — we deliberately skip those.
  useEffect(() => {
    if (!selectedId) return;
    const onPointerDown = (e: MouseEvent): void => {
      const target = e.target as Node | null;
      if (!target) return;
      if (containerRef.current?.contains(target)) return;
      if (inspectorRef.current?.contains(target)) return;
      setSelectedId(null);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [selectedId]);

  // ── State helpers ─────────────────────────────────────────────
  const commit = useCallback(
    (next: EditorState): void => {
      setPast((p) => [...p, state]);
      setFuture([]);
      setState(next);
    },
    [state]
  );

  const undo = (): void => {
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    setPast(past.slice(0, -1));
    setFuture((f) => [state, ...f]);
    setState(prev);
    setSelectedId(null);
  };

  const redo = (): void => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(future.slice(1));
    setPast((p) => [...p, state]);
    setState(next);
    setSelectedId(null);
  };

  // Reset clears every annotation + restores the default transparent
  // background. Goes through `commit` so the wipe is itself one undo
  // step — the user can still recover from an accidental reset.
  const reset = (): void => {
    setSelectedId(null);
    commit({ background: 'transparent', annotations: [] });
  };

  // Title rename — submit on Enter / blur / explicit Save. Reverts
  // the draft on cancel so the static label always reflects what's
  // actually on the server.
  const commitTitle = async (): Promise<void> => {
    const next = titleDraft.trim();
    if (next === (title ?? '').trim()) {
      setTitleEditing(false);
      return;
    }
    setTitleSaving(true);
    setTitleError(null);
    try {
      const res = await renameSnapAction(snapId, next);
      if (res.error) {
        setTitleError(res.error);
        return;
      }
      setTitle(next);
      setTitleEditing(false);
    } finally {
      setTitleSaving(false);
    }
  };

  const cancelTitleEdit = (): void => {
    setTitleDraft(title ?? '');
    setTitleEditing(false);
    setTitleError(null);
  };

  // Becomes true once the user has actually made edits worth resetting
  // — keeps the button disabled on a pristine snap so the tooltip
  // doesn't promise something the click can't deliver.
  const hasEdits =
    state.annotations.length > 0 || state.background !== 'transparent';

  const updateAnnotation = useCallback(
    (id: string, patch: Partial<Annotation>): void => {
      commit({
        ...state,
        annotations: state.annotations.map((a) =>
          a.id === id ? ({ ...a, ...patch } as Annotation) : a
        ),
      });
    },
    [commit, state]
  );

  const removeSelected = (): void => {
    if (!selectedId) return;
    commit({
      ...state,
      annotations: state.annotations.filter((a) => a.id !== selectedId),
    });
    setSelectedId(null);
  };

  // Cancel selection / drawing on Escape; Delete removes selection;
  // ⌘Z / ⌘⇧Z drive undo + redo. The handler reads `past` / `future`
  // / `state` so they're listed as deps — without them, the listener
  // closed over the first-render's (empty) history and undo never
  // popped anything. The bind/unbind churn is one pair per snapshot,
  // which is fine. Declared after `undo`/`redo`/`removeSelected` so
  // the handler closes over real references instead of forward decls.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      // Don't hijack keystrokes while the user is typing into a real
      // input (the title-edit field below, etc).
      const target = e.target as HTMLElement | null;
      if (target && /^(input|textarea)$/i.test(target.tagName)) return;
      if (e.key === 'Escape') {
        setSelectedId(null);
        setDrawing(null);
        setTool('select');
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        removeSelected();
      }
      // `e.code === 'KeyZ'` so the binding survives layouts where
      // `e.key` reports the localized character. `e.metaKey` covers
      // macOS, `e.ctrlKey` covers Linux/Windows.
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.code === 'KeyZ' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (
        (isMeta && e.code === 'KeyZ' && e.shiftKey) ||
        (isMeta && e.code === 'KeyY')
      ) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, past, future, state]);

  const setBackground = (background: Background): void => {
    commit({ ...state, background });
  };

  // ── Stage event handlers ─────────────────────────────────────
  const handleStageMouseDown = (
    e: Konva.KonvaEventObject<MouseEvent>
  ): void => {
    // Click on the stage background (not on a child) deselects.
    const clickedOnEmpty = e.target === e.target.getStage();

    if (tool === 'select') {
      // Transformer anchor — let Konva handle the resize gesture.
      if (e.target.hasName('_anchor')) return;
      // Walk up to see if the click landed on an annotation node.
      // If so, select it; otherwise the click is on the background
      // (Stage itself, the KonvaImage screenshot, decorative rects)
      // and should deselect.
      let node: Konva.Node | null = e.target;
      const stage = e.target.getStage();
      while (node && node !== stage) {
        for (const [id, ref] of nodeRefs.current.entries()) {
          if (ref === node) {
            setSelectedId(id);
            return;
          }
        }
        node = node.getParent();
      }
      setSelectedId(null);
      return;
    }

    if (!image) return;
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getRelativePointerPosition();
    if (!pos) return;

    // Two early-exits keep draw tools from stomping on selection:
    //  (a) the Konva Transformer's anchor handles also fire
    //      stage-level mousedown when grabbed — without this bail,
    //      a resize gesture also creates a brand-new shape on top.
    //  (b) clicking the BODY of an existing annotation should select
    //      it (and flip to the select tool so the user can drag /
    //      resize the next instant) instead of layering a new shape
    //      over the one they tried to grab.
    if (!clickedOnEmpty) {
      if (e.target.hasName('_anchor')) return;
      let node: Konva.Node | null = e.target;
      while (node && node !== stage) {
        for (const [id, ref] of nodeRefs.current.entries()) {
          if (ref === node) {
            setSelectedId(id);
            setTool('select');
            return;
          }
        }
        node = node.getParent();
      }
    }

    // Annotations live in stage coords (native image resolution). The
    // canvas is CSS-scaled to fit the viewport via `displayScale`, so
    // a default size of "28 stage-px" would render as `28 * displayScale`
    // on screen. We invert the scale so defaults stay screen-sized.
    const sizeScale = displayScale > 0 ? 1 / displayScale : 1;

    if (tool === 'text') {
      const anno = defaultTextAt(pos.x, pos.y, sizeScale);
      commit({ ...state, annotations: [...state.annotations, anno] });
      setSelectedId(anno.id);
      setTool('select');
      return;
    }

    if (tool === 'rect') {
      setDrawing({
        kind: 'rect',
        start: pos,
        current: defaultRectFromDrag(pos, pos, sizeScale),
      });
    } else if (tool === 'arrow') {
      setDrawing({
        kind: 'arrow',
        start: pos,
        current: defaultArrowFromDrag(pos, pos, sizeScale),
      });
    } else if (tool === 'blur') {
      setDrawing({
        kind: 'blur',
        start: pos,
        current: defaultBlurFromDrag(pos, pos, sizeScale),
      });
    }
  };

  const handleStageMouseMove = (): void => {
    if (!drawing) return;
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getRelativePointerPosition();
    if (!pos) return;
    const sizeScale = displayScale > 0 ? 1 / displayScale : 1;
    if (drawing.kind === 'rect') {
      setDrawing({
        kind: 'rect',
        start: drawing.start,
        current: defaultRectFromDrag(drawing.start, pos, sizeScale),
      });
    } else if (drawing.kind === 'arrow') {
      setDrawing({
        kind: 'arrow',
        start: drawing.start,
        current: defaultArrowFromDrag(drawing.start, pos, sizeScale),
      });
    } else {
      setDrawing({
        kind: 'blur',
        start: drawing.start,
        current: defaultBlurFromDrag(drawing.start, pos, sizeScale),
      });
    }
  };

  const handleStageMouseUp = (): void => {
    if (!drawing) return;
    // Single-click without drag → promote to a default-sized shape
    // centered on the click point. Earlier behaviour was to discard
    // anything < 4px which made the tool feel broken ("I clicked rect
    // and nothing happened"). Loom + CleanShot both insert a default
    // shape on click; drag overrides the size.
    const sizeScale = displayScale > 0 ? 1 / displayScale : 1;
    const tooSmall =
      drawing.kind === 'rect' || drawing.kind === 'blur'
        ? drawing.current.width < 4 || drawing.current.height < 4
        : Math.abs(drawing.current.points[2] - drawing.current.points[0]) < 6 &&
          Math.abs(drawing.current.points[3] - drawing.current.points[1]) < 6;
    let toCommit: Annotation = drawing.current as Annotation;
    if (tooSmall) {
      const sx = drawing.start.x;
      const sy = drawing.start.y;
      if (drawing.kind === 'rect') {
        toCommit = defaultRectFromDrag(
          { x: sx - 100 * sizeScale, y: sy - 70 * sizeScale },
          { x: sx + 100 * sizeScale, y: sy + 70 * sizeScale },
          sizeScale
        );
      } else if (drawing.kind === 'blur') {
        toCommit = defaultBlurFromDrag(
          { x: sx - 90 * sizeScale, y: sy - 60 * sizeScale },
          { x: sx + 90 * sizeScale, y: sy + 60 * sizeScale },
          sizeScale
        );
      } else {
        toCommit = defaultArrowFromDrag(
          { x: sx - 60 * sizeScale, y: sy - 60 * sizeScale },
          { x: sx + 60 * sizeScale, y: sy + 60 * sizeScale },
          sizeScale
        );
      }
    }
    commit({
      ...state,
      annotations: [...state.annotations, toCommit],
    });
    setSelectedId(toCommit.id);
    setDrawing(null);
    // Switch back to `select` so the shape we just created becomes
    // immediately draggable / resizable. If we kept the draw tool
    // active, the next mousedown on the shape would (a) be ignored
    // by Konva's drag system (draggable was false during that down-
    // event) and (b) fall through to creating yet another shape.
    setTool('select');
  };

  // ── Save flow ─────────────────────────────────────────────────
  const handleSave = async (): Promise<void> => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const stage = stageRef.current;
      if (!stage) throw new Error('Editor not mounted');

      // De-select so the transformer's handles aren't baked into
      // the exported PNG.
      const previouslySelected = selectedId;
      setSelectedId(null);
      // Allow React + Konva to commit the deselect before the toBlob.
      await new Promise((r) => requestAnimationFrame(r));

      // Export the full padded stage so the chosen background and
      // every annotation get baked into the public PNG — that's what
      // makes the shared link look like what the user previewed
      // (a Loom-style framed screenshot).
      //
      // The Stage is rendered at `stageW × displayScale` on-screen so
      // it fits the viewport. With `pixelRatio: 1` the export would
      // come out at that downscaled size (~30% of native on big
      // displays) and the public PNG would be blurry. Counter the
      // on-screen scale with `1 / displayScale` so the export is
      // always at the snap's native pixel resolution regardless of
      // how the stage happens to be sized in the editor.
      //
      // `canvas.toBlob('image/png')` runs in a browser worker thread
      // and finishes in ~200ms for a 3500×2400 canvas. We used to
      // pipe the RGBA through upng-js for a ~25% smaller PNG, but
      // that ran on the main thread and froze the save button for
      // 2-5 seconds. The size hit is small enough to absorb in the
      // server-action body limit instead.
      const exportCanvas = stage.toCanvas({
        pixelRatio: 1 / displayScale,
      });
      const exportW = exportCanvas.width;
      const exportH = exportCanvas.height;

      // Pull RGBA bytes and ship them to a Web Worker for palette
      // re-encoding (UPNG with cnum: 256). Loom/CleanShot ship
      // PNG-8 here — same visual quality on screenshots, 5-10x
      // smaller bytes (~500 KB vs ~3 MB for a retina capture with
      // bg). The encode itself is 2-5 s of pure-JS deflate; running
      // it off-thread keeps the save button responsive.
      const exportCtx = exportCanvas.getContext('2d');
      if (!exportCtx) throw new Error('Could not acquire export canvas');
      const rgba = exportCtx.getImageData(0, 0, exportW, exportH);

      const pngBuf = await new Promise<ArrayBuffer>((resolve, reject) => {
        const worker = new Worker(
          new URL('./encode-worker.ts', import.meta.url),
          { type: 'module' }
        );
        worker.onmessage = (
          e: MessageEvent<
            { ok: true; png: ArrayBuffer } | { ok: false; error: string }
          >
        ) => {
          worker.terminate();
          if (e.data.ok) resolve(e.data.png);
          else reject(new Error(e.data.error));
        };
        worker.onerror = (e) => {
          worker.terminate();
          reject(new Error(e.message || 'PNG encode worker crashed'));
        };
        // Transfer the RGBA buffer into the worker — zero-copy
        // across the boundary on a multi-MB payload.
        const transferable = rgba.data.buffer as ArrayBuffer;
        worker.postMessage(
          {
            buffer: transferable,
            width: exportW,
            height: exportH,
            cnum: 256,
          },
          [transferable]
        );
      });
      const blob = new Blob([pngBuf], { type: 'image/png' });

      const res = await saveSnapAction(snapId, blob, {
        background: state.background,
        annotations: state.annotations,
        width: exportW,
        height: exportH,
      });
      if (res.error) {
        setSaveError(res.error);
        return;
      }
      // Copy the public view URL — Loom-style "save and copy link"
      // matches the desktop's existing share-modal CTA.
      try {
        await navigator.clipboard.writeText(viewUrl);
      } catch {
        // Clipboard might be unavailable (insecure context); the link
        // is still visible in the header.
      }
      setSavedJustNow(true);
      setTimeout(() => setSavedJustNow(false), 2000);
      // Restore selection (rare but if the user edits again right
      // after save, they expect their selection back).
      if (previouslySelected) setSelectedId(previouslySelected);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  // ── Derived: stage dimensions ────────────────────────────────
  // The stage is ALWAYS the natural screenshot size — picking a
  // background never grows the canvas. Instead the screenshot itself
  // scales down inside the constant stage so the bg can fill the
  // newly-visible strip around it. This keeps the outer editor
  // padding rock-stable: toggling between transparent and any bg
  // moves zero pixels in the editor body.
  const stageDims = useMemo(() => {
    // `naturalSize` is set once the source PNG actually loads. Until
    // then we fall back to the D1 row's dims so the wrapper has a
    // placeholder size — the Stage itself doesn't render until the
    // image is in place so users never see the placeholder.
    const w = naturalSize?.w ?? imgW;
    const h = naturalSize?.h ?? imgH;
    const hasBg = state.background !== 'transparent';
    if (!hasBg) {
      return {
        stageW: w,
        stageH: h,
        imgX: 0,
        imgY: 0,
        imgRenderW: w,
        imgRenderH: h,
      };
    }
    // Equal pixel pad on every side. Anchor to the smaller of w/h
    // so the strip looks symmetric on both axes. Grow the stage by
    // `2 * pad` in each dimension so the screenshot keeps its native
    // aspect inside the frame — shrinking the image into an unchanged
    // stage stretched landscape snaps and was the source of repeated
    // user complaints.
    const pad = Math.round(Math.min(w, h) * BG_PADDING_RATIO);
    return {
      stageW: w + pad * 2,
      stageH: h + pad * 2,
      imgX: pad,
      imgY: pad,
      imgRenderW: w,
      imgRenderH: h,
    };
  }, [imgW, imgH, naturalSize, state.background]);

  // Fit the (constant-size) stage into whatever box the canvas
  // surface actually has after `p-16 md:p-20`. `min(1, …)` so we
  // never *upscale* a smaller snap past native res — fractional
  // pixels get blurry fast on text annotations. Recomputes on
  // container resize via the box state above. React Compiler handles
  // the memoization; a manual useMemo over `stageDims` (itself a
  // useMemo whose return identity can't be preserved through here)
  // tripped react-hooks/preserve-manual-memoization on CI.
  const displayScale =
    containerBox.w <= 0 || containerBox.h <= 0
      ? 1
      : Math.min(
          1,
          containerBox.w / stageDims.stageW,
          containerBox.h / stageDims.stageH
        );

  const selectedAnno = selectedId
    ? state.annotations.find((a) => a.id === selectedId)
    : null;

  // ── Render ───────────────────────────────────────────────────

  if (imageLoadError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 text-center text-sm text-neutral-400">
        <ImageOff className="h-8 w-8 text-neutral-500" />
        <p className="mt-4 max-w-md">{imageLoadError}</p>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col bg-neutral-950">
      {/* ── Top bar ──────────────────────────────────────────
          Back arrow on the left, annotation toolbar centered,
          undo/redo + save flush right. Sized at h-16 so the
          centered toolbar has room to breathe and the row stays
          aligned with the editor's larger control surface.
      */}
      <header className="relative flex h-20 shrink-0 items-center justify-between border-b border-line px-4">
        {/* On `lg:` and up the annotation toolbar sits centered in
            the header, so cap the title cluster at `calc(50% - 220px)`
            and let it ellipsise before it can slide underneath the
            toolbar tiles. Below `lg:` the toolbar is hidden — drop
            the cap so the title can stretch into the freed space and
            ellipsise only against the right-hand cluster. */}
        <div className="flex min-w-0 flex-1 items-center gap-2 lg:max-w-[calc(50%-220px)]">
          <IconButton
            onClick={() => router.push('/snaps')}
            tooltip="Back to snaps"
            ariaLabel="Back to snaps"
          >
            <ArrowLeft className="h-5 w-5" />
          </IconButton>
          {/* Editable title. Hover the static label → pencil hint;
              click to edit, Enter or blur commits via renameSnapAction.
              Marketing-style headlines are long, so cap the static
              span with truncate to keep the header at one row. */}
          {titleEditing ? (
            <form
              className="flex min-w-0 items-center gap-1"
              onSubmit={(e) => {
                e.preventDefault();
                void commitTitle();
              }}
            >
              <input
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={() => void commitTitle()}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelTitleEdit();
                  }
                }}
                maxLength={200}
                placeholder="Untitled snap"
                disabled={titleSaving}
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
                {title?.trim() || 'Untitled snap'}
              </span>
              <Pencil className="h-3.5 w-3.5 shrink-0 text-neutral-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          )}
          {titleError && (
            <span className="text-xs text-red-400">{titleError}</span>
          )}
        </div>

        {/* Absolute-positioned middle slot so the toolbar is anchored
            to the actual page center, independent of the left/right
            cluster widths — `flex-1 justify-center` only centers
            within the leftover space, which shifts every time the
            right-hand cluster grows (e.g. "Saved · link copied").
            Hidden below `lg:` — the annotation toolbar requires a
            pointer canvas big enough to draw on, and small-viewport
            users mainly view/save, so we drop it to free header
            room until there's enough width to draw comfortably. */}
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex">
          <div className="pointer-events-auto">
            <Toolbar
              tool={tool}
              onTool={(t) => {
                setTool(t);
                setSelectedId(null);
              }}
              background={state.background}
              onBackground={setBackground}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            onClick={reset}
            disabled={!hasEdits}
            tooltip="Reset edits"
            ariaLabel="Reset edits"
          >
            <History className="h-5 w-5" />
          </IconButton>
          <IconButton
            onClick={undo}
            disabled={past.length === 0}
            tooltip="Undo (⌘Z)"
            ariaLabel="Undo"
          >
            <Undo2 className="h-5 w-5" />
          </IconButton>
          <IconButton
            onClick={redo}
            disabled={future.length === 0}
            tooltip="Redo (⌘⇧Z)"
            ariaLabel="Redo"
          >
            <Redo2 className="h-5 w-5" />
          </IconButton>
          <SmoothButton
            type="button"
            variant="candy"
            onClick={handleSave}
            disabled={saving || !image}
            className="ml-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : savedJustNow ? (
              <Check className="h-4 w-4" />
            ) : null}
            {savedJustNow ? 'Saved · link copied' : 'Save and copy link'}
          </SmoothButton>
        </div>
      </header>

      {saveError && (
        <div className="border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-center text-xs text-red-200">
          {saveError}
        </div>
      )}

      {/* ── Canvas surface ───────────────────────────────────────
          Two nested divs:
          - Outer (`p-16 md:p-20`): paints the breathing-room
            padding around the canvas. `overflow-hidden` clips any
            stray Konva descendant that ignores its parent's size.
          - Inner (measured by `containerRefCb`): the actual space
            the Stage gets to fill. We must measure the *inner* box,
            not the outer one — `getBoundingClientRect()` includes
            padding, so measuring the outer div would scale the
            Stage up to fill the padded region too and the visible
            gutter would vanish (which is exactly what kept happening).
          The Stage paints at scaled pixel size so each Konva-managed
          <canvas> child comes out at the right size — pure CSS
          sizing on the Stage wrapper alone doesn't reach those
          nested canvases.
      */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden p-2 md:p-10">
        {selectedAnno && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center">
            <div ref={inspectorRef} className="pointer-events-auto">
              <ElementInspector
                annotation={selectedAnno}
                onChange={(patch) => updateAnnotation(selectedAnno.id, patch)}
                onDuplicate={() => {
                  const dup: Annotation =
                    selectedAnno.kind === 'arrow'
                      ? {
                          ...selectedAnno,
                          id: newId(),
                          points: selectedAnno.points.map((v, i) =>
                            i % 2 === 0 ? v + 16 : v + 16
                          ),
                        }
                      : ({
                          ...selectedAnno,
                          id: newId(),
                          x: selectedAnno.x + 16,
                          y: selectedAnno.y + 16,
                        } as Annotation);
                  commit({
                    ...state,
                    annotations: [...state.annotations, dup],
                  });
                  setSelectedId(dup.id);
                }}
                onDelete={removeSelected}
              />
            </div>
          </div>
        )}
        <div
          ref={containerRefCb}
          className="flex min-h-0 min-w-0 flex-1 items-center justify-center"
        >
          {!image ? (
            <GridLoader size={9} className="text-neutral-500" />
          ) : (
            <div
              className="rounded-lg"
              style={{
                width: stageDims.stageW * displayScale,
                height: stageDims.stageH * displayScale,
              }}
            >
              <Stage
                ref={stageRef}
                width={stageDims.stageW * displayScale}
                height={stageDims.stageH * displayScale}
                scaleX={displayScale}
                scaleY={displayScale}
                onMouseDown={handleStageMouseDown}
                onMouseMove={handleStageMouseMove}
                onMouseUp={handleStageMouseUp}
                style={{
                  cursor:
                    tool === 'text'
                      ? 'text'
                      : tool === 'rect' || tool === 'arrow' || tool === 'blur'
                      ? 'crosshair'
                      : 'default',
                }}
              >
                <Layer>
                  <BackgroundLayer
                    background={state.background}
                    width={stageDims.stageW}
                    height={stageDims.stageH}
                  />
                  <KonvaImage
                    image={image}
                    x={stageDims.imgX}
                    y={stageDims.imgY}
                    width={stageDims.imgRenderW}
                    height={stageDims.imgRenderH}
                    cornerRadius={
                      state.background === 'transparent'
                        ? 0
                        : Math.round(stageDims.imgRenderW * 0.01)
                    }
                  />

                  {state.annotations.map((a) => (
                    <AnnotationNode
                      key={a.id}
                      annotation={a}
                      selectable={tool === 'select'}
                      registerNode={(node) => {
                        if (node) nodeRefs.current.set(a.id, node);
                        else nodeRefs.current.delete(a.id);
                      }}
                      onSelect={() => setSelectedId(a.id)}
                      onChange={(patch) => updateAnnotation(a.id, patch)}
                      sourceImage={image}
                      imgRect={{
                        x: stageDims.imgX,
                        y: stageDims.imgY,
                        w: stageDims.imgRenderW,
                        h: stageDims.imgRenderH,
                      }}
                    />
                  ))}

                  {drawing && (
                    <AnnotationNode
                      annotation={drawing.current}
                      selectable={false}
                      registerNode={() => {}}
                      onSelect={() => {}}
                      onChange={() => {}}
                      sourceImage={image}
                      imgRect={{
                        x: stageDims.imgX,
                        y: stageDims.imgY,
                        w: stageDims.imgRenderW,
                        h: stageDims.imgRenderH,
                      }}
                    />
                  )}

                  <Transformer
                    ref={transformerRef}
                    rotateEnabled={false}
                    ignoreStroke
                    anchorSize={8}
                    borderStroke="#0a84ff"
                    anchorStroke="#0a84ff"
                    anchorFill="#ffffff"
                  />
                </Layer>
              </Stage>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function Toolbar({
  tool,
  onTool,
  background,
  onBackground,
}: {
  tool: Tool;
  onTool: (t: Tool) => void;
  background: Background;
  onBackground: (b: Background) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-canvas-2 p-1 shadow-sm ring-1 ring-line">
      <ToolButton
        active={tool === 'text'}
        onClick={() => onTool('text')}
        title="Text"
      >
        <TypeIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        active={tool === 'rect'}
        onClick={() => onTool('rect')}
        title="Rectangle"
      >
        <Square className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        active={tool === 'arrow'}
        onClick={() => onTool('arrow')}
        title="Arrow"
      >
        <ArrowUpRight className="h-4 w-4" />
      </ToolButton>
      {/* Blur tool removed for now — the cached-image-filter pipeline
          ships in db-level annotations but the click-to-insert UX
          isn't stable yet. Drop the toolbar button so no new blurs
          can be created; existing rendering paths stay so legacy
          saved blurs still resolve. */}
      <div className="mx-1 h-5 w-px bg-overlay-strong" />
      <BackgroundPicker active={background} onChange={onBackground} />
    </div>
  );
}

// Header icon button — wraps the trigger in the shared AnimatedTooltip
// (same component the desktop app uses) so edge buttons don't clip
// their label and the tooltip animates consistently across services.
function IconButton({
  onClick,
  disabled,
  tooltip,
  ariaLabel,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  tooltip: string;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatedTooltip content={tooltip} placement="bottom">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-overlay hover:text-fg-strong disabled:opacity-40 disabled:hover:bg-transparent"
      >
        {children}
      </button>
    </AnimatedTooltip>
  );
}

function ToolButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={
        'inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ' +
        (active
          ? 'bg-canvas text-fg-strong shadow-md ring-2 ring-fg-muted'
          : 'text-fg-muted hover:bg-overlay hover:text-fg-strong')
      }
    >
      {children}
    </button>
  );
}

// Trigger swatch shown inside the toolbar's ToolButton — compact
// 20×20 square that visually reflects the active background.
function BackgroundSwatch({ bg }: { bg: Background }) {
  if (bg === 'transparent') {
    return (
      <span
        className="block h-5 w-5 rounded-sm"
        style={{
          backgroundImage:
            'linear-gradient(45deg, #555 25%, transparent 25%), linear-gradient(-45deg, #555 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #555 75%), linear-gradient(-45deg, transparent 75%, #555 75%)',
          backgroundSize: '8px 8px',
          backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0',
        }}
      />
    );
  }
  if (isHexColor(bg)) {
    return (
      <span
        className="block h-5 w-5 rounded-sm"
        style={{ backgroundColor: bg }}
      />
    );
  }
  if (isGradientKey(bg)) {
    return (
      <span
        className="block h-5 w-5 rounded-sm"
        style={{ background: gradientCss(GRADIENT_PRESETS[bg].stops) }}
      />
    );
  }
  return null;
}

function gradientCss(stops: GradientStops): string {
  const parts: string[] = [];
  for (let i = 0; i < stops.length; i += 2) {
    parts.push(`${stops[i + 1]} ${(stops[i] as number) * 100}%`);
  }
  return `linear-gradient(135deg, ${parts.join(', ')})`;
}

// Popover picker. Mirrors the Loom/CleanShot pattern: a labelled
// dialog with a 3-col grid of gradient tiles ("None" + 9 presets)
// and a footer row of solid swatches + a native color picker.
function BackgroundPicker({
  active,
  onChange,
}: {
  active: Background;
  onChange: (b: Background) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <ToolButton
        active={false}
        onClick={() => setOpen((v) => !v)}
        title="Background"
      >
        <BackgroundSwatch bg={active} />
      </ToolButton>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-xl bg-neutral-900 p-3 shadow-2xl ring-1 ring-line-strong">
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-sm font-medium text-neutral-100">
              Add a background
            </h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-fg-muted hover:bg-overlay hover:text-fg-strong"
              aria-label="Close background picker"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* "None" tile sits in the grid as the first cell so the
                user reads it as the off-state of the same picker
                instead of a separate toggle. */}
            <button
              type="button"
              onClick={() => {
                onChange('transparent');
                setOpen(false);
              }}
              className={
                'flex h-14 items-center justify-center rounded-lg bg-neutral-800 text-sm font-medium text-neutral-100 ring-1 transition-colors ' +
                (active === 'transparent'
                  ? 'ring-blue-400'
                  : 'ring-line hover:ring-line-strong')
              }
            >
              None
            </button>
            {GRADIENT_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  onChange(k);
                  setOpen(false);
                }}
                className={
                  'h-14 rounded-lg ring-1 transition-shadow ' +
                  (active === k
                    ? 'ring-2 ring-blue-400'
                    : 'ring-line hover:ring-line-strong')
                }
                style={{ background: gradientCss(GRADIENT_PRESETS[k].stops) }}
                title={GRADIENT_PRESETS[k].label}
              />
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
            {SOLID_PALETTE.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => {
                  onChange(hex);
                  setOpen(false);
                }}
                className={
                  'h-6 w-6 rounded-full ring-1 transition-shadow ' +
                  (active.toLowerCase() === hex.toLowerCase()
                    ? 'ring-2 ring-blue-400'
                    : 'ring-line-strong hover:ring-line-strong')
                }
                style={{ backgroundColor: hex }}
                aria-label={`Solid ${hex}`}
              />
            ))}
            {/* Native color picker — the `<input type="color">` is
                visually hidden behind a circular trigger painted with
                a conic rainbow so it reads as "custom color". */}
            <label
              className="relative inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full ring-1 ring-line-strong hover:ring-line-strong"
              style={{
                background:
                  'conic-gradient(from 0deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ec4899, #ef4444)',
              }}
              aria-label="Pick a custom color"
            >
              <input
                type="color"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                value={isHexColor(active) ? active : '#000000'}
                onChange={(e) => onChange(e.target.value)}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

function BackgroundLayer({
  background,
  width,
  height,
}: {
  background: Background;
  width: number;
  height: number;
}) {
  if (background === 'transparent') return null;
  if (isHexColor(background)) {
    return (
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={background}
        listening={false}
      />
    );
  }
  if (isGradientKey(background)) {
    const preset = GRADIENT_PRESETS[background];
    return (
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: width, y: height }}
        fillLinearGradientColorStops={preset.stops}
        listening={false}
      />
    );
  }
  return null;
}

function AnnotationNode({
  annotation,
  selectable,
  registerNode,
  onSelect,
  onChange,
  sourceImage,
  imgRect,
}: {
  annotation: Annotation;
  selectable: boolean;
  registerNode: (node: Konva.Node | null) => void;
  onSelect: () => void;
  onChange: (patch: Partial<Annotation>) => void;
  // The underlying snap image + its placement on the stage. Needed so
  // blur annotations can re-render a clipped, Gaussian-blurred copy of
  // the source pixels under the blur rect.
  sourceImage?: HTMLImageElement | null;
  imgRect?: { x: number; y: number; w: number; h: number };
}) {
  // Common drag commit — invoked on dragEnd so each drag is one undo
  // step instead of one per pointermove.
  const onDragEnd = (e: Konva.KonvaEventObject<DragEvent>): void => {
    if (annotation.kind === 'arrow') {
      // Arrow drag offset → bake into points so we don't accumulate
      // a transform on top of the points array.
      const node = e.target;
      const dx = node.x();
      const dy = node.y();
      onChange({
        points: annotation.points.map((v, i) =>
          i % 2 === 0 ? v + dx : v + dy
        ),
      } as Partial<Annotation>);
      node.position({ x: 0, y: 0 });
      return;
    }
    onChange({ x: e.target.x(), y: e.target.y() } as Partial<Annotation>);
  };

  const commonProps = {
    draggable: selectable,
    onClick: selectable ? onSelect : undefined,
    onTap: selectable ? onSelect : undefined,
    onDragEnd,
  };

  if (annotation.kind === 'text') {
    return (
      <Text
        ref={(n) => registerNode(n)}
        x={annotation.x}
        y={annotation.y}
        text={annotation.text}
        fontSize={annotation.fontSize}
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fill={annotation.fill}
        width={annotation.width > 0 ? annotation.width : undefined}
        align="left"
        verticalAlign="top"
        {...commonProps}
        onDblClick={() => {
          // Quick in-place edit via a prompt() — a full inline contentEditable
          // would be richer but prompt keeps the editor MVP focused. The
          // Transformer still handles resize.
          const next = window.prompt('Text', annotation.text);
          if (next !== null) onChange({ text: next } as Partial<Annotation>);
        }}
        onTransformEnd={(e) => {
          const node = e.target as Konva.Text;
          const scaleX = node.scaleX();
          // Reset scale and bake into width + fontSize so subsequent
          // transforms don't compound.
          const nextWidth = Math.max(20, node.width() * scaleX);
          const nextFontSize = Math.max(8, annotation.fontSize * scaleX);
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            width: nextWidth,
            fontSize: nextFontSize,
            x: node.x(),
            y: node.y(),
          } as Partial<Annotation>);
        }}
      />
    );
  }

  if (annotation.kind === 'rect') {
    return (
      <Rect
        ref={(n) => registerNode(n)}
        x={annotation.x}
        y={annotation.y}
        width={annotation.width}
        height={annotation.height}
        stroke={annotation.stroke}
        strokeWidth={annotation.strokeWidth}
        cornerRadius={annotation.cornerRadius}
        // Visually outline-only, but a fully transparent fill keeps
        // the body of the rect hit-testable so users can grab and
        // drag from anywhere inside — not just the 4px stroke.
        fillEnabled
        fill="rgba(0,0,0,0)"
        {...commonProps}
        onTransformEnd={(e) => {
          const node = e.target as Konva.Rect;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(4, node.width() * scaleX),
            height: Math.max(4, node.height() * scaleY),
          } as Partial<Annotation>);
        }}
      />
    );
  }

  if (annotation.kind === 'blur') {
    if (!sourceImage || !imgRect) return null;
    return (
      <BlurNode
        annotation={annotation}
        sourceImage={sourceImage}
        imgRect={imgRect}
        selectable={selectable}
        registerNode={registerNode}
        onSelect={onSelect}
        onChange={onChange}
      />
    );
  }

  // arrow
  return (
    <Arrow
      ref={(n) => registerNode(n)}
      points={annotation.points}
      stroke={annotation.stroke}
      strokeWidth={annotation.strokeWidth}
      fill={annotation.stroke}
      pointerLength={Math.max(8, annotation.strokeWidth * 2.5)}
      pointerWidth={Math.max(8, annotation.strokeWidth * 2.5)}
      lineCap="round"
      lineJoin="round"
      {...commonProps}
    />
  );
}

// Gaussian-blur annotation. A Konva Group acts as both the draggable
// handle and the clip window — its clipFunc cuts a rect-shaped hole
// through which a blurred copy of the source image shows. The inner
// image is offset by `-annotation.x/y` so the blurred pixels stay
// pinned to the underlying source: dragging the group reveals the
// blur at the NEW location while keeping the source content aligned.
function BlurNode({
  annotation,
  sourceImage,
  imgRect,
  selectable,
  registerNode,
  onSelect,
  onChange,
}: {
  annotation: BlurAnno;
  sourceImage: HTMLImageElement;
  imgRect: { x: number; y: number; w: number; h: number };
  selectable: boolean;
  registerNode: (node: Konva.Node | null) => void;
  onSelect: () => void;
  onChange: (patch: Partial<Annotation>) => void;
}) {
  const imageRef = useRef<Konva.Image | null>(null);

  // Imperatively (re-)apply the Blur filter whenever geometry or
  // radius changes. We can't rely on the react-konva `filters` prop
  // alone — filters take effect only on a cached node, and the cache
  // must be re-taken after every position / size / radius shift.
  useEffect(() => {
    const node = imageRef.current;
    if (!node) return;
    node.filters([Konva.Filters.Blur]);
    node.blurRadius(annotation.blurRadius);
    // cache() reads the underlying HTMLImageElement; it's already
    // loaded at this point so the snapshot is valid synchronously.
    node.cache();
    node.getLayer()?.batchDraw();
  }, [
    annotation.x,
    annotation.y,
    annotation.width,
    annotation.height,
    annotation.blurRadius,
    sourceImage,
    imgRect.x,
    imgRect.y,
    imgRect.w,
    imgRect.h,
  ]);

  return (
    <Group
      ref={(n) => registerNode(n)}
      x={annotation.x}
      y={annotation.y}
      width={annotation.width}
      height={annotation.height}
      clipFunc={(ctx) => {
        ctx.rect(0, 0, annotation.width, annotation.height);
      }}
      draggable={selectable}
      onClick={selectable ? onSelect : undefined}
      onTap={selectable ? onSelect : undefined}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        } as Partial<Annotation>);
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(4, annotation.width * scaleX),
          height: Math.max(4, annotation.height * scaleY),
        } as Partial<Annotation>);
      }}
    >
      <KonvaImage
        ref={(n) => {
          imageRef.current = n;
        }}
        image={sourceImage}
        x={imgRect.x - annotation.x}
        y={imgRect.y - annotation.y}
        width={imgRect.w}
        height={imgRect.h}
        listening={false}
      />
    </Group>
  );
}

function ElementInspector({
  annotation,
  onChange,
  onDuplicate,
  onDelete,
}: {
  annotation: Annotation;
  onChange: (patch: Partial<Annotation>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const hasColor = annotation.kind !== 'blur';
  const hasStroke = annotation.kind === 'rect' || annotation.kind === 'arrow';
  const isBlur = annotation.kind === 'blur';
  return (
    <div className="flex items-center justify-center px-3 py-2">
      <div className="inline-flex items-center gap-2 rounded-xl bg-canvas-2 p-1.5 shadow-sm ring-1 ring-line">
        {hasColor && (
          <div className="flex items-center gap-2 px-1">
            {STROKE_PALETTE.map((c) => {
              const current =
                annotation.kind === 'text'
                  ? annotation.fill
                  : annotation.kind === 'rect' || annotation.kind === 'arrow'
                  ? annotation.stroke
                  : '';
              const selected = current === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    onChange(
                      annotation.kind === 'text'
                        ? ({ fill: c } as Partial<Annotation>)
                        : ({ stroke: c } as Partial<Annotation>)
                    )
                  }
                  className={
                    'h-5 w-5 rounded-full border transition-transform ' +
                    (selected
                      ? 'border-2 border-fg scale-110'
                      : 'border-line hover:scale-110')
                  }
                  style={{ backgroundColor: c }}
                  title={`Color ${c}`}
                />
              );
            })}
          </div>
        )}

        {isBlur && (
          <select
            value={annotation.blurRadius}
            onChange={(e) =>
              onChange({
                blurRadius: Number(e.target.value),
              } as Partial<Annotation>)
            }
            className="h-7 rounded-md border border-line bg-canvas px-2 text-xs text-fg focus:border-line-strong focus:outline-none"
          >
            {[4, 8, 12, 20, 32].map((w) => (
              <option key={w} value={w}>
                {w}px
              </option>
            ))}
          </select>
        )}

        {hasStroke && (
          <select
            value={annotation.strokeWidth}
            onChange={(e) =>
              onChange({
                strokeWidth: Number(e.target.value),
              } as Partial<Annotation>)
            }
            className="h-7 rounded-md border border-line bg-canvas px-2 text-xs text-fg focus:border-line-strong focus:outline-none"
          >
            {[2, 4, 6, 8, 12].map((w) => (
              <option key={w} value={w}>
                {w}px
              </option>
            ))}
          </select>
        )}

        <div className="mx-1 h-5 w-px bg-line" />
        <button
          type="button"
          onClick={onDuplicate}
          className="rounded-md p-1.5 text-fg-muted hover:bg-overlay hover:text-fg-strong"
          title="Duplicate"
        >
          <MoveUpRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md p-1.5 text-fg-muted hover:bg-danger-soft hover:text-danger"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
