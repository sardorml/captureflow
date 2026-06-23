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
// undefined unless this is side-effect-imported. Without it the blur
// tool silently no-ops (the cached node gets filters=[undefined]).
import 'konva/lib/filters/Blur';
import { GridLoader, SmoothButton } from '@captureflow/ui';
import { AnimatedTooltip } from '@/lib/animated-tooltip';
import type { SnapEditorProps } from './SnapEditor';
import { renameSnapAction, saveSnapAction } from '../../../actions';

// Image editor. Tools: select, text, rect, arrow, blur. Background
// presets (transparent + gradients). Undo/redo via snapshot stack.
// Save → canvas.toBlob → server action that writes the PNG to R2 and
// bumps edited_at + size_bytes.

type Tool = 'select' | 'text' | 'rect' | 'arrow' | 'blur';

// Stored on disk as a plain string so the state JSON stays tiny +
// diffable. Three recognised shapes:
//   - 'transparent'    → no fill, the editor body shows through
//   - <preset key>     → one of the named gradient presets below
//   - '#rrggbb'/'#rgb' → a solid fill from the color picker / swatch
// Anything else normalises back to 'transparent' on hydrate so a
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

// Konva's fillLinearGradientColorStops takes an interleaved
// (offset, color, offset, color, …) tuple — numbers and strings mixed.
type GradientStops = (number | string)[];

// Hand-picked so the framed image reads as bordered, not lost in a
// busy backdrop.
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

// Quick-pick solid colors; custom shades live behind the color-picker
// input at the end of the picker footer row.
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

// Frame ratio between the screenshot and the stage edge. Applied
// regardless of background so toggling a background doesn't resize the
// stage: transparent mode shows the editor body through the inset,
// coloured mode lets BackgroundLayer paint the frame.
const BG_PADDING_RATIO = 0.12;

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

// Narrow the sidecar's stored `background` into one of the three shapes
// the renderer accepts. Anything unrecognised falls back to
// 'transparent' so a future preset (or corrupted file) can't crash the
// editor on hydrate.
//
// `raw === null` means the user has never saved this snap (no
// `.state.json` sidecar yet); open those with a gradient preset already
// applied so the editor doesn't look bare. After the first save this
// persists, and reopens follow whatever they last chose.
function hydrateBackground(raw: string | null): Background {
  if (raw === null) return 'violet';
  if (typeof raw !== 'string') return 'transparent';
  if (raw === 'transparent') return 'transparent';
  if (isGradientKey(raw)) return raw;
  if (isHexColor(raw)) return raw;
  // Legacy: 'slate' was a gradient in an earlier build — drop it to
  // transparent so old snaps re-open cleanly under the new picker.
  return 'transparent';
}

// Annotations arrive as `unknown[]` because the action is shared with
// the server (which can't pull in the Konva types). Gate on a
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

  // Editable title, backed by `renameSnapAction`. We mirror the saved
  // value in local state so the header label updates without waiting
  // on a router refresh.
  const [title, setTitle] = useState<string>(initialTitle ?? '');
  const [titleDraft, setTitleDraft] = useState<string>(initialTitle ?? '');
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleSaving, setTitleSaving] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inspectorRef = useRef<HTMLDivElement>(null);

  // Annotation Konva node by id, so the Transformer can resolve
  // `.nodes([node])` from `selectedId`.
  const nodeRefs = useRef<Map<string, Konva.Node>>(new Map());

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);

  // The source image's natural dimensions drive every layout calc
  // below. We can't use `imgW`/`imgH` from props: after the first save
  // the D1 row holds the *composed* stage size (image + bg padding), so
  // reusing it would stretch the image on reopen. Reading
  // `naturalWidth/Height` off the loaded PNG always gives true pixels.
  const [naturalSize, setNaturalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);

  // Editor state + undo/redo stack: `past` / `future` hold snapshots.
  // Drags + transforms call `commit` on end so each completed gesture
  // is one undo step.
  const [state, setState] = useState<EditorState>(() => ({
    background: hydrateBackground(initialBackground),
    annotations: hydrateAnnotations(initialAnnotations),
  }));
  const [past, setPast] = useState<EditorState[]>([]);
  const [future, setFuture] = useState<EditorState[]>([]);

  const [tool, setTool] = useState<Tool>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Drag-out state for rect / arrow / blur placement. Discriminated
  // union so `drawing.current` narrows to the right annotation shape.
  type DrawingState =
    | { kind: 'rect'; start: { x: number; y: number }; current: RectAnno }
    | { kind: 'arrow'; start: { x: number; y: number }; current: ArrowAnno }
    | { kind: 'blur'; start: { x: number; y: number }; current: BlurAnno };
  const [drawing, setDrawing] = useState<DrawingState | null>(null);

  // After a successful save we copy the public link and flash a
  // confirmation; `savedJustNow` drives that flash.
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedJustNow, setSavedJustNow] = useState(false);

  // We measure the canvas-surface box and pass it to Konva as explicit
  // pixel dimensions. Pure-CSS sizing doesn't work: Konva sizes each
  // Layer's child <canvas> from the Stage `width`/`height` props (the
  // Stage `style` only affects the wrapper div), so without an explicit
  // size we'd overflow at native res or paint at 0×0. A single ref
  // callback owns both the ref and a ResizeObserver.
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
      // React 19 calls a ref callback's returned function on unmount.
      return () => ro.disconnect();
    },
    []
  );

  // Go through `fetch` + `URL.createObjectURL` rather than pointing the
  // <img> at the R2 URL directly. Some browsers (Brave especially) cache
  // the pre-CORS response of a CDN asset and refuse to swap it even
  // after the bucket gains CORS headers, because `<img crossOrigin>`
  // only matches a cache entry originally fetched with CORS. `fetch({
  // cache: 'reload' })` forces a revalidation with the right Origin; the
  // resulting object URL is same-origin so it never round-trips the disk
  // cache.
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

  // Clicks outside the Stage container and the floating
  // ElementInspector clear the selection. Clicks inside the Stage route
  // through `handleStageMouseDown`, which handles deselect itself, so we
  // skip those here.
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

  // Goes through `commit` so the wipe is itself one undo step — the user
  // can recover from an accidental reset.
  const reset = (): void => {
    setSelectedId(null);
    commit({ background: 'transparent', annotations: [] });
  };

  // Title rename, submitted on Enter / blur / explicit Save.
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

  // True once there's something to reset — keeps the Reset button
  // disabled on a pristine snap.
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

  // Escape cancels selection/drawing; Delete removes selection; ⌘Z /
  // ⌘⇧Z drive undo + redo. The deps include `past`/`future`/`state`:
  // without them the listener would close over the first render's empty
  // history and undo would never pop anything. Declared after
  // `undo`/`redo`/`removeSelected` so it closes over real references.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      // Don't hijack keystrokes while the user is typing into an input.
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
      // Match on `e.code` so the binding survives layouts where `e.key`
      // reports a localized character. metaKey = macOS, ctrlKey = Win/Linux.
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

  const handleStageMouseDown = (
    e: Konva.KonvaEventObject<MouseEvent>
  ): void => {
    const clickedOnEmpty = e.target === e.target.getStage();

    if (tool === 'select') {
      // Transformer anchor — let Konva handle the resize gesture.
      if (e.target.hasName('_anchor')) return;
      // Walk up to find the annotation node the click landed on and
      // select it; a click on the background (Stage, the KonvaImage,
      // decorative rects) falls through to deselect.
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

    // Keep draw tools from stomping on selection:
    //  (a) Transformer anchors also fire stage-level mousedown when
    //      grabbed — without this bail a resize also spawns a new shape.
    //  (b) clicking the body of an existing annotation should select it
    //      (and flip to the select tool) instead of layering a new shape
    //      over the one the user tried to grab.
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

    // Annotations live in stage coords (native resolution) but the
    // canvas is CSS-scaled by `displayScale`, so invert it to keep
    // default shape sizes screen-sized rather than `28 * displayScale`.
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
    // centered on the click point. Discarding sub-4px drags instead
    // made the tool feel broken ("I clicked rect and nothing happened").
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
    // Switch to `select` so the new shape is immediately draggable.
    // Staying on the draw tool would (a) leave it non-draggable to
    // Konva (draggable was false on that mousedown) and (b) spawn yet
    // another shape on the next click.
    setTool('select');
  };

  const handleSave = async (): Promise<void> => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const stage = stageRef.current;
      if (!stage) throw new Error('Editor not mounted');

      // De-select so the transformer handles aren't baked into the PNG.
      const previouslySelected = selectedId;
      setSelectedId(null);
      // Let React + Konva commit the deselect before exporting.
      await new Promise((r) => requestAnimationFrame(r));

      // Export the full padded stage so the background and every
      // annotation get baked into the public PNG.
      //
      // The Stage renders at `stageW × displayScale` on-screen to fit
      // the viewport. With `pixelRatio: 1` the export would come out at
      // that downscaled size (~30% of native on big displays) and be
      // blurry. Counter the on-screen scale with `1 / displayScale` so
      // the export is always at the snap's native pixel resolution.
      const exportCanvas = stage.toCanvas({
        pixelRatio: 1 / displayScale,
      });
      const exportW = exportCanvas.width;
      const exportH = exportCanvas.height;

      // Pull RGBA bytes and ship them to a Web Worker for palette
      // re-encoding (UPNG, cnum: 256). PNG-8 is visually identical on
      // screenshots but 5-10x smaller (~500 KB vs ~3 MB for a retina
      // capture with bg). The encode is 2-5 s of pure-JS deflate, so
      // running it off-thread keeps the save button responsive.
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
        // Transfer (not copy) the multi-MB RGBA buffer into the worker.
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
      try {
        await navigator.clipboard.writeText(viewUrl);
      } catch {
        // Clipboard may be unavailable (insecure context); the link is
        // still visible in the header.
      }
      setSavedJustNow(true);
      setTimeout(() => setSavedJustNow(false), 2000);
      // Restore selection so editing right after a save keeps it.
      if (previouslySelected) setSelectedId(previouslySelected);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  // Transparent → stage is exactly the screenshot. With a background,
  // the stage grows to add a symmetric frame around the image.
  const stageDims = useMemo(() => {
    // `naturalSize` is set once the source PNG loads; until then fall
    // back to the D1 row's dims for a placeholder size (the Stage
    // doesn't render until the image is in place, so it's never seen).
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
    // Equal pad on every side, sized off the smaller of w/h so the
    // strip looks symmetric. Growing the stage by `2 * pad` (rather
    // than shrinking the image into a fixed stage) keeps the native
    // aspect — the shrink approach stretched landscape snaps.
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

  // Fit the stage into the measured canvas-surface box. `min(1, …)`
  // never upscales a smaller snap past native res — fractional pixels
  // blur text annotations fast. Left as a plain expression (not a
  // useMemo): a manual memo over `stageDims` tripped
  // react-hooks/preserve-manual-memoization on CI; React Compiler
  // handles the memoization.
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
      {/* Top bar: title (left), annotation toolbar (center), undo/redo
          + save (right). */}
      <header className="relative flex h-20 shrink-0 items-center justify-between border-b border-line px-4">
        {/* On `lg:`+ the centered toolbar shares the header, so cap the
            title cluster at `calc(50% - 220px)` and ellipsise it before
            it can slide under the toolbar. Below `lg:` the toolbar is
            hidden, so drop the cap and let the title use the freed space. */}
        <div className="flex min-w-0 flex-1 items-center gap-2 lg:max-w-[calc(50%-220px)]">
          <IconButton
            onClick={() => router.push('/snaps')}
            tooltip="Back to snaps"
            ariaLabel="Back to snaps"
          >
            <ArrowLeft className="h-5 w-5" />
          </IconButton>
          {/* Editable title: click the label to edit, Enter or blur
              commits. Long headlines truncate to keep the header one row. */}
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

        {/* Absolutely centered so the toolbar anchors to the true page
            center regardless of the side clusters — `flex-1
            justify-center` would shift it every time the right cluster
            grows (e.g. "Saved · link copied"). Hidden below `lg:`,
            where there isn't room to draw on the canvas anyway. */}
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

      {/* Canvas surface. The outer div paints the padding gutter and
          clips stray Konva descendants; the inner div (measured by
          `containerRefCb`) is the box the Stage fills. We must measure
          the inner box: `getBoundingClientRect()` includes padding, so
          measuring the outer would scale the Stage over the gutter and
          the visible padding would vanish. The Stage paints at scaled
          pixel size so its nested <canvas> children come out right —
          CSS sizing on the wrapper alone doesn't reach them. */}
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
      {/* No blur button: the click-to-insert UX isn't stable yet, so
          new blurs can't be created. The rendering paths stay so legacy
          saved blurs still resolve. */}
      <div className="mx-1 h-5 w-px bg-overlay-strong" />
      <BackgroundPicker active={background} onChange={onBackground} />
    </div>
  );
}

// Header icon button — wraps the trigger in AnimatedTooltip so edge
// buttons don't clip their label.
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

// Compact swatch reflecting the active background, shown in the
// toolbar trigger.
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

// Popover picker: a 3-col grid of gradient tiles ("None" + presets)
// over a footer row of solid swatches + a native color picker.
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
            {/* "None" sits in-grid as the first cell so it reads as the
                off-state of the picker, not a separate toggle. */}
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
            {/* The `<input type="color">` is hidden behind a conic-
                rainbow circle so it reads as "custom color". */}
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
  // The snap image + its stage placement, needed so blur annotations
  // can re-render a clipped, blurred copy of the source pixels.
  sourceImage?: HTMLImageElement | null;
  imgRect?: { x: number; y: number; w: number; h: number };
}) {
  // Commit on dragEnd so each drag is one undo step, not one per move.
  const onDragEnd = (e: Konva.KonvaEventObject<DragEvent>): void => {
    if (annotation.kind === 'arrow') {
      // Bake the drag offset into the points so we don't accumulate a
      // transform on top of the points array.
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
          // Edit via prompt() for now; a full inline contentEditable
          // would be richer. The Transformer still handles resize.
          const next = window.prompt('Text', annotation.text);
          if (next !== null) onChange({ text: next } as Partial<Annotation>);
        }}
        onTransformEnd={(e) => {
          const node = e.target as Konva.Text;
          const scaleX = node.scaleX();
          // Reset scale and bake it into width + fontSize so subsequent
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
        // Outline-only visually, but a transparent fill keeps the body
        // hit-testable so it's draggable from inside, not just the stroke.
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

// Gaussian-blur annotation. The Group is both the draggable handle and
// the clip window: its clipFunc cuts a rect through which a blurred copy
// of the source image shows. The inner image is offset by
// `-annotation.x/y` so the blurred pixels stay pinned to the source —
// dragging reveals the blur at the new spot with content still aligned.
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

  // Re-apply the Blur filter whenever geometry or radius changes. The
  // react-konva `filters` prop alone isn't enough: filters only apply
  // to a cached node, and the cache must be re-taken after every shift.
  useEffect(() => {
    const node = imageRef.current;
    if (!node) return;
    node.filters([Konva.Filters.Blur]);
    node.blurRadius(annotation.blurRadius);
    // cache() reads the HTMLImageElement, already loaded here, so the
    // snapshot is valid synchronously.
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
