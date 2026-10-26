"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Arrow, Ellipse, Layer, Line, Rect, Stage, Text } from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import {
  Circle,
  Eraser,
  Hand,
  Highlighter,
  Minus,
  MousePointer2,
  MoveUpRight,
  Pencil,
  Plus,
  Redo2,
  Square,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import { Button } from "@heroui/react";
import { AppIcon } from "@/components/brand-mark";
import { AnimatedTooltip } from "@/lib/animated-tooltip";
import {
  CANVAS_COLORS,
  STROKE_WIDTHS,
  TEXT_SIZE,
  isDegenerate,
  newId,
  normalizeRect,
  type CanvasElement,
  type Stroke,
} from "@/lib/canvas/elements";
import {
  ZOOM_STEP,
  panBy,
  toWorld,
  wheelScale,
  zoomAround,
  type Point,
  type Viewport,
} from "@/lib/canvas/viewport";
import { MARKETING_SITE_URL, PRODUCT_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

type Tool =
  | "select"
  | "hand"
  | "pen"
  | "highlighter"
  | "rect"
  | "ellipse"
  | "arrow"
  | "line"
  | "text"
  | "eraser";

const TOOLS: { id: Tool; label: string; key: string; icon: ReactNode }[] = [
  {
    id: "select",
    label: "Select",
    key: "V",
    icon: <MousePointer2 size={18} />,
  },
  { id: "hand", label: "Hand", key: "H", icon: <Hand size={18} /> },
  { id: "pen", label: "Pen", key: "P", icon: <Pencil size={18} /> },
  {
    id: "highlighter",
    label: "Highlighter",
    key: "M",
    icon: <Highlighter size={18} />,
  },
  { id: "rect", label: "Rectangle", key: "R", icon: <Square size={18} /> },
  { id: "ellipse", label: "Ellipse", key: "O", icon: <Circle size={18} /> },
  { id: "arrow", label: "Arrow", key: "A", icon: <MoveUpRight size={18} /> },
  { id: "line", label: "Line", key: "L", icon: <Minus size={18} /> },
  { id: "text", label: "Text", key: "T", icon: <Type size={18} /> },
  { id: "eraser", label: "Eraser", key: "E", icon: <Eraser size={18} /> },
];

const KEY_TO_TOOL = new Map(TOOLS.map((t) => [t.key.toLowerCase(), t.id]));

const STORAGE_KEY = "captureflow-canvas";
const HISTORY_LIMIT = 100;
const GRID_SPACING = 24;
const HIGHLIGHTER_SCALE = 4;
const FONT_FAMILY = "Inter, system-ui, sans-serif";

type Draft =
  | {
      kind: "stroke";
      element: Extract<CanvasElement, { kind: "pen" | "highlighter" }>;
    }
  | {
      kind: "box";
      from: Point;
      element: Extract<CanvasElement, { kind: "rect" | "ellipse" }>;
    }
  | {
      kind: "segment";
      element: Extract<CanvasElement, { kind: "arrow" | "line" }>;
    };

type Saved = { elements: CanvasElement[]; view: Viewport };

function loadSaved(): Saved | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Saved>;
    if (!Array.isArray(parsed.elements)) return null;
    const view = parsed.view;
    return {
      elements: parsed.elements,
      view:
        view &&
        typeof view.x === "number" &&
        typeof view.y === "number" &&
        typeof view.scale === "number"
          ? view
          : { x: 0, y: 0, scale: 1 },
    };
  } catch {
    return null;
  }
}

function save(data: Saved): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* private mode or full */
  }
}

export function CanvasBoardImpl() {
  const saved = useMemo(loadSaved, []);
  const [elements, setElements] = useState<CanvasElement[]>(
    () => saved?.elements ?? [],
  );
  const [view, setView] = useState<Viewport>(
    () => saved?.view ?? { x: 0, y: 0, scale: 1 },
  );
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState<string>(CANVAS_COLORS[0]);
  const [width, setWidth] = useState<number>(STROKE_WIDTHS[1]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [spaceDown, setSpaceDown] = useState(false);
  const pastRef = useRef<CanvasElement[][]>([]);
  const futureRef = useRef<CanvasElement[][]>([]);
  const [historyTick, setHistoryTick] = useState(0);
  const panRef = useRef<{ last: Point } | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const newTextIdRef = useRef<string | null>(null);

  const stroke: Stroke = useMemo(() => ({ color, width }), [color, width]);
  const panning = tool === "hand" || spaceDown;

  useEffect(() => {
    const measure = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => save({ elements, view }), 300);
    return () => window.clearTimeout(id);
  }, [elements, view]);

  // Every change that should be undoable goes through here.
  const commit = useCallback(
    (next: CanvasElement[] | ((prev: CanvasElement[]) => CanvasElement[])) => {
      setElements((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        if (resolved === prev) return prev;
        pastRef.current = [...pastRef.current.slice(-HISTORY_LIMIT), prev];
        futureRef.current = [];
        return resolved;
      });
      setHistoryTick((n) => n + 1);
    },
    [],
  );

  const undo = useCallback(() => {
    const prev = pastRef.current.pop();
    if (!prev) return;
    setElements((current) => {
      futureRef.current.push(current);
      return prev;
    });
    setSelectedId(null);
    setHistoryTick((n) => n + 1);
  }, []);

  const redo = useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) return;
    setElements((current) => {
      pastRef.current.push(current);
      return next;
    });
    setSelectedId(null);
    setHistoryTick((n) => n + 1);
  }, []);

  const remove = useCallback(
    (id: string) => {
      commit((prev) => prev.filter((el) => el.id !== id));
      setSelectedId((s) => (s === id ? null : s));
    },
    [commit],
  );

  // The click that places a text box also moves focus, so the textarea is
  // focused a frame later rather than on mount.
  useEffect(() => {
    if (!editingId) return;
    const id = requestAnimationFrame(() => textareaRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [editingId]);

  const finishText = useCallback(() => {
    if (!editingId) return;
    const text = textareaRef.current?.value ?? "";
    const isNew = newTextIdRef.current === editingId;
    newTextIdRef.current = null;
    setElements((prev) => {
      const without = prev.filter((el) => el.id !== editingId);
      const target = prev.find(
        (el): el is Extract<CanvasElement, { kind: "text" }> =>
          el.id === editingId && el.kind === "text",
      );
      const kept =
        target && text.trim() !== ""
          ? [...without, { ...target, text }]
          : without;
      // A new box starts outside history; an existing one keeps its old text there.
      const before = isNew ? without : prev;
      if (isNew && kept === without) return without;
      pastRef.current = [...pastRef.current.slice(-HISTORY_LIMIT), before];
      futureRef.current = [];
      return kept;
    });
    setHistoryTick((n) => n + 1);
    setEditingId(null);
  }, [editingId]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "TEXTAREA" || target.tagName === "INPUT")
      ) {
        if (e.key === "Escape") {
          e.preventDefault();
          finishText();
        }
        return;
      }
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod) return;
      if (e.key === " ") {
        e.preventDefault();
        setSpaceDown(true);
        return;
      }
      if ((e.key === "Backspace" || e.key === "Delete") && selectedId) {
        e.preventDefault();
        remove(selectedId);
        return;
      }
      if (e.key === "Escape") {
        setSelectedId(null);
        setTool("select");
        return;
      }
      const next = KEY_TO_TOOL.get(e.key.toLowerCase());
      if (next) setTool(next);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") setSpaceDown(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [finishText, redo, remove, selectedId, undo]);

  const pointerScreen = (): Point | null =>
    stageRef.current?.getPointerPosition() ?? null;

  const onPointerDown = (e: KonvaEventObject<PointerEvent>) => {
    if (editingId) finishText();
    const screen = pointerScreen();
    if (!screen) return;
    const middle = e.evt.button === 1;
    if (panning || middle) {
      panRef.current = { last: screen };
      return;
    }
    if (e.evt.button !== 0) return;
    const onEmpty = e.target === e.target.getStage();
    const world = toWorld(view, screen);
    switch (tool) {
      case "select":
        if (onEmpty) setSelectedId(null);
        return;
      case "eraser":
        return;
      case "pen":
      case "highlighter":
        setDraft({
          kind: "stroke",
          element: {
            id: newId(),
            kind: tool,
            points: [world.x, world.y],
            x: 0,
            y: 0,
            stroke,
          },
        });
        return;
      case "rect":
      case "ellipse":
        setDraft({
          kind: "box",
          from: world,
          element: {
            id: newId(),
            kind: tool,
            ...normalizeRect(world, world),
            stroke,
          },
        });
        return;
      case "arrow":
      case "line":
        setDraft({
          kind: "segment",
          element: {
            id: newId(),
            kind: tool,
            points: [world.x, world.y, world.x, world.y],
            x: 0,
            y: 0,
            stroke,
          },
        });
        return;
      case "text": {
        if (!onEmpty) return;
        const element: CanvasElement = {
          id: newId(),
          kind: "text",
          x: world.x,
          y: world.y - TEXT_SIZE / 2,
          text: "",
          color,
          size: TEXT_SIZE,
        };
        setElements((prev) => [...prev, element]);
        newTextIdRef.current = element.id;
        setEditingId(element.id);
        setTool("select");
        return;
      }
    }
  };

  const onPointerMove = () => {
    const screen = pointerScreen();
    if (!screen) return;
    if (panRef.current) {
      const { last } = panRef.current;
      setView((v) => panBy(v, screen.x - last.x, screen.y - last.y));
      panRef.current = { last: screen };
      return;
    }
    if (!draft) return;
    const world = toWorld(view, screen);
    setDraft((d) => {
      if (!d) return d;
      switch (d.kind) {
        case "stroke":
          return {
            ...d,
            element: {
              ...d.element,
              points: [...d.element.points, world.x, world.y],
            },
          };
        case "box":
          return {
            ...d,
            element: { ...d.element, ...normalizeRect(d.from, world) },
          };
        case "segment": {
          const [x1, y1] = d.element.points;
          return {
            ...d,
            element: { ...d.element, points: [x1, y1, world.x, world.y] },
          };
        }
      }
    });
  };

  const onPointerUp = () => {
    panRef.current = null;
    if (!draft) return;
    const element = draft.element;
    setDraft(null);
    if (isDegenerate(element)) return;
    commit((prev) => [...prev, element]);
  };

  const onWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const screen = pointerScreen();
    if (!screen) return;
    if (e.evt.ctrlKey || e.evt.metaKey) {
      setView((v) =>
        zoomAround(
          v,
          screen,
          v.scale * wheelScale(e.evt.deltaY, e.evt.deltaMode),
        ),
      );
    } else {
      setView((v) => panBy(v, -e.evt.deltaX, -e.evt.deltaY));
    }
  };

  const zoomBy = (factor: number) =>
    setView((v) =>
      zoomAround(
        v,
        { x: size.width / 2, y: size.height / 2 },
        v.scale * factor,
      ),
    );

  const eraseOn = (id: string) => (e: KonvaEventObject<PointerEvent>) => {
    if (tool !== "eraser") return;
    if (e.type === "pointermove" && e.evt.buttons === 0) return;
    remove(id);
  };

  const moved = (id: string) => (e: KonvaEventObject<DragEvent>) => {
    const { x, y } = e.target.position();
    commit((prev) => prev.map((el) => (el.id === id ? { ...el, x, y } : el)));
  };

  const shapeProps = (el: CanvasElement) => ({
    id: el.id,
    draggable: tool === "select",
    onDragEnd: moved(el.id),
    onPointerDown: (e: KonvaEventObject<PointerEvent>) => {
      if (tool === "select") {
        e.cancelBubble = true;
        setSelectedId(el.id);
      } else if (tool === "eraser") {
        remove(el.id);
      }
    },
    onPointerMove: eraseOn(el.id),
    shadowColor: "#1971c2",
    shadowBlur: selectedId === el.id ? 12 : 0,
    shadowOpacity: selectedId === el.id ? 0.6 : 0,
  });

  const renderElement = (el: CanvasElement) => {
    switch (el.kind) {
      case "pen":
        return (
          <Line
            key={el.id}
            {...shapeProps(el)}
            x={el.x}
            y={el.y}
            points={el.points}
            stroke={el.stroke.color}
            strokeWidth={el.stroke.width}
            hitStrokeWidth={Math.max(el.stroke.width, 14)}
            tension={0.4}
            lineCap="round"
            lineJoin="round"
          />
        );
      case "highlighter":
        return (
          <Line
            key={el.id}
            {...shapeProps(el)}
            x={el.x}
            y={el.y}
            points={el.points}
            stroke={el.stroke.color}
            strokeWidth={el.stroke.width * HIGHLIGHTER_SCALE}
            hitStrokeWidth={el.stroke.width * HIGHLIGHTER_SCALE}
            opacity={0.35}
            tension={0.3}
            lineCap="round"
            lineJoin="round"
          />
        );
      case "rect":
        return (
          <Rect
            key={el.id}
            {...shapeProps(el)}
            x={el.x}
            y={el.y}
            width={el.width}
            height={el.height}
            stroke={el.stroke.color}
            strokeWidth={el.stroke.width}
            hitStrokeWidth={14}
            cornerRadius={4}
          />
        );
      case "ellipse":
        return (
          <Ellipse
            key={el.id}
            {...shapeProps(el)}
            x={el.x + el.width / 2}
            y={el.y + el.height / 2}
            radiusX={el.width / 2}
            radiusY={el.height / 2}
            stroke={el.stroke.color}
            strokeWidth={el.stroke.width}
            hitStrokeWidth={14}
            onDragEnd={(e) => {
              const { x, y } = e.target.position();
              commit((prev) =>
                prev.map((item) =>
                  item.id === el.id
                    ? { ...item, x: x - el.width / 2, y: y - el.height / 2 }
                    : item,
                ),
              );
            }}
          />
        );
      case "arrow":
        return (
          <Arrow
            key={el.id}
            {...shapeProps(el)}
            x={el.x}
            y={el.y}
            points={el.points}
            stroke={el.stroke.color}
            fill={el.stroke.color}
            strokeWidth={el.stroke.width}
            hitStrokeWidth={14}
            pointerLength={6 + el.stroke.width * 2}
            pointerWidth={6 + el.stroke.width * 2}
            lineCap="round"
          />
        );
      case "line":
        return (
          <Line
            key={el.id}
            {...shapeProps(el)}
            x={el.x}
            y={el.y}
            points={el.points}
            stroke={el.stroke.color}
            strokeWidth={el.stroke.width}
            hitStrokeWidth={14}
            lineCap="round"
          />
        );
      case "text":
        return (
          <Text
            key={el.id}
            {...shapeProps(el)}
            x={el.x}
            y={el.y}
            text={el.text}
            fontSize={el.size}
            fontFamily={FONT_FAMILY}
            fill={el.color}
            visible={editingId !== el.id}
            onDblClick={() => setEditingId(el.id)}
            onDblTap={() => setEditingId(el.id)}
          />
        );
    }
  };

  const editing = editingId
    ? elements.find(
        (el): el is Extract<CanvasElement, { kind: "text" }> =>
          el.id === editingId && el.kind === "text",
      )
    : undefined;

  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;
  void historyTick;

  const cursor = panning
    ? panRef.current
      ? "grabbing"
      : "grab"
    : tool === "select"
      ? "default"
      : tool === "text"
        ? "text"
        : "crosshair";

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-canvas text-fg"
      style={{
        cursor,
        backgroundImage:
          "radial-gradient(circle, rgb(128 128 128 / 0.35) 1px, transparent 1.2px)",
        backgroundSize: `${GRID_SPACING * view.scale}px ${GRID_SPACING * view.scale}px`,
        backgroundPosition: `${view.x}px ${view.y}px`,
      }}
    >
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        x={view.x}
        y={view.y}
        scaleX={view.scale}
        scaleY={view.scale}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
        onContextMenu={(e) => e.evt.preventDefault()}
      >
        <Layer listening={!panning}>
          {elements.map(renderElement)}
          {draft && renderElement(draft.element)}
        </Layer>
      </Stage>

      {editing && (
        <textarea
          ref={textareaRef}
          key={editing.id}
          defaultValue={editing.text}
          onBlur={finishText}
          placeholder="Type…"
          className="absolute m-0 resize-none overflow-hidden border-0 bg-transparent p-0 leading-none outline-none"
          style={{
            left: editing.x * view.scale + view.x,
            top: editing.y * view.scale + view.y,
            fontSize: editing.size * view.scale,
            fontFamily: FONT_FAMILY,
            color: editing.color,
            minWidth: 200 * view.scale,
            lineHeight: 1,
          }}
          onInput={(e) => {
            const t = e.currentTarget;
            t.style.height = "auto";
            t.style.height = `${t.scrollHeight}px`;
          }}
        />
      )}

      <a
        href={MARKETING_SITE_URL}
        rel="noopener noreferrer"
        className="absolute left-4 top-4 flex items-center gap-2 rounded-xl bg-canvas-2 px-3 py-2 shadow-sm ring-1 ring-line"
      >
        <AppIcon size={24} />
        <span className="text-base font-semibold tracking-tight text-fg-strong">
          {PRODUCT_NAME}
        </span>
      </a>

      <div className="absolute left-1/2 top-4 flex -translate-x-1/2 flex-col items-center gap-2">
        <div className="flex items-center gap-1 rounded-2xl bg-canvas-2 p-1 shadow-lg ring-1 ring-line">
          {TOOLS.map((t) => (
            <AnimatedTooltip
              key={t.id}
              content={`${t.label} · ${t.key}`}
              placement="bottom"
            >
              <Button
                isIconOnly
                size="sm"
                variant={tool === t.id ? "secondary" : "ghost"}
                aria-label={t.label}
                aria-pressed={tool === t.id}
                onPress={() => setTool(t.id)}
              >
                {t.icon}
              </Button>
            </AnimatedTooltip>
          ))}
          <div className="mx-1 h-6 w-px bg-tint-strong" />
          {CANVAS_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Colour ${c}`}
              aria-pressed={color === c}
              onClick={() => setColor(c)}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-tint",
                color === c && "bg-tint",
              )}
            >
              <span
                className={cn(
                  "block size-4 rounded-full ring-offset-2 ring-offset-canvas-2",
                  color === c && "ring-2 ring-fg-muted",
                )}
                style={{ backgroundColor: c }}
              />
            </button>
          ))}
          <div className="mx-1 h-6 w-px bg-tint-strong" />
          {STROKE_WIDTHS.map((w) => (
            <button
              key={w}
              type="button"
              aria-label={`Stroke ${w}`}
              aria-pressed={width === w}
              onClick={() => setWidth(w)}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg text-fg transition-colors hover:bg-tint",
                width === w && "bg-tint",
              )}
            >
              <span
                className="block rounded-full bg-current"
                style={{ width: 4 + w * 1.5, height: 4 + w * 1.5 }}
              />
            </button>
          ))}
        </div>
        <p className="text-xs text-fg-subtle">
          Scroll to pan · ⌘ scroll to zoom · hold Space to drag
        </p>
      </div>

      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-2xl bg-canvas-2 p-1 shadow-lg ring-1 ring-line">
        <AnimatedTooltip content="Undo · ⌘Z" placement="bottom">
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label="Undo"
            isDisabled={!canUndo}
            onPress={undo}
          >
            <Undo2 size={18} />
          </Button>
        </AnimatedTooltip>
        <AnimatedTooltip content="Redo · ⇧⌘Z" placement="bottom">
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label="Redo"
            isDisabled={!canRedo}
            onPress={redo}
          >
            <Redo2 size={18} />
          </Button>
        </AnimatedTooltip>
        <AnimatedTooltip content="Clear the board" placement="bottom">
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label="Clear the board"
            isDisabled={elements.length === 0}
            onPress={() => {
              commit([]);
              setSelectedId(null);
            }}
          >
            <Trash2 size={18} />
          </Button>
        </AnimatedTooltip>
      </div>

      <div className="absolute bottom-4 left-4 flex items-center gap-1 rounded-2xl bg-canvas-2 p-1 shadow-lg ring-1 ring-line">
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label="Zoom out"
          onPress={() => zoomBy(1 / ZOOM_STEP)}
        >
          <Minus size={18} />
        </Button>
        <button
          type="button"
          className="min-w-14 rounded-lg px-2 py-1 text-sm tabular-nums text-fg hover:bg-tint"
          aria-label="Reset zoom"
          onClick={() => setView({ x: 0, y: 0, scale: 1 })}
        >
          {Math.round(view.scale * 100)}%
        </button>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label="Zoom in"
          onPress={() => zoomBy(ZOOM_STEP)}
        >
          <Plus size={18} />
        </Button>
      </div>
    </div>
  );
}
