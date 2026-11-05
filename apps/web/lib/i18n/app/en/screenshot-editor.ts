export const SCREENSHOT_EDITOR = {
  loading: "Loading editor…",
  imageError: {
    decode: "Failed to decode screenshot image.",
    fetch:
      "Could not load the screenshot image. The bucket may have lost CORS access.",
  },
  header: {
    back: "Back to screenshot",
    reset: "Reset edits",
    undo: "Undo",
    undoTooltip: "Undo ({key})",
    redo: "Redo",
    redoTooltip: "Redo ({key})",
    finish: "Finish",
  },
  saveError: {
    notMounted: "Editor not mounted",
    noCanvas: "Could not acquire export canvas",
    workerCrashed: "PNG encode worker crashed",
  },
  tools: {
    text: "Text",
    rect: "Rectangle",
    arrow: "Arrow",
    background: "Background",
  },
  background: {
    title: "Add a background",
    close: "Close background picker",
    none: "None",
    gradients: {
      violet: "Violet",
      sunset: "Sunset",
      orchid: "Orchid",
      forest: "Forest",
      flamingo: "Flamingo",
      citrus: "Citrus",
      arctic: "Arctic",
      ocean: "Ocean",
      deep: "Deep",
    },
    solid: "Solid {color}",
    custom: "Pick a custom color",
  },
  inspector: {
    color: "Color {color}",
    size: "{n}px",
    duplicate: "Duplicate",
  },
  textPrompt: "Text",
} as const;
