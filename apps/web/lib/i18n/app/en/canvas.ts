export const CANVAS = {
  meta: {
    title: "Canvas",
    description: "A blank board to draw on while you record.",
  },
  loading: "Loading canvas…",
  tools: {
    select: "Select",
    hand: "Hand",
    pen: "Pen",
    highlighter: "Highlighter",
    rect: "Rectangle",
    ellipse: "Ellipse",
    arrow: "Arrow",
    line: "Line",
    text: "Text",
    eraser: "Eraser",
  },
  shortcut: "{label} · {key}",
  colour: "Colour {colour}",
  stroke: "Stroke {width}",
  hint: "Scroll to pan · {mod} scroll to zoom · hold {space} to drag",
  textPlaceholder: "Type…",
  history: {
    undo: "Undo",
    redo: "Redo",
    clear: "Clear the board",
  },
  zoom: {
    out: "Zoom out",
    reset: "Reset zoom",
    in: "Zoom in",
  },
  extensionPrompt: {
    title: "Record this canvas",
    description:
      "Add the CaptureFlow extension to record your screen and camera while you draw, then share a link.",
    dismiss: "Not now",
    install: "Add to Chrome",
  },
} as const;
